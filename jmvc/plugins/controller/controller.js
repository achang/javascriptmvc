/**
 * Creates a new controller object with actions
 * @param {String} model - The name of the controller type.  Example: todo.
 * @param {Object} actions - a hash of functions that get added to the controller's prototype
 */
$MVC.Controller = function(model, actions){
	var className= model, newmodel = null, singular = model.is_singular();
	model = model.capitalize()+'Controller';
	newmodel = eval(model + " = function() { this.klass = "+model+"; "+
				"this.initialize.apply(this, arguments);"+
				"};");

	var controller_functions = new $MVC.Controller.functions();
	newmodel.prototype = controller_functions;
	newmodel.prototype.klass_name = 	model;
	newmodel.prototype.className = className;
	newmodel.className = className;
	newmodel.views = {};
	newmodel.attached =false;
	Object.extend(newmodel.prototype, actions );
	
	
	//create actions
	
	var registered_actions = {};
	var controller_actions = {};
	newmodel.add_register_action = function(action,observe_on, event_type, capture){
		if(!registered_actions[event_type]){
			registered_actions[event_type] = [];
			$MVC.Event.observe(observe_on, event_type, $MVC.Controller.dispatch_event, capture);
		}
		registered_actions[event_type].push(action);
	};
	
	for(var action_name in actions ){
		var val = actions[action_name];
		if( actions.hasOwnProperty(action_name) && typeof val == 'function') {
			var action = new $MVC.Controller.Action(action_name, val,newmodel);
			controller_actions[action_name] = action;
		}
	}
	newmodel.actions = function(){
		return controller_actions;
	};
	newmodel.registered_actions = function(){
		return registered_actions;
	};
	
	if(window[ className.capitalize()+'$MVC.View' ]){
		Object.extend(window[ className.capitalize()+'$MVC.View' ].prototype, Model ) ;
		window[ className.capitalize()+'$MVC.View' ].prototype.className = className;
	}
	$MVC.Controller.klasses.push(newmodel);
	
	return newmodel;
};

/**
 * $MVC.Controller prototype functions
 */
$MVC.Controller.functions = function(){};
Object.extend($MVC.Controller.functions.prototype, {
	initialize : function(){
		
	},
	/**
	 * returns a function that calls an action with the first value passed to it.
	 * @param {Object} action
	 */
	continue_to :function(action){
		if(!action) action = this.action.name+'ing';
		if(typeof this[action] != 'function'){ throw 'There is no action named '+action+'. ';}
		return function(){
			this.action = this.klass.actions()[action];
			this[action].apply(this, arguments);
		}.bind(this);
	}
});

/**
 * $MVC.Controller class functions
 */

$MVC.Controller.klasses = [];
$MVC.Controller.add_kill_event = function(event){
	if(!event.kill){
		var killed = false;
		event.kill = function(){
			killed = true;
			if(!event) event = window.event;
		    try{
		    event.cancelBubble = true;
		    
		    if (event.stopPropagation) 
		        event.stopPropagation(); 
		        
		    if (event.preventDefault) 
		        event.preventDefault();

		    }catch(e)
		    {}
		    return false;
		};
		event.is_killed = function(){
			return killed;
		}
		
	}
		
		
};


$MVC.Controller.dispatch = function(controller, action_name, params){
	var c_name = controller;
	if(typeof controller == 'string'){
		controller = window[controller.capitalize()+'Controller'];
	}
	if(!controller) 'No controller named '+c_name+' was found for $MVC.Controller.dispatch.';
	if(!action_name) action_name = 'index';
	
	if(typeof action_name == 'string'){
		if(!(action_name in controller.actions()) ) throw 'No action named '+action+' was found for '+c_name+'.';
	}else{ //action passed
		action_name = action_name.name;
	}

	var action = controller.actions()[action_name];
	var instance = new controller();
	instance.params = params;
	instance.action = action;
	var ret_val = instance[action_name](params);
	action.after_filters();
	//params.event.stop();
	return ret_val;
};

