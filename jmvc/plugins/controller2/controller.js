
/**
 * Creates a new controller object with actions
 * @param {String} model - The name of the controller type.  Example: todo.
 * @param {Object} actions - a hash of functions that get added to the controller's prototype
 */
Controller = function(model, actions){
	var className= model, newmodel = null, singular = model.is_singular();
	
	model = model.capitalize()+'Controller';

	newmodel = eval(model + " = function() { this.klass = "+model+"; "+
				"this.initialize.apply(this, arguments);"+
				"};");

	var controller_functions = new Controller.functions();
	newmodel.prototype = controller_functions;
	newmodel.prototype.klass_name = 	model;
	newmodel.prototype.className = className;
	newmodel.views = {};
	Object.extend(newmodel.prototype, actions );
	var handler_names = {};
	for(var action_name in actions ){
		if( actions.hasOwnProperty(action_name) && action_name.search(/[blur|click|contextmenu|dblclick|keypress|load|mouseover|mouseout|resize|unload|submit]/) != -1 ) {
			var selector ='';
			var last_space = action_name.lastIndexOf(' ');
			if(singular){
				selector = last_space == -1 ? '#'+className : '#'+className+action_name.substring(0,last_space)
			}else{
				if(action_name.substring(0,1) == "#"){
					var newer_action_name = action_name.substring(1,action_name.length);
					last_space = newer_action_name.lastIndexOf(' ');
					selector = last_space == -1 ? '#'+className : '#'+className+newer_action_name.substring(0,last_space)
				}else{
					selector = last_space == -1 ? '.'+className.singularize() : '.'+className.singularize()+action_name.substring(0,last_space)
				}
			}
			handler_names[action_name] = selector;
		}
	}
	newmodel.event_handler_function_names = function(){
		return handler_names;
	};
	
	if(window[ className.capitalize()+'View' ]){
		Object.extend(window[ className.capitalize()+'View' ].prototype, Model ) ;
		window[ className.capitalize()+'View' ].prototype.className = className;
	}
	Controller.klasses.push(newmodel);
	return new newmodel();
};

Controller.params = function(params){
	for(var thing in params){
		if( params.hasOwnProperty(thing) )
			this[thing] = params[thing];
	}
};
Controller.params.prototype = {
	form_params : function(){
		var data = {};
		if(this.element.nodeName.toLowerCase() != 'form') return data;
		var els = this.element.elements;
		var uri_params = [];
		for(var i=0; i < els.length; i++){
			var el = els[i];
			if(el.type.toLowerCase()=='submit') continue;
			var key = el.name, value = el.value;

			var key_components = key.rsplit(/\[[^\]]*\]/);
			if( key_components.length > 1 ) {
				var last = key_components.length - 1;
				var nested_key = key_components[0].toString();
				if(! data[nested_key] ) data[nested_key] = {};
				var nested_hash = data[nested_key];
				
				for(var k = 1; k < last; k++){
					nested_key = key_components[k].substring(1, key_components[k].length - 1);
					if( ! nested_hash[nested_key] ) nested_hash[nested_key] ={};
					nested_hash = nested_hash[nested_key];
				}
				nested_hash[ key_components[last].substring(1, key_components[last].length - 1) ] = value;
			} else {
		        if (key in data) {
		        	if (typeof data[key] == 'string' ) data[key] = [data[key]];
		         	data[key].push(value);
		        }
		        else data[key] = value;
			}
		}

		return data;
	},
	class_element : function(){
		var start = this.element
		var controller = this.controller
		while(start && start.className.indexOf(controller) == -1 ){
			start = start.parentNode;
			if(start == document) return null;
		}
		return start;
	},
	object_data : function(){
		return View.Helpers.get_data(this.class_element())
	}
};

/**
 * This is the default constructor for a controller
 */
Controller.functions = function(){};
/**
 * a list of all created controller classes
 */
Controller.klasses = [];


Object.extend(Controller.functions.prototype, {
	initialize : function(){
		
	},
	/**
	 * returns a function that calls an action with the first value passed to it.
	 * TODO: this should be changed to call all the args with it.
	 * @param {Object} action
	 */
	continue_to :function(action){
		if(typeof this[action] != 'function'){ throw 'There is no action named '+action+'. '}
		return function(response){
			this.action = action;
			this[action](response);
			//this.attach_event_handlers()
		}.bind(this)
	}
});




Controller.dispatch = function(event){

	var target = event.target;

	var classes = Controller.klasses;
	
	var before = Style.getComputed(target)[Style.option.js()]
	for(var c = 0 ; c < classes.length; c++){
		var klass= Controller.klasses[c];
		var action_css_pairs = klass.event_handler_function_names();
		for(var action_name in action_css_pairs){
			if( action_css_pairs.hasOwnProperty(action_name) && action_name.indexOf(event.type) != -1  ){

				var selector = action_css_pairs[action_name];

				Style.insertRule('body '+selector,Style.option.value(before),0)

				var after = Style.getComputed(target)[Style.option.js()]
				Style.deleteRule(0)
				if(Style.option.check(before, after)){
					var instance = new klass();
					var params = new Controller.params({event: event, element: target, action: action_name, controller: klass  });
					instance.params = params;
					instance.action = action_name;
					return instance[action_name](params);
					
				}
			}
		}
	}
}

Style = {};
(function(){
	var ss = document.createElement('style');
	ss.type = 'text/css';
	try{
		var sst = document.createTextNode('#JAVASCRIPTMVC {}');
		ss.appendChild(sst);
	}catch(e){}
	document.getElementsByTagName('head')[0].appendChild(ss);
	
	if(window.getComputedStyle)
		Style.getComputed = function(element){ return window.getComputedStyle(element, null); };
	else
		Style.getComputed = function(element){ return element.currentStyle; };
	var style = document.styleSheets[0];
	
	//Style.option = {js :'fontFamily', css: 'font-family', value: 'JavaScriptMVC'};

	if(style.insertRule){
		Style.insertRule = function(selector, stile, n){ style.insertRule(selector+' {'+stile+';}',n) };
		Style.deleteRule = function(n){ style.deleteRule(n) };
	}else{
		Style.insertRule = function(selector, stile, n){ style.addRule(selector, stile,n) };
		Style.deleteRule = function(n){ style.removeRule(n) };
	}
	Style.option = {}
	if(JMVC.Browser.IE || JMVC.Browser.Gecko){
		Style.option.js = function(){return 'fontFamily';};
		Style.option.css = function(){return 'font-family';};
		Style.option.value = function(before){return Style.option.css()+': '+before+', JavaScriptMVC'};
		Style.option.check = function(before, after){return after.indexOf('JavaScriptMVC') != -1;};
	}else if(JMVC.Browser.Opera || JMVC.Browser.WebKit){
		Style.option.js = function(){return 'cursor';};
		Style.option.css = function(){return 'cursor';};
		Style.option.value = function(before){return Style.option.css()+': se-resize'};
		Style.option.check = function(before, after){ return after.indexOf('se-resize') != -1; };
	}
})();




Event.observe(document.body, 'click', Controller.dispatch)
//Event.observe(document.body, 'mouseover', Controller.dispatch)
//Event.observe(document.body, 'mouseout', Controller.dispatch)
//Event.observe(document.body, 'dblclick', Controller.dispatch)