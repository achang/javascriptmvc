MVC.RemoteModel = function(model, url, functions){
	var className= model, newmodel = null;
	model = MVC.String.classize(model);

	newmodel = eval(model + " = function() { this.klass = "+model+"; "+
				"this.initialize.apply(this, arguments);"+
				"};");

	var remote_model_functions = new MVC.RemoteModel.functions();
	newmodel.prototype = remote_model_functions;
	newmodel.prototype.klass_name = 	model;
	newmodel.prototype.className = className;
	newmodel.prototype.klass = newmodel;
	newmodel.controller_name = className;
	
	newmodel.url = url;
	if(typeof url == 'string'){
		newmodel.url = url;
	}else{
		newmodel.url = url.url;
		newmodel.controller_name = url.name;
	}
	newmodel.plural_controller_name = MVC.String.pluralize(newmodel.controller_name);
	
	newmodel.className =className;
	MVC.Object.extend(newmodel.prototype, functions );
	MVC.Object.extend(newmodel, MVC.RemoteModel.class_functions);
	return newmodel;
};

MVC.RemoteModel.functions = function(){};

MVC.RemoteModel.class_functions = {
	find : function(params, callback){
		params.callback = MVC.String.classize(this.className)+'.listCallback';
		var klass = this;
		//make callback function create new and call the callback with them
		if(!callback) callback = (function(){});
		klass.listCallback = function(callback_params){
			var newObjects = [];
			for(var i=0;i<callback_params.length;i++){
				var newm = new klass(callback_params[i].attributes);
				newObjects.push(newm);
				if(callback_params[i].errors) newm.add_errors(callback_params[i].errors);
			}
			callback(newObjects);
		};
		params['_method'] = 'GET';
		include(this.url+'/'+this.plural_controller_name+'.json?'+MVC.Object.to_query_string(params)+'&'+Math.random());
	},
	create : function(params, callback) {
		this.add_standard_params(params, 'create');
		var klass = this;
		var className = this.className;
		
		if(!callback) callback = (function(){});
		
		var tll = MVC.RemoteModel.top_level_length(params, this.url+'/'+this.plural_controller_name+'.json?');
		var result = MVC.RemoteModel.seperate(params[this.controller_name], tll,this.controller_name );
		
		var postpone_params = result.postpone;
		var send_params = result.send;
		params['_method'] = 'POST';
		
		var url = this.url+'/'+this.plural_controller_name+'.json?';
		
		if(result.send_in_parts){
			klass.createCallback = function(callback_params){
				params[this.controller_name] = postpone_params;
				params.id = callback_params.id;
				klass.create(params, callback);
			};
			params[this.controller_name] = send_params;
			params['_mutlirequest'] = 'true';
			include(url+MVC.Object.to_query_string(params)+'&'+Math.random());
		}else{
			klass.createCallback = function(callback_params){
				if(callback_params[className]){
					var inst = new klass(callback_params[className]);
					inst.add_errors(callback_params.errors);
					callback(inst);
				}else{
					callback(new klass(callback_params)+'&'+Math.random());
				}
			};
			params['_mutlirequest'] = null;
			include(url+MVC.Object.to_query_string(params));
		}
	},
	add_standard_params : function(params, callback_name){
		if(APPLICATION_KEY) params.user_crypted_key = APPLICATION_KEY;
		params.referer = window.location.href;
		params.callback = MVC.String.capitalize(MVC.String.camelize(this.className))+'.'+callback_name+'Callback';
	}
};


MVC.Object.extend(MVC.RemoteModel.functions.prototype, {
	initialize : function(attributes){
		this.attributes = attributes ? attributes : {};

		for(var thing in this.attributes){
			if(this.attributes.hasOwnProperty(thing)) {
				if(thing != 'created_at'){
					this[thing] = this.attributes[thing];
				}else
					this[thing] = MVC.Date.parse( this.attributes[thing]);
			}
		}
		this.errors = [];
	},
	save : function(callback){
		if(this.id){
			//update
		}else{
			var params = {};
			params[this.klass.controller_name] = this.attributes;
			this.klass.create(params, callback);
		}
	},
	add_errors : function(errors){
		if(!errors) return;
		this.errors = errors;
		if(errors){
			for(var i=0; i< errors.length; i++){
				var error = errors[i];
				this.errors[error[0]] = error[1];
			}
		}
	}
});


MVC.RemoteModel.top_level_length = function(params, url){
	var total = url.length;
	for(var attr in params){
		if(! params.hasOwnProperty(attr)) continue;
		var val = params[attr];
		if(typeof val == 'string'){
			total += val.length+attr.length+2;
		}else if(typeof val == 'number'){
			total += val.toString().length+attr.length+2;
		}
	}
	return total;
};

MVC.RemoteModel.seperate = function(object, top_level_length, name){
	var remainder = 2000 - 9 - top_level_length; 
	var send = {};
	var postpone = {};
	var send_in_parts = false;
	for(var attr in object){
		if(! object.hasOwnProperty(attr) ) continue;
		var value = object[attr], value_length;
		var attr_length = encodeURIComponent( name+'['+attr+']' ).length;
		
		if(typeof value == 'string'){
			value_length = encodeURIComponent( value ).length;
		}else{
			value_length = value.toString().length;
		}
		
		if(remainder - attr_length <= 30) {
			postpone[attr] = value;
			send_in_parts = true;
			continue;
		};
		remainder = remainder - attr_length - 2; //2 is for = and &
		if(remainder >  value_length){
			send[attr] = value;
			remainder -= value_length;
		}else if(typeof value == 'string'){
			var guess = remainder;
			while( encodeURIComponent( value.substr(0,guess) ).length > remainder ){
				guess = parseInt(guess * 0.75) - 1;
			}
			send[attr] = value.substr(0,guess);
			postpone[attr] = value.substr(guess);
			send_in_parts = true;
			remainder = 0;
		}else{
			postpone[attr] = value;
		}
	}
	return {send: send, postpone: postpone, send_in_parts: send_in_parts};
};
