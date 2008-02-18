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
	newmodel.attached =false;
	Object.extend(newmodel.prototype, actions );
	var handler_names = {};
	var non_bubbling_handler_names = {};
	//blur, focus
	for(var action_name in actions ){
		if( actions.hasOwnProperty(action_name) && 
			action_name.search(/change|click|mousedown|mousemove|mouseout|mouseover|mouseup|reset|resize|select|submit|dblclick|focus|blur|load|unload/) != -1 ) {
			
			var selector ='';
			var last_space = action_name.lastIndexOf(' ');
			if(className == 'main'){
				if(last_space == -1){
					//selector is body, or window
					if(action_name  == 'load' || action_name == 'resize' || action_name == 'unload' ){
						Event.observe(window, action_name, Controller.event_closure(className, action_name, window) );
						continue;
					}else{
						selector = '';
					}
				}else{
					selector = action_name.substring(0,last_space);
				}
			}else if(singular){
				selector = last_space == -1 ? '#'+className : '#'+className+action_name.substring(0,last_space)
			}else{
				if(action_name.substring(0,1) == "#"){
					var newer_action_name = action_name.substring(1,action_name.length);
					last_space = newer_action_name.lastIndexOf(' ');
					selector = last_space == -1 ? '#'+className : '#'+className+newer_action_name.substring(0,last_space)
				}else{
					selector = last_space == -1 ? '.'+className.singularize() : '.'+className.singularize()+' '+action_name.substring(0,last_space)
				}
			}
			
			if(action_name.search( /change|click|mousedown|mousemove|mouseout|mouseover|mouseup|reset|select|submit|dblclick/ ) != -1){
				handler_names[action_name] = selector;
			}else if(action_name.search(/[focus|blur|load|unload]/) != -1){
				non_bubbling_handler_names[action_name] = selector;
			}
			
		}
	}
	newmodel.bubble_handlers = function(){
		return handler_names;
	};
	newmodel.non_bubble_handlers = function(){
		return non_bubbling_handler_names;
	};
	
	if(window[ className.capitalize()+'View' ]){
		Object.extend(window[ className.capitalize()+'View' ].prototype, Model ) ;
		window[ className.capitalize()+'View' ].prototype.className = className;
	}
	Controller.klasses.push(newmodel);
	
	return newmodel;
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


Controller.functions = function(){};
Controller.klasses = [];

Controller.add_stop_event = function(event){
	if(!event.stop)
		event.stop = function(){
			if(!event) event = window.event;
		    try{
		    event.cancelBubble = true;
		    
		    if (event.stopPropagation) 
		        event.stopPropagation(); 
		        
		    if (event.preventDefault) 
		        event.preventDefault();
			if(Event.stop) Event.stop(event);
		    }catch(e)
		    {}
		    return false;
		};
};



