JMVC.ActionViewGenerator = function(klass) {
	var new_class = Class.create(JMVC.ActiveView, {
		model_klass: klass
	});
	new_class.element_type = 'div'
	new_class.attribute_type = 'div'
	new_class.label_type = 'label'
	new_class.value_type = 'span'
	return new_class
}


JMVC.ActiveView = Class.create({
	initialize : function(object) {
		this.object = object
		this[object.klass_name] = object
	},
	show : function() {
		var id = this.object.klass_name+'_'+this.object.id;
		var el;
		if(document.getElementById(id))
			el = document.getElementById(id)
		else
			el = document.createElement(this.element_type);
		el.innerHTML = ''
		el.id = id
		el.className = this.object.klass_name
		el.setAttribute('functional', 'show')
		this.assign(el)
		
		for(var attribute in  this.object.attributes()){
			if(attribute == 'id') continue;
			
			var att = this.add_component(attribute, null, null, el)
			var label =  this.add_component(attribute, 'label', attribute, att)
			var content = this.add_component(attribute, 'value', this.object.attributes()[attribute], att)
			
		}
		
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

JMVC.library_loaded()