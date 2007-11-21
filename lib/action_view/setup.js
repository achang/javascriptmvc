JMVC.ActionViewGenerator = function(model, name, proto) {
	name = name ? name : 'show'
	proto = proto || {}
	if(!model) throw 'model doesnt exist'
	
	var action_view;
	
	var new_class_name = name.capitalize() //AR_Todo.Views.Show

	model.Views[new_class_name] = Class.create(JMVC.ActiveView, proto); 
	var new_class = model.Views[new_class_name]

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
				
				var column_class = object.klass().ColumnViews[column_name.capitalize()]
				var sql_type_column_class = JMVC[column.sql_type.capitalize()+'ColumnView']
				var created_column;
				
				if(column_class)  // should check for AR_TodoShowCompleteColumnView
					created_column = new column_class(this, column_name, object[column.name])
				else if(sql_type_column_class){
					created_column = new sql_type_column_class(this, column_name, object[column_name]) 
				}else
					created_column = new JMVC.ColumnView(this, column_name, object[column_name])
				this.fields.push(created_column)
				this[column_name] = function(){
					return created_column;
				}
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
			el = document.createElement('div');
		el.innerHTML = ''
		el.id = id
		el.className = this.klass_name
		el.setAttribute('functional', 'show')
		//this.assign(el)
		this.fields.each(function(field){
			if(!field.column_name != 'id')
				el.appendChild(field.toElement())
		})
		return el
	},
	//show content onblah | content onblah
	assign : function(element, handler){
		var controller = this.klass.get_controller()
		if(controller == null || handler == null) return element;
		var functions = controller.prototype
		for(var f in functions)
		{
			if(f.startsWith(handler))
			{
				$(element).observe(f.substr( handler.length+1 ) , this.call_controller(f) )
			}
		}
		return element
	},
	call_controller : function(action_name){
		var controller_name = this.klass.controller_name();
		var object = this
		return function(event){
			var params = {controller:  controller_name, action: action_name, view: object, event: event}
			//params[object.klass_name.toLowerCase()] = object
			post( params )
		}
	}
});
JMVC.ActiveView.get_columns = function(){
	return this.model_klass.columns().collect(function(column){column.name})
}
JMVC.ActiveView.show_columns = function(){
	var show_columns = $A(arguments)
	this.get_columns = function(){
		return show_columns;
	}
}
JMVC.ActiveView.get_controller = function(){
	return window[this.model_klass.klass_name+'Controller']
}
JMVC.ActiveView.controller_name = function(){
	return this.model_klass.klass_name.toLowerCase()
}
JMVC.ActiveView.set_controller = function(controller_name){
	this.get_controller = function(){
		return window[controller_name.capitalize()+'Controller']
	}
	this.controller_name = function(){
		return controller_name
	}
}



JMVC.ColumnView = Class.create({
	//probably need to be able to not have a real column
	initialize: function(view_instance, column_name, value) {
		//if() we check to make sure we were built right
		this.view_instance = view_instance
		this.column_name = column_name
		this.value = value;
		this.model= view_instance.klass.model_klass;
		
	},
	toElement : function(){
		var c = this.get_container()
		c.appendChild(this.get_label())
		c.appendChild(this.get_content())
		return c;
	},
	make_container : function(){
		return document.createElement('p');
	},
	make_label : function(){
		var label = document.createElement('label')
		label.innerHTML = this.column_name
		return label;
	},
	make_content : function(){
		var content=document.createElement('span')
		content.innerHTML = this.value
		return content;
	},
	get_container : function(){
		var el = this.make_container()
		el.className = this.model.klass_name;
		this.container = el;
		return this.view_instance.assign(el, this.column_name);
	},
	get_label : function(){
		var el = this.make_label()
		el.className = 'label'
		this.label = el
		return this.view_instance.assign(el, this.column_name+'_label');
	},
	get_content : function(){
		el = this.make_content()
		el.className='content'
		this.content = el //I would put this in a closure, but memory leaks in IE
		return this.view_instance.assign(el, this.column_name+'_content');
	}
})
JMVC.BooleanColumnView = Class.create(JMVC.ColumnView, {
	make_content : function(){
		var content=document.createElement('input')
		content.type='checkbox'
		content.checked = this.value
		return content;
	}
})
/*JMVC.ActiveRecord.prototype.render = function(type, params){
	var klass = this.klass().Views[type.capitalize()]
	if(typeof klass != 'function'){
		klass = JMVC.ActionViewGenerator(this.klass(), type,klass) 
	}
	return new klass(this)
}*/
JMVC.ActiveRecord.Views = {}
JMVC.ActiveRecord.ColumnViews = {}

JMVC.library_loaded()