(function(){

	var functions = {};
	var controller_id = 0;
	/**
	 * Creates a new event closure for a controller
	 * @param {Object} controller_name - name of the controller, ex: TodoController
	 * @param {Object} f_name - name of the action or function
	 * @param {Object} element - element this is called on
	 * @return {Function} returns a function that calls a controller action
	 */
	var new_event_closure_function = function(controller_name, f_name, element){
		return function(event){
			Controller.add_stop_event(event);
			var params = new Controller.params({event: event, element: element, action: f_name, controller: controller_name   });
			return Controller.dispatcher(controller_name, f_name, params);
		}
	};
	/**
	 * For a controller, action, element, returns a function event closure
	 * @param {Object} controller_name
	 * @param {Object} f_name
	 * @param {Object} element
	 */
	Controller.event_closure = function(controller_name, f_name, element){
		if(!element.controller_id) element.controller_id = ++controller_id;
		
		if(! functions[controller_name]){
			functions[controller_name] = {};
			functions[controller_name][f_name] = {};
			functions[controller_name][f_name][element.controller_id] = new_event_closure_function(controller_name, f_name, element);
		}else if(!functions[controller_name][f_name]){
			functions[controller_name][f_name] = {};
			functions[controller_name][f_name][element.controller_id] = new_event_closure_function(controller_name, f_name, element);
		}else if(!functions[controller_name][f_name][element.controller_id] ){
			functions[controller_name][f_name][element.controller_id] = new_event_closure_function(controller_name, f_name, element);
		}
		return functions[controller_name][f_name][element.controller_id];
	};
	
})();

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
	},
	attach_later : function(){
		var thsOb = this;
		if(this.className == 'main' && this.klass.attached) return;
		if(this.timeout) window.clearTimeout(this.timeout)
		this.timeout = setTimeout(function(){
			thsOb.attach.apply(thsOb, arguments);
		}, 100);
	},
	attach : function(){
		this.klass.attached = true;
		var action_css_pairs = this.klass.non_bubble_handlers();
		for(var action_name in action_css_pairs){
			if( action_css_pairs.hasOwnProperty(action_name)){
				var selector = action_css_pairs[action_name];
				var els = $$(selector);
				for(var e=0; e < els.length; e++){
					this.attach_event_handlers_to(els[e],action_name);
				}
			}
		}
	},
	attach_event_handlers_to : function(el,action_name){
		var handler_name = action_name
		var last_space = action_name.lastIndexOf(' ');
		if(last_space != -1){
			handler_name = action_name.substring(last_space+1)
		}
		
		if(handler_name == 'contextmenu'){
			el.oncontextmenu = Controller.event_closure(this.className, event_function,el);
		}else if(handler_name == 'load' && this.klass_name != 'MainController'){
			new this.klass().load({element: el});
		}else{
			Event.stopObserving(el, handler_name, Controller.event_closure(this.className, action_name,el ));
			Event.observe(el, handler_name, Controller.event_closure(this.className, action_name,el ) );
		}
	}
});

Controller.dispatcher = function(controller, action_name, params){
	if(typeof controller == 'string'){
		controller = window[controller.capitalize()+'Controller'];
	}
	var instance = new controller();
	instance.params = params;
	instance.action = action_name
	var ret_val = instance[action_name](params);
	Controller.attach_all();
	return ret_val;
}


Controller.dispatch = function(event){

	var target = event.target;
	var classes = Controller.klasses;
	
	var before = Style.getComputed(target)[Style.option.js()]
	for(var c = 0 ; c < classes.length; c++){
		var klass= Controller.klasses[c];
		var action_css_pairs = klass.bubble_handlers();
		for(var action_name in action_css_pairs){
			if( action_css_pairs.hasOwnProperty(action_name) && action_name.indexOf(event.type) != -1  ){

				var selector = action_css_pairs[action_name];

				Style.insertRule('body '+selector,Style.option.value(before),0)
				var after = Style.getComputed(target)[Style.option.js()]
				Style.deleteRule(0)
				if(Style.option.check(before, after)){
					Controller.add_stop_event(event);
					var params = new Controller.params({event: event, element: target, action: action_name, controller: klass  });
					return Controller.dispatcher(klass, action_name, params)
				}
			}
		}
	}
	if(JMVC.Browser.Opera)
		Style.deleteRule(0)
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

Controller.attach_all = function(){
	var classes = Controller.klasses;
	for(var c = 0 ; c < classes.length; c++){
		(new classes[c]()).attach_later();
	}
};

Event.observe(window, "load",Controller.attach_all);

Event.observe(document.documentElement, 'change', Controller.dispatch)
Event.observe(document.documentElement, 'click', Controller.dispatch)
Event.observe(document.documentElement, 'mousedown', Controller.dispatch)
//Event.observe(document.documentElement, 'mousemove', Controller.dispatch)
Event.observe(document.documentElement, 'mouseout', Controller.dispatch)
Event.observe(document.documentElement, 'mouseover', Controller.dispatch)
Event.observe(document.documentElement, 'mouseup', Controller.dispatch)
Event.observe(document.documentElement, 'reset', Controller.dispatch)
Event.observe(document.documentElement, 'select', Controller.dispatch)
Event.observe(document.documentElement, 'submit', Controller.dispatch)

Event.observe(document.documentElement, 'dblclick', Controller.dispatch)



