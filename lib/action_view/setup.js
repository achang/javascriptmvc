JMVC.ActionViewGenerator = function(model, name, proto) {
	name = name ? name : 'show'
	proto = proto || {}
	if(!model) throw 'model doesnt exist'
	
	var action_view;
	
	var new_class_name = name.capitalize()+'View' //AR_Todo.ShowView

	model[new_class_name] = Class.create(JMVC.ActiveView, proto); 
	var new_class = model[new_class_name]

	new_class.view_name = name;

	new_class.element_type = 'div'
	new_class.attribute_type = 'div'
	new_class.label_type = 'label'
	new_class.value_type = 'span'
	//new_class.klass = new_class
	new_class.prototype.klass = new_class
	new_class.prototype.model_klass = model
	new_class.model_klass = model
	new_class.klass = new_class
	
	model.prototype[name] = function(){
		return new new_class(this)
	}
	
	return new_class
}


JMVC.ActiveView = Class.create({
	initialize : function(object) {
		this.fields = []
		this.klass.get_columns().each(function(column_name){
			var column = object.klass().columns_hash()[column_name]
			if(column){
				var override_name = object.klass().klass_name+this.klass.view_name.capitalize()+column_name.capitalize()+'ColumnView'
				if(window[override_name])  // should check for AR_TodoShowCompleteColumnView
					this.fields.push(new window[override_name](object.klass(), column, object[column.name])  )
				else if(JMVC[column.sql_type.capitalize()+'ColumnView']){
					this.fields.push(new JMVC[column.sql_type.capitalize()+'ColumnView'](object.klass(), column, object[column_name])  )
				}else
					this.fields.push(new JMVC.ColumnView(object.klass(), column, object[column_name])  )
				
			}
		}.bind(this))
		this.klass_name = object.klass_name
		this.id = object.id
		//this.object = object
		//this[object.klass_name] = object
	},
	toElement : function() {
		var id = this.klass_name+'_'+this.id;
		var el;
		if(document.getElementById(id))
			el = document.getElementById(id)
		else
			el = document.createElement(this.element_type);
		el.innerHTML = ''
		el.id = id
		el.className = this.klass_name
		el.setAttribute('functional', 'show')
		//this.assign(el)
		this.fields.each(function(field){
			if(!field.column.primary && field.column.name != 'id')
				el.appendChild(field.toElement())
		})
		return el
	},
	add_component : function(attribute, type, innerHtml, element){
		var kind = type ? type : 'attribute'
		
		var comp = element.appendChild( document.createElement(this[kind+'_type']) )
		comp.className = type ? type : attribute;
		comp.setAttribute('functional', 'show_'+attribute+ (type ? '_'+type : ''  )  )
		comp.innerHTML = innerHtml
		this.assign(comp)
		return comp
	},
	element : function(){
		return document.getElementById(this.object.klass_name+'_'+this.object.id)
	},
	createElement : function(nodeName){
		var el = document.createElement(nodeName)
		el.add_component = function(attribute, type, innerHtml, element){
			var comp = element.appendChild( document.createElement(this[type+'_type']) )
			comp.className = type ? type : attribute;
			comp.setAttribute('functional', 'show_'+attribute+ (type ? '_'+type : ''  )  )
			comp.innerHTML = innerHtml
			this.assign(comp)
			return comp
		}
	},
	get_attribute : function(attr_name){
		return this.element().getElementsByClassName(attr_name)[0]
	},
	assign : function(element){
		if(typeof window[this.object.klass_name+'Controller'] == 'undefined') return;
		var functions = window[this.object.klass_name+'Controller'].prototype
		for(var f in functions)
		{
			if(f.startsWith(element.getAttribute('functional')))
			{
				$(element).observe(f.substr( element.getAttribute('functional').length+1 ) , this.call_controller(f) )
			}
		}
	},
	call_controller : function(action_name){
		var controller_name = this.object.klass_name
		var object = this.object
		return function(event){
			var params = {controller:  controller_name, action: action_name, element: this, event: event}
			params[object.klass_name.toLowerCase()] = object
			post( params )
		}
	},
	element_type : 'div',
	attribute_type : 'div',
	label_type : 'label',
	value_type : 'span'
});
JMVC.ActiveView.show_columns = function(){
	var show_columns = $A(arguments)
	//var column_names = this.model_klass.columns().collect(function(column){column.name})
	/*show_columns.each(function(show_col){
		if(!column_names.include(show_col))
			throw(show_col+" isn't in model's columns.")
	})*/
	this.get_columns = function(){
		if(!show_columns)
			return this.model_klass.columns().collect(function(column){column.name})
		return show_columns;
	}
}


JMVC.ColumnView = Class.create({
	initialize: function(klass, column, value) {
		this.column = column
		this.value = value;
		this.model= klass;
	},
	toElement : function(){
		var c = this.make_container()
		c.appendChild(this.make_label())
		c.appendChild(this.make_content())
		return c;
	},
	make_container : function(){
		var el = document.createElement('p')
		el.className = this.model.klass_name;
		el.setAttribute('functional', 'show_'+this.model.klass_name)
		return el;
	},
	make_label : function(){
		var label = document.createElement('label')
		label.className = 'label'
		label.setAttribute('functional', 'show_'+this.model.klass_name+'_label')
		label.innerHTML = this.column.human_name()
		return label;
	},
	make_content : function(){
		var content=document.createElement('span')
		content.className='content'
		content.setAttribute('functional', 'show_'+this.model.klass_name+'_content')
		content.innerHTML = this.column.typecast_attribute(this.value) //TODO : fix
		return content;
	}
})
JMVC.BooleanColumnView = Class.create(JMVC.ColumnView, {
	make_content : function(){
		var content=document.createElement('input')
		content.type='checkbox'
		content.checked = this.value
		content.className='content'
		content.setAttribute('functional', 'show_'+this.model.klass_name+'_content')
		return content;
	}
})



JMVC.library_loaded()