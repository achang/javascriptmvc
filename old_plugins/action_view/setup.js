JMVC.ActionMVC.ViewGenerator = function(model, name, proto) {
	name = name ? name : 'show'
	proto = proto || {}
	if(!model) throw 'model doesnt exist'
	
	var action_view;
	
	var new_class_name = name.capitalize() //AR_Todo.MVC.View.Show

	model.MVC.View[new_class_name] = Class.create(JMVC.ActiveMVC.View, proto); 
	var new_class = model.MVC.View[new_class_name]

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


JMVC.ActiveMVC.View = Class.create({
	initialize : function(object) {
		this.fields = []
		this.klass.get_columns().each(function(column_name){
			var column = object.klass().columns_hash()[column_name]
			if(column){
				var view_klass = object.klass().MVC.View[this.klass.view_name.capitalize()]
				var column_class
				if(view_klass)
					column_class = object.klass().MVC.View[this.klass.view_name.capitalize()][column_name.capitalize()] //AR_Todo.MVC.View.Show.Complete
				
				var sql_type_column_class = JMVC.ColumnMVC.View[column.sql_type.capitalize()]
				var created_column;
				
				if(column_class)
					created_column = new column_class(this, column_name, object[column.name])
				else if(sql_type_column_class){
					created_column = new sql_type_column_class(this, column_name, object[column_name]) 
				}else
					created_column = new JMVC.ColumnMVC.View(this, column_name, object[column_name])
					
				this.fields.push(created_column)
				this[column_name] = function(){
					return created_column;
				}
			}
		}.bind(this))
		
		this.display_klass = object.klass_name
		this.id = object.id
		//this.object = object
		//this[object.klass_name] = object
	},
	toElement : function() {
		var id = this.display_klass+'_'+this.id;
		var el;
		//if(document.getElementById(id))
		//	el = document.getElementById(id)
		//else
			el = document.createElement('div');
		el.innerHTML = ''
		el.id = id
		el.className = this.display_klass+' '+this.klass.view_name
		el.setAttribute('functional', 'show')
		this.element = el
		this.assign(el,this.display_klass.toLowerCase())
		
		this.fields.each(function(field){
			if(!field.column_name != 'id')
				el.appendChild(field.toElement())
				//el.appendChild( document.createTextNode('') )
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
			if(f.startsWith(handler+'_'+this.klass.view_name))
			{
				$(element).observe(f.substr( handler.length+this.klass.view_name.length+2 ) , this.call_controller(f) )
			}else if(f.startsWith(handler)){
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
	},
	replace_with : function(new_view_name){
		new_view_klass = this.model_klass.MVC.View[new_view_name.capitalize()]
		if(!new_view_klass) throw 'bad view name'
		// build object ...
		var new_attributes = {id: this.id}
		this.fields.each(function(field){
			new_attributes[field.get_name()] = field.get_value()
		})
		var new_object = new this.model_klass(new_attributes)
		var new_view = new_object[new_view_name]()
		this.element.replace(new_view.toElement() )
		return new_view
		// 
		//this.model_klass.MVC.View[new_class_name]
		//return new [new_view_name](this)
	}
});

JMVC.ActiveMVC.View.get_columns = function(){
	return this.model_klass.columns().collect(function(column){column.name})
}
JMVC.ActiveMVC.View.show_columns = function(){
	var show_columns = $A(arguments)
	this.get_columns = function(){
		return show_columns;
	}
}
JMVC.ActiveMVC.View.get_controller = function(){
	return window[this.model_klass.klass_name+'Controller']
}
JMVC.ActiveMVC.View.controller_name = function(){
	return this.model_klass.klass_name.toLowerCase()
}
JMVC.ActiveMVC.View.set_controller = function(controller_name){
	this.get_controller = function(){
		return window[controller_name.capitalize()+'Controller']
	}
	this.controller_name = function(){
		return controller_name
	}
}

 //we can build element right away, just not put it in anything.
 //then we can call update(value) after creating it to set value
 //update would alway update the value of the element
 //if you have something other than a single element with your value
 //you would have to rewrite it
 //

JMVC.ColumnMVC.View = Class.create({
	//probably need to be able to not have a real column
	initialize: function(view_instance, column_name, value) {
		//if() we check to make sure we were built right
		this.view_instance = view_instance
		this.column_name = column_name
		this.value = value;
		this.model= view_instance.klass.model_klass;
		this.get_value = function(){
			return value
		}
		this.get_name = function(){
			return column_name
		}
		
	},
	toElement : function(){
		var c = this.get_container()
		c.appendChild(this.get_label())
		c.appendChild(this.get_content())
		return c;
	},
	make_container : function(){
		return document.createElement('div');
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
		el.setAttribute('view_attribute',this.column_name)
		//el.setAttribute('view_type', this.column_name)
		//el.setAttribute('view_value',this.value) -> should contian somehow, don't need an extra one.
		this.content = el //I would put this in a closure, but memory leaks in IE
		return this.view_instance.assign(el, this.column_name+'_content');
	},
	set_value : function(value){
		if(value)
			this.value = value;
		this.content.innerHTML = this.value;
	},
	set_label : function(value){
		if(value)
			this.column_name = value;
		this.content.innerHTML = this.column_name;
	},
	set_type : function(value){
		
	} //no label, no container, information should be intrinsic to element
})

JMVC.ColumnMVC.View.Boolean = Class.create(JMVC.ColumnMVC.View, {
	make_content : function(){
		var content=document.createElement('input')
		content.type='checkbox'
		content.checked = this.value
		content.disabled = true
		return content;
	}
})
JMVC.ColumnMVC.View.Boolean.Edit = Class.create(JMVC.ColumnMVC.View.Boolean, {
	make_content : function($super){
		var content = $super()
		content.disabled = false;
		return content;
	}
})
JMVC.ColumnMVC.View.String = Class.create(JMVC.ColumnMVC.View, {
})
JMVC.ColumnMVC.View.String.Edit = Class.create(JMVC.ColumnMVC.View.String, {
	make_content : function(){
		var content=document.createElement('input')
		content.type='text'
		content.value = this.value
		return content;
	}
})


/*JMVC.ActiveRecord.prototype.render = function(type, params){
	var klass = this.klass().MVC.Views[type.capitalize()]
	if(typeof klass != 'function'){
		klass = JMVC.ActionMVC.ViewGenerator(this.klass(), type,klass) 
	}
	return new klass(this)
}*/
JMVC.ActiveRecord.MVC.View = {}
JMVC.ActiveRecord.ColumnMVC.Views = {}

JMVC.library_loaded()