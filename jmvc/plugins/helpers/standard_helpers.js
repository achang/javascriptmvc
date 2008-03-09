//Object helpers
$MVC.Object = {};
$MVC.Object.extend = function(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
};
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
	capitalize : function(string) {
		return string.slice(0,1).toUpperCase()+string.slice(1);
	},
	include : function(string, pattern){
		return string.indexOf(pattern) > -1;
	},
	chomp : function(string, str){
	    var index = string.lastIndexOf(str);
	    return (index != -1 ? string.slice(0, index): string);
	},
	ends_with : function(string, pattern) {
	    var d = string.length - pattern.length;
	    return d >= 0 && string.lastIndexOf(pattern) === d;
	},
	camelize: function(string){
		var parts = string.split(/_|-/);
		for(var i = 0; i < parts.length; i++)
			parts[i] = $MVC.String.capitalize(parts[i]);
		return parts.join('');
	}
});

//Date Helpers, probably should be moved into its own class

//Array Helpers
$MVC.Native.extend('Array',{ 
	include: function(array, thing){
		for(var i=0; i< array.length; i++){
			if(array[i] == thing) return true;
		}
		return false;
	},
	from: function(iterable){
		 if (!iterable) return [];
		var results = [];
	    for (var i = 0, length = iterable.length; i < length; i++)
	      results.push(iterable[i]);
	    return results;
	}
});
//Function Helpers
$MVC.Native.extend('Function', {
	bind: function(func) {
	  var args = $MVC.Array.from(arguments);
	  args.shift();args.shift();
	  var __method = func, object = arguments[1];
	  return function() {
	    return __method.apply(object, args.concat($MVC.Array.from(arguments) )  );
	  }
	}
});


$MVC.Browser = {
    IE:     !!(window.attachEvent && !window.opera),
    Opera:  !!window.opera,
    WebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
    Gecko:  navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') == -1,
    MobileSafari: !!navigator.userAgent.match(/Apple.*Mobile.*Safari/)
};

