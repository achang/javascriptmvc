// code contributed by Juriy Zaytsev
MVC.Object.is_number = function(value){
	return !isNaN(value)
};
/**
 * Creates a new controller object with actions
 * @param {String} model - The name of the controller type.  Example: todo.
 * @param {Object} actions - a hash of functions that get added to the controller's prototype
 */
MVC.Controller = function(model, actions){
	var className= model, newmodel = null, singular = MVC.String.is_singular(model);
	model = MVC.String.classize(model)+'Controller';
	newmodel = eval(model + " = function() { this.Class = "+model+";this.initialize.apply(this, arguments);};");
	newmodel.prototype = new MVC.Controller.functions();
	newmodel.prototype.klass_name = model;
	newmodel.className = newmodel.prototype.className =	className;
	MVC.Object.extend(newmodel.prototype, actions );
	var registered_actions = {}, controller_actions = {};
	newmodel.add_register_action = function(action,observe_on, event_type, capture){
		if(!registered_actions[event_type]){
			registered_actions[event_type] = [];
			MVC.Event.observe(observe_on, event_type, MVC.Controller.dispatch_event, capture);
		}
		registered_actions[event_type].push(action);
	};
	for(var action_name in actions ){
		var val = actions[action_name];
		if( actions.hasOwnProperty(action_name) && typeof val == 'function')
			controller_actions[action_name] = new MVC.Controller.Action(action_name, val,newmodel);
	}
	newmodel.actions = function(){ return controller_actions;};
	newmodel.registered_actions = function(){ return registered_actions; };
	MVC.Controller.klasses.push(newmodel);
	return newmodel;
};

/**
 * MVC.Controller prototype functions
 */
MVC.Controller.functions = function(){};
MVC.Object.extend(MVC.Controller.functions.prototype, {
	initialize : function(){},
	continue_to :function(action){
		if(!action) action = this.action.name+'ing';
		if(typeof this[action] != 'function'){ throw 'There is no action named '+action+'. ';}
		return MVC.Function.bind(function(){
			this.action = this.Class.actions()[action];
			this[action].apply(this, arguments);
		}, this);
	}
});

/**
 * MVC.Controller class functions
 */
MVC.Object.extend(MVC.Controller , {
	klasses: [],
	add_kill_event: function(event){
		if(!event.kill){
			var killed = false;
			event.kill = function(){
				killed = true;
				if(!event) event = window.event;
			    try{
				    event.cancelBubble = true;
				    if (event.stopPropagation)  event.stopPropagation(); 
				    if (event.preventDefault)  event.preventDefault();
			    }catch(e){}
			};
			event.is_killed = function(){return killed;};
		}	
	},
	dispatch: function(controller, action_name, params){
		var c_name = controller;
		if(typeof controller == 'string'){controller = window[ MVC.String.classize(controller)+'Controller'];}
		if(!controller) throw 'No controller named '+c_name+' was found for MVC.Controller.dispatch.';
		if(!action_name) action_name = 'index';
		
		if(typeof action_name == 'string'){
			if(!(action_name in controller.actions()) ) throw 'No action named '+action+' was found for '+c_name+'.';
		}else{ //action passed
			action_name = action_name.name;
		}
		var action = controller.actions()[action_name], instance = new controller();
		instance.params = params;
		instance.action = action;
		return MVC.Controller._dispatch_action(instance,action_name, params );
	},
	_dispatch_action: function(instance, action_name, params){
		return instance[action_name](params);
	},
	node_path: function(el){
		var body = document.documentElement,parents = [],iterator =el;
		while(iterator != body){
			parents.unshift({tag: iterator.nodeName, className: iterator.className, id: iterator.id, element: iterator});
			iterator = iterator.parentNode;
			if(iterator == null) return [];
		}
		parents.push(body);
		return parents;
	},
	dispatch_event: function(event){
		var target = event.target,classes = MVC.Controller.klasses, matched = false, ret_value = true,matches = [];
		var parents_path = MVC.Controller.node_path(target);

		for(var c = 0 ; c < classes.length; c++){
			var actions = MVC.Controller.klasses[c].registered_actions()[event.type];
			if(!actions) continue;
			for(var i =0; i < actions.length;  i++){
				var action = actions[i];
				var match_result = action.match(target, event, parents_path);
				
				if(match_result){
					match_result.controller = MVC.Controller.klasses[c];
					matches.push(match_result);
				}
			}
		}
		if(matches.length == 0) return true;
		MVC.Controller.add_kill_event(event);
		matches.sort(MVC.Controller.dispatch_event.sort_by_order);
		for(var m = 0; m < matches.length; m++){
			var match = matches[m];
			var action_name = match.action.name;
			var params = new MVC.Controller.Params({event: event, element: match.node, action: action_name, controller: match.controller  });
			ret_value = MVC.Controller.dispatch(match.controller, action_name, params) && ret_value;
			if(event.is_killed()) return false;
		}
	},
	event_closure: function(controller_name, f_name, element){
		return function(event){
			MVC.Controller.add_kill_event(event);
			var params = new MVC.Controller.Params({event: event, element: element, action: f_name, controller: controller_name   });
			return MVC.Controller.dispatch(controller_name, f_name, params);
		}
	},
	callback: function(controller_name, action_name){
		return function(){
			return MVC.Controller.dispatch(controller_name, action_name);
		}
	}
});

