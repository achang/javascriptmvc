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
	newmodel.className = className;
	newmodel.views = {};
	newmodel.attached =false;
	Object.extend(newmodel.prototype, actions );
	
	
	//create actions
	
	var bubbling_actions = {};
	var non_bubbling_actions = {};
	var controller_actions = {};
	
	
	for(var action_name in actions ){
		var val = actions[action_name];
		if( actions.hasOwnProperty(action_name) && typeof val == 'function') {
			var action = new Controller.Action(action_name, val,className)
			controller_actions[action_name] = action;
			if(! action.event_type) continue;
			if(typeof action.selector != 'string'){
				Event.observe(action.selector, action_name, Controller.event_closure(className, action_name, window) );
			}else if(action.bubbles){
				var et = action.event_type;
				if(!bubbling_actions[et]){
					bubbling_actions[et] = [];
					Event.observe(document.documentElement, action.event_type, Controller.dispatch_event)
				}
				bubbling_actions[et].push(action)
			}else{
				non_bubbling_actions[action_name] = action;
			}
		}
	}
	newmodel.actions = function(){
		return controller_actions;
	};
	newmodel.bubbling_actions = function(){
		return bubbling_actions;
	};
	newmodel.non_bubbling_actions = function(){
		return non_bubbling_actions;
	};
	
	if(window[ className.capitalize()+'View' ]){
		Object.extend(window[ className.capitalize()+'View' ].prototype, Model ) ;
		window[ className.capitalize()+'View' ].prototype.className = className;
	}
	Controller.klasses.push(newmodel);
	
	return newmodel;
};

/**
 * Controller prototype functions
 */
