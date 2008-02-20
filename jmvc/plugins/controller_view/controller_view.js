Controller.functions.prototype.render = function(options) {
		var result, render_to_id = JMVC.RENDER_TO;
		var controller_name = this.className;
		var action_name = this.action.name;
        if(!options) options = {};
		if(typeof options == 'string'){
			result = new View({url:  options  }).render(this);
		}
		else if(options.text) {
            result = options.text;   
        }
        else {
            if(options.action) {
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
                var url = 'app/views/'+controller_name+'/'+action_name.replace(/\./g, '').replace(/ /g,'_')+'.ejs';
            }
			var data_to_render = this;
			if(options.locals) {
				for(var local_var in options.locals) {
					data_to_render[local_var] = options.locals[local_var];
				}
			}
			if(JMVC.get_application_root() == '')
				var path = url;
			else
				var path = JMVC.get_application_root()+'/'+url;
			result = new View({url:  path  }).render(data_to_render);
		}
		//return result;
		var locations = ['to', 'before', 'after', 'top', 'bottom'];
		var element = null;
		for(var l =0; l < locations.length; l++){
			if( typeof  options[locations[l]] == 'string' ) options[locations[l]] = $(options[locations[l]]);
			
			if(options[locations[l]]) element = options[locations[l]];
		}
		
		/*if(this.klass_name == 'MainController'){
			options.to.innerHTML = result;
			for(var c = 0; c  < Controller.klasses.length ; c++){
				(new Controller.klasses[c]()).attach_event_handlers(options.to);
				//this.attach_event_handlers
			}
			return;
		}*/
		//if there is somewhere to render, render it there
		if(options.to){
			options.to.innerHTML = result;
			Controller.attach_all()
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
};