$MVC.Controller.node_path = function(el){
		var body = document.body;
		var parents = [];
		var iterator =el;
		while(iterator != body){
			parents.unshift({tag: iterator.nodeName, className: iterator.className, id: iterator.id, element: iterator});
			iterator = iterator.parentNode;
			if(iterator == null)
				return []; // this handles the case that something earlier removed the element or one of its parents.  We can't really match
				//this
		}
		return parents;
};


$MVC.Controller.dispatch_event = function(event){
	var target = event.target;
	var classes = $MVC.Controller.klasses;
	var matched = false, ret_value = true;
	//this function wouldn't be called unless someone wanted to check something:
	var parents_path = $MVC.Controller.node_path(target)
	var matches = [];
	for(var c = 0 ; c < classes.length; c++){
		var klass= $MVC.Controller.klasses[c];
		var actions = klass.registered_actions()[event.type];
		if(!actions) continue;
		//lets get node_list
		
		
		for(var i =0; i < actions.length;  i++){
			var action = actions[i];
			var match_result = action.match(target, event, parents_path);
			
			if(match_result){
				match_result.controller = klass;
				matches.push(match_result);
			}
		}
	}
	if(matches.length == 0) return;
	
	$MVC.Controller.add_kill_event(event);
	
	matches.sort(function(a,b){
		if(a.order < b.order) return 1;
		if(b.order < a.order) return -1;
		return 0;
	})
	
	for(var m = 0; m < matches.length; m++){
		var match = matches[m];
		var action_name = match.action.name;
		
		var params = new $MVC.Controller.Params({event: event, element: match.node, action: action_name, controller: match.controller  });
		ret_value = $MVC.Controller.dispatch(match.controller, action_name, params) && ret_value;
		
		if(event.is_killed()) return;
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
			$MVC.Controller.add_kill_event(event);
			var params = new $MVC.Controller.Params({event: event, element: element, action: f_name, controller: controller_name   });
			return $MVC.Controller.dispatch(controller_name, f_name, params);
		}
	};
	/**
	 * For a controller, action, element, returns a function event closure
	 * @param {Object} controller_name
	 * @param {Object} f_name
	 * @param {Object} element
	 */
	$MVC.Controller.event_closure = function(controller_name, f_name, element){
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


$MVC.Controller.Params = function(params){
	for(var thing in params){
		if( params.hasOwnProperty(thing) )
			this[thing] = params[thing];
	}
};
String.is_number = function(value){
	if(typeof value == 'number') return true;
	if(typeof value != 'string') return false;
	return value.match(/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/);
};

$MVC.Controller.Params.prototype = {
	form_params : function(){
		var data = {};
		if(this.element.nodeName.toLowerCase() != 'form') return data;
		var els = this.element.elements;
		var uri_params = [];
		for(var i=0; i < els.length; i++){
			var el = els[i];
			if(el.type.toLowerCase()=='submit') continue;
			var key = el.name, value = el.value;
			if(String.is_number(value) ) value = parseFloat(value);
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
		var start = this.element;
		var controller = this.controller;
		var className = controller.className.is_singular() ? controller.className : controller.className.singularize();
		while(start && start.className.indexOf(className) == -1 ){
			start = start.parentNode;
			if(start == document) return null;
		}
		return start;
	},
	object_data : function(){
		return $MVC.View.Helpers.get_data(this.class_element());
	}
};




//Assume this takes only good and possible things for its browser
// onsubmit is captured for everything other than IE
// onsubmit becomes +' input', mouseup and onkeyup, mouseup in IE, 
//		filter activated, mouseup and type == submit, keyup, type == value
// onfocus becomes activate in IE, filter activated
// onblur becomes deactivate in IE, filter activated



$MVC.Controller.Action = function(action_name, func ,controller){
	this.name = action_name;
	this.func = func;
	this.controller = controller;
	//selector
	if(this.name.search(/change|click|contextmenu|dblclick|mousedown|mousemove|mouseout|mouseover|mouseup|reset|resize|select|submit|dblclick|focus|blur|load|unload/) == -1 ) {
		return;		
	}
	this.parse_name();
	if(this.className() == 'main')  {
		this.main_controller();
		return;
	}
	this.singular = this.className().is_singular();
	
	if(this.singular){
		this.selector = this.last_space == -1 ? '#'+this.className() : '#'+this.className()+' '+this.before_space;
	}else{
		this.set_plural_selector();
	}

	if(this.event_type == 'submit' && $MVC.Browser.IE){
		this.submit_for_ie();
		return;
	}
	this.controller.add_register_action(this,document.documentElement, this.registered_event(), this.capture());
};

$MVC.Controller.Action.prototype = {
	registered_event : function(){
		if($MVC.Browser.IE){
			if(this.event_type == 'focus')
				return 'activate';
			else if(this.event_type == 'blur')
				return 'deactivate';
		}
		return this.event_type;
	},
	set_plural_selector : function(){
		if(this.name.substring(0,2) == "# "){
			var newer_action_name = this.name.substring(2,this.name.length);
			newlast_space = newer_action_name.lastIndexOf(' ');
			this.selector = newlast_space == -1 ? '#'+this.className() : '#'+this.className()+' '+newer_action_name.substring(0,newlast_space);
		}else{
			this.selector = this.last_space == -1 ? '.'+this.className().singularize() : '.'+this.className().singularize()+' '+this.before_space;
		}
	},
	parse_name : function(){
		this.last_space = this.name.lastIndexOf(' ');
		this.before_space = this.last_space == -1 ? '' : this.name.substring(0,this.last_space);
		this.event_type = this.last_space == -1 ? this.name :this.name.substring(this.last_space+1);
		this.event_type;
	},
	main_controller : function(){
		if(['load','unload','resize'].include(this.event_type)){
			$MVC.Event.observe(window, this.event_type, $MVC.Controller.event_closure(this.className(), this.event_type, window) );
			return;
		}
		this.selector = this.before_space;
		if(this.event_type == 'submit' && $MVC.Browser.IE){
			this.submit_for_ie();
			return;
		}
		this.controller.add_register_action(this,document.documentElement, this.registered_event(), this.capture());
	},
	submit_for_ie : function(){
		this.controller.add_register_action(this,document.documentElement, 'click');
		this.controller.add_register_action(this,document.documentElement, 'keypress');
		this.filters= {
			click : function(el, event){
				return el.nodeName.toUpperCase() == 'INPUT' && el.type.toLowerCase() == 'submit';
			},
			keypress : function(el, event){
				return el.nodeName.toUpperCase() == 'INPUT' && event.charCode == 13; // make event key match enter && el.type.toLowerCase() == 'submit'
			}
		};
		//this.real_selector = this.selector+' input' //must be in an input element
	},
	className : function(){
		return this.controller.className;
	},
	capture : function(){
		return ['focus','blur'].include(this.event_type);
	},
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
				if( patterns.hasOwnProperty(attr) ){
					if( (r = p.match(patterns[attr]))  ) {
						if(attr == 'tag'){
							v[attr] = r[1].toUpperCase();
						}else{
							v[attr] = r[1];
						}
						
						p.replace(r[0],'')
					}
				}
			}
			order.push(v);
		}
		this.order = order;
		return this.order;
	},
	match : function(el, event, parents){
		if(this.filters){
			if(!this.filters[event.type](el, event)) return false;
		}
		var docEl = document.documentElement;
		var body = document.body;
		if(el == docEl || el==body) return false;

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
					return {node: node.element, order: n, action: this};
				}
			}
		}
		return null;
	},
	after_filters : function(){
		if(this.attach){
			$MVC.Controller.attach_all();
		}
	}
};