Controller.functions = function(){};
Object.extend(Controller.functions.prototype, {
	initialize : function(){
		
	},
	/**
	 * returns a function that calls an action with the first value passed to it.
	 * @param {Object} action
	 */
	continue_to :function(action){
		if(typeof this[action] != 'function'){ throw 'There is no action named '+action+'. '}
		return function(){
			this.action = action;
			this[action].apply(this, arguments);
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
		var action_css_pairs = this.klass.non_bubbling_actions();
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

/**
 * Controller class functions
 */

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
Controller.dispatch = function(controller, action_name, params){
	if(typeof controller == 'string'){
		controller = window[controller.capitalize()+'Controller'];
	}
	var action = controller.actions()[action_name];
	var instance = new controller();
	instance.params = params;
	instance.action = action;
	var ret_val = instance[action_name](params);
	if(action.attach)
		Controller.attach_all();
	return ret_val;
}


Controller.dispatch_event = function(event){
	var target = event.target;
	var classes = Controller.klasses;
	for(var c = 0 ; c < classes.length; c++){
		var klass= Controller.klasses[c];
		var actions = klass.bubbling_actions()[event.type];
		if(!actions) continue;
		for(var i =0; i < actions.length;  i++){
			var action = actions[i];
			var action_name = action.name;
			var match_result = action.match(target)
			if(match_result){
				Controller.add_stop_event(event);
				var params = new Controller.Params({event: event, element: match_result, action: action_name, controller: klass  });
				return Controller.dispatch(klass, action_name, params)
			}
		}
	}
	if(JMVC.Browser.Opera) Style.deleteRule(0);
}
Controller.attach_all = function(){
	var classes = Controller.klasses;
	for(var c = 0 ; c < classes.length; c++){
		(new classes[c]()).attach_later();
	}
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
			var params = new Controller.Params({event: event, element: element, action: f_name, controller: controller_name   });
			return Controller.dispatch(controller_name, f_name, params);
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


Controller.Params = function(params){
	for(var thing in params){
		if( params.hasOwnProperty(thing) )
			this[thing] = params[thing];
	}
};
Controller.Params.prototype = {
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

Controller.Action = function(name, f,className){
	this.name = name;
	this.func = f;
	this.attach = false;
	
	//selector
	if(name.search(/change|click|contextmenu|dblclick|mousedown|mousemove|mouseout|mouseover|mouseup|reset|resize|select|submit|dblclick|focus|blur|load|unload/) == -1 ) {
		return;		
	}
	var last_space = name.lastIndexOf(' ');
	
	// click, mouseover, etc
	this.event_type = last_space == -1 ? name :name.substring(last_space+1) ;
	this.bubbles = this.event_type.search(/focus|blur|load|unload/) == -1;
	
	var before_space = last_space == -1 ? '' : name.substring(0,last_space);
	
	var singular = className.is_singular()
	
	//now lets figure out the selector
	if(className == 'main'){
		if(last_space == -1){
			//selector is body, or window
			if(name  == 'load' || name == 'resize' || name == 'unload' ){ 
				this.selector =  window
			}else{
				this.selector = '';  // basically makes it body since body is added to everything
			}
		}else{
			this.selector = before_space;
		}
	}else if(singular){
		this.selector = last_space == -1 ? '#'+className : '#'+className+' '+before_space;
	}else{
		if(name.substring(0,1) == "#"){
			var newer_action_name = name.substring(1,action_name.length);
			last_space = newer_action_name.lastIndexOf(' ');
			this.selector = last_space == -1 ? '#'+className : '#'+className+newer_action_name.substring(0,last_space);
		}else{
			this.selector = last_space == -1 ? '.'+className.singularize() : '.'+className.singularize()+' '+before_space;
		}
	}
}
Controller.Action.prototype = {
	selector_order : function(){
		if(this.order) return this.order;
		
		var selector_parts = this.selector.split(/\s+/);
		var patterns = {tag :    		/^\s*(\*|[\w\-]+)(\b|$)?/,
        				id :            /^#([\w\-\*]+)(\b|$)/,
    					className :     /^\.([\w\-\*]+)(\b|$)/};
		
		var order = [];
		for(var i =0; i< selector_parts.length; i++){
			var v = {}, r;
			var p =selector_parts[i];
			for(var attr in patterns){
				if( (r = p.match(patterns[attr]))  ) {
					if(attr == 'tag'){
						v[attr] = r[1].toUpperCase();
					}else{
						v[attr] = r[1];
					}
					
					p.replace(r[0],'')
				}
			}
			order.push(v)
		}
		this.order = order;
		return this.order;
	},
	node_path : function(el){
		var body = document.body;
		var parents = [];
		var iterator =el;
		while(iterator != body){
			parents.unshift({tag: iterator.nodeName, className: iterator.className, id: iterator.id, element: iterator});
			iterator = iterator.parentNode;
		}
		return parents;
	},
	match : function(el){
		var docEl = document.documentElement;
		var body = document.body;
		if(el == docEl || el==body) return false;
		
		
		var parents = this.node_path(el);

		var matching = 0;
		for(var n=0; n < parents.length; n++){
			var node = parents[n];
			var match = this.selector_order()[matching];
			var matched = true;
			for(var attr in match){
				if(!match.hasOwnProperty(attr) || attr == 'element') continue;
				if(match[attr] && node[attr] != match[attr]){
					matched = false;
				}
			}
			if(matched){
				matching++;
				if(matching >= this.selector_order().length){
					return node.element;
				}
			}
		}
		return false;
	}
}





Model = {
	appendAsChildOf : function(element){
		this.element = element.appendChild( this.toElement() );
		new window[this.className.capitalize()+'Controller']().attach_event_handlers_to(this.element);
		return this.element;
	},
	toElement : function(){
		if(this.element) return this.element;
		this.element = this.createElement();
		return this.element;
	},
	insertBefore : function(element){
		this.element = element.parentNode.insertBefore(this.toElement() , element );
		new window[this.className.capitalize()+'Controller']().attach_event_handlers_to(this.element);
		return this.element;
	}
};

Event.observe(window, "load",Controller.attach_all);