MVC.Controller.dispatch_event.sort_by_order = function(a,b){
	if(a.order < b.order) return 1;
	if(b.order < a.order) return -1;
	var ae = a.action.event_type, be = b.action.event_type;
	if(ae == 'click' &&  be == 'change') return 1;
	if(be == 'click' &&  ae == 'change') return -1;
	return 0;
};

MVC.Controller.Params = function(params){
	for(var thing in params){
		if( params.hasOwnProperty(thing) ) this[thing] = params[thing];
	}
};


MVC.Controller.Params.prototype = {
	form_params : function(){
		var data = {};
		if(this.element.nodeName.toLowerCase() != 'form') return data;
		var els = this.element.elements, uri_params = [];
		for(var i=0; i < els.length; i++){
			var el = els[i];
			if(el.type.toLowerCase()=='submit') continue;
			var key = el.name, key_components = key.split(/\[[^\]]*\]/), value;
         
			/* Check for checkbox and radio buttons */
			switch(el.type.toLowerCase()) {
				case 'checkbox':
				case 'radio':
					value = !!el.checked;
					break;
						
				default:
					value = el.value;
					break;
			}
			if(MVC.Object.is_number(value) ) value = parseFloat(value);
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
		var start = this.element, controller = this.controller;
		var className = MVC.String.is_singular(controller.className) ? controller.className : MVC.String.singularize(controller.className);
		while(start && start.className.indexOf(className) == -1 ){
			start = start.parentNode;
			if(start == document) return null;
		}
		return start;
	},
	is_event_on_element : function(){ return this.event.target == this.element; },
	object_data : function(){ return MVC.View.Helpers.get_data(this.class_element()); }
};



MVC.Controller.Action = function(action_name, func ,controller){
	this.name = action_name;
	this.func = func;
	this.controller = controller;
	this.parse_name();
	if(! MVC.Array.include(MVC.Controller.Action.actions, this.event_type)){
		this.event_type = null;
		return;
	}
	
	if(this.className() == 'main') return this.main_controller();
	this.singular = MVC.String.is_singular(this.className());
	if(this.singular)
		this.selector = this.last_space == -1 ? '#'+this.className() : '#'+this.className()+' '+this.before_space;
	else
		this.set_plural_selector();
	if(this.event_type == 'submit' && MVC.Browser.IE) return this.submit_for_ie();
	if(this.event_type == 'change' && MVC.Browser.IE) return this.change_for_ie();
	if(this.event_type == 'change' && MVC.Browser.WebKit) return this.change_for_webkit();
	this.controller.add_register_action(this,document.documentElement, this.registered_event(), this.capture());
};

MVC.Controller.Action.actions = ['change','click','contextmenu','dblclick','keydown','keyup','keypress','mousedown','mousemove','mouseout','mouseover','mouseup','reset','resize','scroll','select','submit','dblclick','focus','blur','load','unload'];

