MVC.Native ={};
MVC.Native.extend = function(class_name, source){
	if(!MVC[class_name]) MVC[class_name] = {};
	var dest = MVC[class_name];
	for (var property in source){
		dest[property] = source[property];
		if(!MVC._no_conflict){
			window[class_name][property] = source[property];
			if(typeof source[property] == 'function'){
				var names = source[property].argumentNames();
    			if( names.length == 0) continue;
				var first_arg = names[0];
				if( first_arg.match(class_name.toLowerCase()) || (first_arg == 'func' && class_name == 'Function' )  ){
					MVC.Native.set_prototype(class_name, property, source[property]);
				}
			}
		}
	}
};
MVC.Native.set_prototype = function(class_name, property_name, func){
	window[class_name].prototype[property_name] = function(){
		var args = [this];
		for (var i = 0, length = arguments.length; i < length; i++) args.push(arguments[i]);
		return func.apply(this,args  );
	};
};
MVC.Object = {};
//Object helpers
MVC.Object.extend = Object.extend;
//these are really only for forms
MVC.Object.to_query_string = function(object,name){
	if(typeof object != 'object') return object;
	return MVC.Object.to_query_string.worker(object,name).join('&');
};
MVC.Object.to_query_string.worker = function(obj,name){
	var parts2 = [];
	for(var thing in obj){
		if(obj.hasOwnProperty(thing)) {
			var value = obj[thing];
			if(typeof value != 'object'){
				var nice_val = encodeURIComponent(value.toString());
				var newer_name = encodeURIComponent(name ? name+'['+thing+']' : thing) ;
				parts2.push( newer_name+'='+nice_val )  ;
			}else{
				parts2 = parts2.concat( MVC.Object.to_query_string.worker(value,  name ? name+'['+thing+']' : thing ))
			}
		}
	}
	return parts2;
};



MVC.String = {};
MVC.Object.extend(MVC.String,{
	capitalize : function(string) {
    	return string.capitalize();
	},
	include : function(string, pattern){
		return string.include(pattern);
	},
	ends_with : function(string, pattern) {
	    return string.endsWith(pattern)
	},
	camelize: function(string){
		var parts = string.split(/_|-/);
		for(var i = 1; i < parts.length; i++)
			parts[i] = parts[i].capitalize();
		return parts.join('');
	},
	classize: function(string){
		var parts = string.split(/_|-/);
		for(var i = 0; i < parts.length; i++)
			parts[i] = MVC.String.capitalize(parts[i]);
		return parts.join('');
	},
	strip: function(string){
		return string.strip();
	}
});

if(!MVC._no_conflict){
	MVC.Object.extend(String.prototype,{
		ends_with: function(pattern){
			return this.endsWith(pattern);
		},
		classize: function(){
			var parts = this.split(/_|-/);
			for(var i = 0; i < parts.length; i++)
				parts[i] = parts[i].capitalize();
			return parts.join('');
		}
	});
}



MVC.Array = {};
MVC.Array.from = Array.from;
MVC.Array.include = function(array, thing){return array.include(thing);};
MVC.Function = {
	bind: function(func){
		var args = MVC.Array.from(arguments);
		args.shift();args.shift();
		var __method = func, object = arguments[1];
		return function() {
			return __method.apply(object, args.concat(MVC.Array.from(arguments) )  );
		};
	},
	params: function(func){
		return func.argumentNames();
	}
};
if(!MVC._no_conflict){
	Function.prototype.params =	Function.prototype.argumentNames
}



MVC.Browser = Prototype.Browser;