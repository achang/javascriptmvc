MVC.Controller = MVC.Class.extend({
    init: function(){
        
        if(!this.className) return;
        MVC.Controller.controllers.push(this);
        var val;
        for(var action_name in this.prototype){
    		val = this.prototype[action_name];
    		if( this.prototype.hasOwnProperty(action_name) && typeof val == 'function' && action_name != 'Class'){
                var act;
                for(var a = 0 ; a < MVC.Controller.actions.length; a++){
                    act = MVC.Controller.actions[a];
                    if(act.matches(action_name)){
                        new act(action_name, val, this);
                    }
                }
            }
	    }
    },
    add_kill_event: function(event){ //this should really be in event
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
    event_closure: function(controller_name, f_name, element){
		return function(event){
			MVC.Controller.add_kill_event(event);
			var params = new MVC.Controller.Params({event: event, element: element, action: f_name, controller: controller_name   });
			return MVC.Controller.dispatch(controller_name, f_name, params);
		}
	},
    dispatch_closure: function(controller_name, f_name){
        return function(params){
			MVC.Controller.add_kill_event(params.event);
            params.action = f_name;
            params.controller = controller_name;
			return MVC.Controller.dispatch(controller_name, f_name, 
                new MVC.Controller.Params(params)
            );
		}
    },
    dispatch: function(controller, action_name, params){
		var c_name = controller;
		if(typeof controller == 'string'){controller = window[ MVC.String.classize(controller)+'Controller'];}
		if(!controller) throw 'No controller named '+c_name+' was found for MVC.Controller.dispatch.';
		if(!action_name) action_name = 'index';
		
		if(typeof action_name == 'string'){
			if(!(action_name in controller.prototype) ) throw 'No action named '+action+' was found for '+c_name+'.';
		}else{ //action passed
			action_name = action_name.name;
		}
		var instance = new controller();
		instance.params = params;
		instance.action_name = action_name;
		return MVC.Controller._dispatch_action(instance,action_name, params );
	},
	_dispatch_action: function(instance, action_name, params){
		return instance[action_name](params);
	},
    controllers : [],
    actions: []
},{
    
});

MVC.Controller.Action = MVC.Class.extend(
{
    init: function(){
        if(this.matches) MVC.Controller.actions.push(this)
    }
},{
    init: function(action, f, controller){
        this.action = action;
        this.func = f;
        this.controller = controller;
    }
});

MVC.Controller.DelegateAction = MVC.Controller.Action.extend({
    match: new RegExp("(.*?)\s?(change|click|contextmenu|dblclick|keydown|keyup|keypress|mousedown|mousemove|mouseout|mouseover|mouseup|reset|resize|scroll|select|submit|dblclick|focus|blur|load|unload)$"),
    matches: function(action_name){
        return this.match.exec(action_name)
    }
},
//Prototype functions
{    
    init: function(action, f, controller){
        this._super(action, f, controller);
        this.css_and_event();
        
        var selector = this.selector();
        if(selector){
            new MVC.DelegationEvent(selector, this.event_type, 
                this.controller.dispatch_closure(controller.className, action ) );
        }
    },
    css_and_event: function(){
        this.parts = this.action.match(this.Class.match);
        this.css = this.parts[1];
        this.event_type = this.parts[2];
    },
    main_controller: function(){
        if(MVC.Array.include(['load','unload','resize','scroll'],this.event_type)){
            MVC.Event.observe(window, this.event_type, MVC.Controller.event_closure(this.controller.className, this.event_type, window) );
            return;
        }
	    return this.css;
    },
    plural_selector : function(){
		if(this.css.substring(0,2) == "# "){
			var newer_action_name = this.css.substring(2,this.css.length);
            return '#'+this.controller.className + (newer_action_name ? newer_action_name : ' '+newer_action_name ) 
		}else{
			return '.'+MVC.String.singularize(this.controller.className)+(this.css? ' '+this.css : '' )
		}
	},
    singular_selector : function(){
        return '#'+this.controller.className+(this.css? ' '+this.css : '' );
    },
    selector : function(){
        if(this.controller.className == 'main') return this.main_controller();
        return MVC.String.is_singular(this.controller.className) ? 
            this.singular_selector() :
            this.plural_selector();
    }
});

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
