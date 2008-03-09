$MVC.Native.extend = function(class_name, source){
	if(!$MVC[class_name]) $MVC[class_name] = {};
	var destination = $MVC[class_name];
	for (var property in source){
		destination[property] = source[property];
		if(!$MVC._no_conflict){
			window[class_name][property] = source[property];
			if(typeof source[property] == 'function'){
				var names = source[property].toString().match(/^[\s\(]*function[^(]*\((.*?)\)/)[1].split(",");
    			if( names.length == 1 && !names[0]) continue;
				var first_arg = names[0].replace(/^\s+/, '').replace(/\s+$/, '');
				if( first_arg.match(class_name.toLowerCase() || (first_arg == 'func' && class_name == 'Function' ) ) ){
					window[class_name].prototype[property] = function(){
						var args = [this];
						for (var i = 0, length = arguments.length; i < length; i++) args.push(arguments[i]);
						return source[property].apply(this,args  );
					}
				}
			}
		}
	}
};

//Object helpers
$MVC.Object.extend = Object.extend;
//these are really only for forms
$MVC.Object.toQueryString = function(object,name){
	if(!object) return null;
	if(typeof object == 'string') return object;
	return $MVC.Object.toQueryString.worker(object,name).join('&');
};
$MVC.Object.toQueryString.worker = function(obj,name){
	var parts2 = [];
	for(var thing in obj){
		if(obj.hasOwnProperty(thing)) {
			var value = obj[thing];
			if(typeof value != 'object'){
				var nice_val = encodeURIComponent(value.toString());
				var newer_name = encodeURIComponent(name ? name+'['+thing+']' : thing) ;
				parts2.push( newer_name+'='+nice_val )  ;
			}else{
				if(name){
					parts2 = parts2.concat( $MVC.Object.toQueryString.worker(value, name+'['+thing+']')   );
				}else{
					parts2 = parts2.concat( $MVC.Object.toQueryString.worker(value, thing)  );
				}
			}
		}
	}
	return parts2;
};

//String Helpers
$MVC.Native.extend('String', {
	chomp : function(string, str){
	    var index = string.lastIndexOf(str);
	    return (index != -1 ? string.slice(0, index): string);
	}
});


$MVC.Object.extend($MVC.String,{
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
		for(var i = 0; i < parts.length; i++)
			parts[i] = parts[i].capitalize();
		return parts.join('');
	}
});


$MVC.Array.from = Array.from
$MVC.Array.include = function(array, thing){return array.include(thing);}
$MVC.Function.bind = function(func){
	var args = $MVC.Array.from(arguments);
	args.shift();args.shift();
	var __method = func, object = arguments[1];
	return function() {
		return __method.apply(object, args.concat($MVC.Array.from(arguments) )  );
	}
}
$MVC.Browser = Prototype.Browser;