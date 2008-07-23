// submitted by kangax
MVC.Object.is_number = function(o){
    return o &&(  typeof o == 'number' || ( typeof o == 'string' && !isNaN(o) ) );
};

MVC.Controller = MVC.Class.extend({
    init: function(){
        if(!this.className) return;
        MVC.Controller.controllers.push(this);
        var val, act;
        this.actions = {};
        for(var action_name in this.prototype){
    		val = this.prototype[action_name];
    		if( typeof val == 'function' && action_name != 'Class'){
                for(var a = 0 ; a < MVC.Controller.actions.length; a++){
                    act = MVC.Controller.actions[a];
                    if(act.matches(action_name)){
                        this.actions[action_name] =new act(action_name, val, this);
                    }
                }
            }
	    }
        this.modelName = MVC.String.classize(
            MVC.String.is_singular(this.className) ? this.className : MVC.String.singularize(this.className)
        );
        //load tests
        if(include.get_env() == 'test'){
            var path = MVC.root.join('test/functional/'+this.className+'_controller_test.js');
    		var exists = include.check_exists(path);
    		if(exists)
    			MVC.Console.log('Loading: "test/functional/'+this.className+'_controller_test.js"');
    		else {
    			MVC.Console.log('Test Controller not found at "test/functional/'+this.className+'_controller_test.js"');
    			return;
    		}
    		var p = include.get_path();
    		include.set_path(MVC.root.path);
    		include('test/functional/'+ this.className+'_controller_test.js');
    		include.set_path(p);
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
		};
	},
    dispatch_closure: function(controller_name, f_name){
        return function(params){
			MVC.Controller.add_kill_event(params.event);
            params.action = f_name;
            params.controller = controller_name;
			return MVC.Controller.dispatch(controller_name, f_name, 
                new MVC.Controller.Params(params)
            );
		};
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
        instance.controller_name = controller.className;
		return MVC.Controller._dispatch_action(instance,action_name, params );
	},
	_dispatch_action: function(instance, action_name, params){
		return instance[action_name](params);
	},
    controllers : [],
    actions: []
},{
    continue_to :function(action){
		if(!action) action = this.action.name+'ing';
		if(typeof this[action] != 'function'){ throw 'There is no action named '+action+'. ';}
		return MVC.Function.bind(function(){
			this.action_name = action;
			this[action].apply(this, arguments);
		}, this);
	},
    delay: function(delay, action_name){
		if(typeof this[action_name] != 'function'){ throw 'There is no action named '+actaction_nameion+'. ';}
		
        return setTimeout(MVC.Function.bind(function(){
			this.action_name = action_name;
			this[action_name].apply(this, arguments);
		}, this), delay );
    },
    dispatch_delay: function(delay, action_name, params){
        var controller_name = action_name.controller ? action_name.controller : this.Class.className;
        action_name = typeof action_name == 'string' ? action_name : action_name.action;
        return setTimeout(function(){
            MVC.Controller.dispatch(controller_name,action_name, params );
        }, delay );
    }
});

MVC.Controller.Action = MVC.Class.extend(
{
    init: function(){
        if(this.matches) MVC.Controller.actions.push(this);
    }
},{
    init: function(action, f, controller){
        this.action = action;
        this.func = f;
        this.controller = controller;
    }
});

MVC.Controller.DelegateAction = MVC.Controller.Action.extend({
    match: new RegExp("(.*?)\\s?(change|click|contextmenu|dblclick|keydown|keyup|keypress|mousedown|mousemove|mouseout|mouseover|mouseup|reset|resize|scroll|select|submit|dblclick|focus|blur|load|unload)$"),
    matches: function(action_name){
        return this.match.exec(action_name);
    }
},
//Prototype functions
{    
    init: function(action, f, controller){
        this._super(action, f, controller);
        this.css_and_event();
        
        var selector = this.selector();
        if(selector != null){
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
	    if(!this.css && MVC.Array.include(['blur','focus'],this.event_type)){
            MVC.Event.observe(window, this.event_type, MVC.Controller.event_closure(this.controller, this.event_type, window) );
            return;
        }
        return this.css;
    },
    plural_selector : function(){
		if(this.css == "#" || this.css.substring(0,2) == "# "){
			var newer_action_name = this.css.substring(2,this.css.length);
            return '#'+this.controller.className + (newer_action_name ?  ' '+newer_action_name : '') ;
		}else{
			return '.'+MVC.String.singularize(this.controller.className)+(this.css? ' '+this.css : '' );
		}
	},
    singular_selector : function(){
        return '#'+this.controller.className+(this.css? ' '+this.css : '' );
    },
    selector : function(){
        if(MVC.Array.include(['load','unload','resize','scroll'],this.event_type)){
            MVC.Event.observe(window, this.event_type, MVC.Controller.event_closure(this.controller, this.event_type, window) );
            return;
        }
        
        
        if(this.controller.className == 'main') 
            this.css_selector = this.main_controller();
        else
            this.css_selector = MVC.String.is_singular(this.controller.className) ? 
                this.singular_selector() : this.plural_selector();
        return this.css_selector;
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
			var key = el.name || el.id, key_components = key.match(/(\w+)/g), value;
            if(!key) continue;     
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
			//if( MVC.Object.is_number(value) ) value = parseFloat(value);
			if( key_components.length > 1 ) {
				var last = key_components.length - 1;
				var nested_key = key_components[0].toString();
				if(! data[nested_key] ) data[nested_key] = {};
				var nested_hash = data[nested_key];
				for(var k = 1; k < last; k++){
					nested_key = key_components[k];
					if( ! nested_hash[nested_key] ) nested_hash[nested_key] ={};
					nested_hash = nested_hash[nested_key];
				}
				nested_hash[ key_components[last] ] = value;
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
		var className = MVC.String.is_singular(controller) ? controller : MVC.String.singularize(controller);
		while(start && start.className.indexOf(className) == -1 ){
			start = start.parentNode;
			if(start == document) return null;
		}
		return start;
	},
	is_event_on_element : function(){ return this.event.target == this.element; },
	object_data : function(){ return MVC.View.Helpers.get_data(this.class_element()); }
};
