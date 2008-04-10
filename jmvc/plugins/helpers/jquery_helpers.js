MVC.String = {};
MVC.String.strip = function(string){
	return string.replace(/^\s+/, '').replace(/\s+$/, '');
};


MVC.Function = {};
MVC.Function.params = function(func){
	var ps = func.toString().match(/^[\s\(]*function[^(]*\((.*?)\)/)[1].split(",");
	if( ps.length == 1 && !ps[0]) return [];
	for(var i = 0; i < ps.length; i++) ps[i] = MVC.String.strip(ps[i]);
	return ps;
};


MVC.Native ={};
MVC.Native.extend = function(class_name, source){
	if(!MVC[class_name]) MVC[class_name] = {};
	var dest = MVC[class_name];
	for (var property in source){
		dest[property] = source[property];
		if(!MVC._no_conflict){
			window[class_name][property] = source[property];
			if(typeof source[property] == 'function'){
				var names = MVC.Function.params(source[property]);
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

MVC.Object.extend = jQuery.extend

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

MVC.Native.extend('String', {
	capitalize : function(string) {
		return string.charAt(0).toUpperCase()+string.substr(1).toLowerCase();
	},
	include : function(string, pattern){
		return string.indexOf(pattern) > -1;
	},
	ends_with : function(string, pattern) {
	    var d = string.length - pattern.length;
	    return d >= 0 && string.lastIndexOf(pattern) === d;
	},
	camelize: function(string){
		var parts = string.split(/_|-/);
		for(var i = 1; i < parts.length; i++)
			parts[i] = MVC.String.capitalize(parts[i]);
		return parts.join('');
	},
	classize: function(string){
		var parts = string.split(/_|-/);
		for(var i = 0; i < parts.length; i++)
			parts[i] = MVC.String.capitalize(parts[i]);
		return parts.join('');
	},
	strip : MVC.String.strip
});




//Array helpers
Array.from = function(iterable){
	if (!iterable) return [];
	return jQuery.makeArray(iterable);
}

Array.prototype.include = function(thing){
	return jQuery.inArray(thing, this) != -1;
};


MVC.Native.extend('Array',{ 
	include: function(array, thing){
		return jQuery.inArray(thing, array) != -1;
	},
	from: function(iterable){
		 if (!iterable) return [];
		 return jQuery.makeArray(iterable);
	}
});



//Function Helpers
MVC.Native.extend('Function', {
	bind: function(func) {
	  var args = MVC.Array.from(arguments);
	  args.shift();args.shift();
	  var __method = func, object = arguments[1];
	  return function() {
	    return __method.apply(object, args.concat(MVC.Array.from(arguments) )  );
	  }
	},
	params: MVC.Function.params
});



