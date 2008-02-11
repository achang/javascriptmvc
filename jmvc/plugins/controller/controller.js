/**
 * Creates a new controller object with actions
 * @param {String} model - The name of the controller type.  Example: todo.
 * @param {Object} actions - a hash of functions that get added to the controller's prototype
 */
Controller = function(model, actions){
	var className= model, newmodel = null;
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
	var handler_names = [];
	for(var action_name in actions ){
		if( action_name.search(/[click|mouseover|mouseout|load|resize|dblclick|contextmenu|blur|keypress|unload|submit]/) != -1 ) {
			handler_names.push(action_name);
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
			var instance = new window[controller_name];
			if(!event.stop){
				event.stop = function(){
					stopPropagation(event);
				};
			}
			
			
			var params = new Controller.params({event: event, element: element, action: f_name, controller: controller_name   });
			instance.params = params;
			instance.action = f_name;
			
			
			
			if(JMVC.handle_error){
				try{
					return instance[f_name](params);
				}catch(e){
					JMVC.handle_error(new ControllerError(e, controller_name, f_name, params))
				}
			}else{
				return instance[f_name](params);
			}
			//instance.attach_event_handlers()
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

Controller.main_events = {'load' : window, 'resize': window, 'unload' : window}; //everything else is document if single or document.body

Object.extend(Controller.functions.prototype, {
	/**
	 * attaches event handlers to an element
	 *  Takes an element as its first parameter and a list of controller names as the second parameters
	 *  If only 1 parameter is given, uses the current controller to attach event handlers
	 *  Examples: this.attach(el)
	 *  		  this.attach(el, 'todo','notes')
	 */
	attach : function(){
		var element = arguments[0];
		if(arguments.length == 1){
			return this.attach_event_handlers(element);
		}
		for(var i = 1; i < arguments.length; i ++){
			new window[arguments[i].capitalize()+'Controller']().attach_event_handlers(element );
		}
	},
	/**
	 * does the same as attach, but sets a timeout so it will happen after the page gets a chance to render
	 */
	attach_later : function(){
		var args = arguments;
		var thsOb = this;
		setTimeout(function(){
			thsOb.attach.apply(thsOb, args);
		}, 10);
	},
	/**
	 * 
	 * @param {Object} element
	 * @param {Object} to_controller
	 */
	attach_to : function(element, to_controller){
		if(!to_controller){
			this.attach_event_handlers_to(element);
			return;
		}
		new window[to_controller.capitalize()+'Controller']().attach_event_handlers_to(element );
		//new MenuController().attach_event_handlers_to(menu );
	},
	/**
	 * 
	 * @param {Object} start_element
	 */
	attach_event_handlers : function(start_element){
		start_element = start_element || document.body;
		var els;
		if(this.klass_name == 'MainController') 
		  els = [document];
		else
		  els = start_element.getElementsByClassName(this.className);
		for(var e=0; e < els.length; e++){
			this.attach_event_handlers_to(els[e]);
		}
	},
	attach_event_handlers_to : function(el){
		var event_functions = this.klass.event_handler_function_names();
		for(var i=0; i< event_functions.length; i++){
			
			var event_function = event_functions[i];
	
			var last_space = event_function.lastIndexOf(' ');
			var event_els , handler_name;
			if(last_space == -1){
				event_els = [el];
				handler_name = event_function;
			}else{
				handler_name = event_function.substring(last_space+1);
				if(this.klass_name == 'MainController' && el == document){
					event_els = $$(event_function.substring(0, last_space));
				}else{
					event_els = $$.descendant(el,event_function.substring(0, last_space) );
				}
				
				
				//el.getElementsBySelector(event_function.substring(0, last_space));
			}
			if( (handler_name == 'load' || handler_name == 'resize' || handler_name == 'unload') && this.klass_name == 'MainController'){
				event_els= [window];
			}
			event_els = event_els || [];
			for(var he = 0; he < event_els.length; he++){
				if(handler_name == 'contextmenu'){
					event_els[he].oncontextmenu = Controller.event_closure(this.klass_name, event_function,event_els[he] );
				}else if(handler_name == 'load' && this.klass_name != 'MainController'){
					new this.klass().load({element: event_els[he]});
				}else{
				Event.stopObserving(event_els[he], handler_name, Controller.event_closure(this.klass_name, event_function,event_els[he] ));
				Event.observe(event_els[he], handler_name, Controller.event_closure(this.klass_name, event_function,event_els[he] ) );
				}
			}
		}
	},
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

/**
 * Stops an event
 * @param {Object} event
 */
function stopPropagation(event)
{
    if(!event)
            event = window.event;
    try{
	
    event.cancelBubble = true;
    
    if (event.stopPropagation) 
        event.stopPropagation(); 
        
    if (event.preventDefault) 
        event.preventDefault();
	if(Event.stop) //this should be moved elsewhere
		Event.stop(event);
    }catch(e)
    {}
    return false;
};

/**
 * An error that controllers create
 * @param {Object} error
 * @param {Object} controller_name
 * @param {Object} action_name
 * @param {Object} params
 */
ControllerError = function(error, controller_name, action_name, params){
	this.error = error;
	this.controller = controller_name;
	this.action = action_name;
	this.params = params;
};

ControllerError.prototype = {
	location : function(){
		return location.href+" [controller:"+this.controller+", action:"+this.action+"]";
	},
	title : function(){
		return this.location() + ' '+this.error;
	},
	browser : function(){
		return navigator.userAgent;
	},
	message : function(){
		return ['There was an error at '+this.location(),
				'Error: '+this.error,
				'Browser: '+this.browser()].join("\n");
	},
	toString : function(){
		return this.message();
	}
};