MVC.Controller.Action.prototype = {
	registered_event : function(){
		if(MVC.Browser.IE){
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
			var singular = MVC.String.singularize(this.className());
			this.selector = this.last_space == -1 ? '.'+singular : '.'+singular+' '+this.before_space;
		}
			
	},
	parse_name : function(){
		this.last_space = this.name.lastIndexOf(' ');
		this.before_space = this.last_space == -1 ? '' : this.name.substring(0,this.last_space);
		this.event_type = this.last_space == -1 ? this.name :this.name.substring(this.last_space+1);
	},
	main_controller : function(){
		if(MVC.Array.include(['load','unload','resize','scroll'],this.event_type))
			return MVC.Event.observe(window, this.event_type, MVC.Controller.event_closure(this.className(), this.event_type, window) );
		
		//if(this.name == 'click')
		//	return MVC.Event.observe(document.documentElement, this.event_type, MVC.Controller.event_closure(this.className(), this.event_type, window) );
		
		this.selector = this.before_space;
		if(this.event_type == 'submit' && MVC.Browser.IE)
			return this.submit_for_ie();
			
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
				if(el.nodeName.toUpperCase()!= 'INPUT') return false;
				if(typeof Prototype != 'undefined'){ return event.keyCode == 13; }
				return event.charCode == 13;
			}
		};
	},
	change_for_ie : function(){
		this.controller.add_register_action(this,document.documentElement, 'click');
		this.filters= {
			click : function(el, event){
				if(typeof el.selectedIndex == 'undefined') return false; //sometimes it won't exist yet
				var old = el.getAttribute('_old_value');
				if(el.nodeName.toUpperCase() == 'SELECT' && old == null){
					el.setAttribute('_old_value', el.selectedIndex);
					return false;
				}else if(el.nodeName.toUpperCase() == 'SELECT'){
					if(old == el.selectedIndex.toString()) return false;
					el.setAttribute('_old_value', null);
					return true;
				}
			}
		};
	},
	change_for_webkit : function(){
		this.controller.add_register_action(this,document.documentElement, 'change');
		this.filters= {
			change : function(el, event){
				if(typeof el.value == 'undefined') return false; //sometimes it won't exist yet
				var old = el.getAttribute('_old_value');
				el.setAttribute('_old_value', el.value);
				return el.value != old;
			}
		};
	},
	className : function(){
		return this.controller.className;
	},
	capture : function(){
		return MVC.Array.include(['focus','blur'],this.event_type);
	},
	selector_order : function(){
		if(this.order) return this.order;
		var selector_parts = this.selector.split(/\s+/);
		var patterns = {tag :    		/^\s*(\*|[\w\-]+)(\b|$)?/,
        				id :            /^#([\w\-\*]+)(\b|$)/,
    					className :     /^\.([\w\-\*]+)(\b|$)/};
		var order = [];
		for(var i =0; i< selector_parts.length; i++){
			var v = {}, r, p =selector_parts[i];
			for(var attr in patterns){
				if( patterns.hasOwnProperty(attr) ){
					if( (r = p.match(patterns[attr]))  ) {
						if(attr == 'tag')
							v[attr] = r[1].toUpperCase();
						else
							v[attr] = r[1];
						p = p.replace(r[0],'');
					}
				}
			}
			order.push(v);
		}
		this.order = order;
		return this.order;
	},
	match : function(el, event, parents){
		if(this.filters && !this.filters[event.type](el, event)) return null;
		if(this.controller.className != 'main' &&  (el == document.documentElement || el==document.body) ) return false;

		var matching = 0;
		for(var n=0; n < parents.length; n++){
			var node = parents[n], match = this.selector_order()[matching], matched = true;
			for(var attr in match){
				if(!match.hasOwnProperty(attr) || attr == 'element') continue;
				if(match[attr] && attr == 'className'){
					if(! MVC.Array.include(node.className.split(' '),match[attr])) matched = false;
				}else if(match[attr] && node[attr] != match[attr]){
					matched = false;
				}
			}
			if(matched){
				matching++;
				if(matching >= this.selector_order().length) return {node: node.element, order: n, action: this};
			}
		}
		return null;
	}
};
if(!MVC._no_conflict) Controller = MVC.Controller;
