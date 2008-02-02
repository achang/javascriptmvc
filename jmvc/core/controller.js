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
	Object.extend(newmodel.prototype, actions );
	var handler_names = [];
	for(var action_name in actions ){
		if( action_name.search(/[click|mouseover|mouseout|load|resize|dblclick|contextmenu|blur|keypress|unload]/) != -1 ) {
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
}
Controller.functions = function(){};
Controller.klasses = [];

(function(){

	var functions = {};
	var controller_id = 0;
	var new_event_closure_function = function(controller_name, f_name, element){
		return function(event){
			var instance = new window[controller_name];
			
			var params = {event: event, element: element, action: f_name   };
			instance.params = params;
			instance.action = f_name;
			instance[f_name](params);
			//instance.attach_event_handlers()
		}
	};
	
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
				event_els = el.getElementsBySelector(event_function.substring(0, last_space));
			}
			if( (handler_name == 'load' || handler_name == 'resize' || handler_name == 'unload') && this.klass_name == 'MainController'){
				event_els= [window];
			}
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
	continue_to :function(action){
		return function(response){
			this.action = action;
			this[action](response);
			//this.attach_event_handlers()
		}.bind(this)
	},
	render : function(options) {
		var result, render_to_id = JMVC.RENDER_TO;
		var controller_name = this.className;
		var action_name = this.action;
        if(!options) options = {};
		if(typeof options == 'string'){
			result = new EJS({url:  options  }).render(this);
		}
		else if(options.text) {
            result = options.text;   
        }
        else {
            if(options.action) {
                //var folder_name = controller_name;
                var url = 'app/views/'+controller_name+'/'+options.action+".ejs";
            }
            else if(options.template) {
				var url_part =  options.template.include('/') ? 
									options.template.split('/').join('/_') : 
									controller_name+'/_'+options.template;
				var url = 'app/views/'+url_part+'.ejs';
            }
			else if(options.partial) {
                
				var url_part = options.partial.include('/') ? 
									options.partial.split('/').join('/_') : 
									controller_name+'/_'+options.partial;		
				var url = 'app/views/'+url_part+'.ejs';
			}
            else {
                var url = 'app/views/'+controller_name+'/'+action_name+'.ejs';
            }
			result = new EJS({url:  jFile.join(APPLICATION_ROOT,url)  }).render(this);
		}
		//return result;
		var locations = ['to', 'before', 'after', 'top', 'bottom'];
		var element = null;
		for(var l =0; l < locations.length; l++){
			if( typeof  options[locations[l]] == 'string' ) options[locations[l]] = $(options[locations[l]]);
			
			if(options[locations[l]]) element = options[locations[l]];
		}
		
		if(this.klass_name == 'MainController'){
			options.to.innerHTML = result;
			for(var c = 0; c  < Controller.klasses.length ; c++){
				(new Controller.klasses[c]()).attach_event_handlers(options.to);
				//this.attach_event_handlers
			}
			return;
		}
		return result;
		/*
		if(!element){
			element = ( this.params.element == window ? $(JMVC.RENDER_TO) : this.params.element)
		}
		//if(options.to){
			element.innerHTML = result
		return element	
		//}
		*/
		
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