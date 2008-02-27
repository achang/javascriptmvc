RemoteModel = function(model, url, functions){
	var className= model, newmodel = null;
	model = model.capitalize();

	newmodel = eval(model + " = function() { this.klass = "+model+"; "+
				"this.initialize.apply(this, arguments);"+
				"};");

	var remote_model_functions = new RemoteModel.functions();
	newmodel.prototype = remote_model_functions;
	newmodel.prototype.klass_name = 	model;
	newmodel.prototype.className = className;
	newmodel.prototype.url = url;
	newmodel.url = url;
	newmodel.className =className;
	Object.extend(newmodel.prototype, functions );
	Object.extend(newmodel, RemoteModel.class_functions);
	return newmodel;
};

RemoteModel.functions = function(){};

RemoteModel.class_functions = {
	find : function(params, callback){
		params.callback = this.className.capitalize()+'.listCallback';
		var klass = this;
		//make callback function create new and call the callback with them
		klass.listCallback = function(callback_params){
			var newObjects = [];
			for(var i=0;i<callback_params.length;i++){
				newObjects.push(new klass(callback_params[i]));
			}
			callback(newObjects);
		};
		params.method = 'GET';
		include(this.url+'/'+this.className.pluralize()+'.json?'+Object.toQueryString(params));
	},
	create : function(params, callback) {
		params.callback = this.className.capitalize()+'.createCallback';
		var klass = this;
		var className = this.className;
		klass.createCallback = function(callback_params){
			if(callback_params[className]){
				callback(new klass(callback_params[className]));
			}else{
				callback(new klass(callback_params));
			}
		};
		params.method = 'POST';
		
		
		var options = Object.toQueryString(params);
		include(this.url+'/'+this.className.pluralize()+'.json?'+Object.toQueryString(params));
	}
};


Object.extend(RemoteModel.functions.prototype, {
	initialize : function(params){
		if(params.attributes)
		this.attributes = params.attributes;
		for(var thing in params.attributes){
			if(params.attributes.hasOwnProperty(thing)) {
				if(thing != 'created_at'){
					this[thing] = params.attributes[thing];
				}else
					this[thing] = Date.parse( params.attributes[thing]);
			}
			
		}
		this.errors = params.errors ? params.errors : [];
		if(params.errors){
			for(var i=0; i< params.errors.length; i++){
				var error = params.errors[i];
				this.errors[error[0]] = error[1];
			}
		}
	}
});

