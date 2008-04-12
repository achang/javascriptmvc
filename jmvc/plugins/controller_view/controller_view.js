MVC.Controller.functions.prototype.render = function(options) {
		var result, render_to_id = MVC.RENDER_TO;
		var controller_name = this.className;
		var action_name = this.action.name;
        if(!options) options = {};
		if(typeof options == 'string'){
			result = new MVC.View({url:  options  }).render(this);
		}
		else if(options.text) {
            result = options.text;
        }
        else {
            var convert = function(url){
				var url =  MVC.String.include(url,'/') ? url.split('/').join('/_') : controller_name+'/'+url;
				var url = url + '.ejs';
				return url;
			};
			
			if(options.action) {
				var url = convert(options.action);
            }
			else if(options.partial) {
                var url = convert(options.partial);
			}
            else {
                var url = controller_name+'/'+action_name.replace(/\.|#/g, '').replace(/ /g,'_')+'.ejs';
            }
			var data_to_render = this;
			if(options.locals) {
				for(var local_var in options.locals) {
					data_to_render[local_var] = options.locals[local_var];
				}
			}
			result = new MVC.View({url:  url  }).render(data_to_render);
		}
		//return result;
		var locations = ['to', 'before', 'after', 'top', 'bottom'];
		var element = null;
		for(var l =0; l < locations.length; l++){
			if(typeof  options[locations[l]] == 'string'){
				var id = options[locations[l]];
				options[locations[l]] = MVC.$E(id);
				if(!options[locations[l]]) 
					throw {message: "Can't find element with id: "+id, name: 'ControllerView: Missing Element'};
			}
			
			if(options[locations[l]]){
				element = options[locations[l]];
				if(locations[l] == 'to'){
					options.to.innerHTML = result;
				}else{
					if(!MVC.$E.insert ) throw {message: "Include can't insert "+locations[l]+" without the element plugin.", name: 'ControllerView: Missing Plugin'};
					var opt = {};
					opt[locations[l]] = result;
					MVC.$E.insert(element, opt );
				}
			} 
		}
		return result;

};

