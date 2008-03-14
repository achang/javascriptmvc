$MVC.Native ={};
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


$MVC.Object.extend = jQuery.extend


$MVC.Object.toQueryString = function(object,name){
	if(!object) return null;
	if(typeof object == 'string') return object;
	return Object.toQueryString.worker(object,name).join('&');
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
					parts2 = parts2.concat( Form.object_stringify.worker(value, name+'['+thing+']')   );
				}else{
					parts2 = parts2.concat( Form.object_stringify.worker(value, thing)  );
				}
			}
		}
	}
	return parts2;
};

Object.extend(String.prototype, {
	capitalize : function() {
    	return this.slice(0,1).toUpperCase()+this.slice(1);
	},
	uncapitalize : function() {
    	return this.slice(0,1).toLowerCase()+this.slice(1);
	},
	include : function(pattern){
		return this.indexOf(pattern) > -1;
	},
	chomp : function(str){
	    var index = this.lastIndexOf(str);
	    return (index != -1 ? this.slice(0, index): this);
	},
	ends_with : function(pattern) {
	    var d = this.length - pattern.length;
	    return d >= 0 && this.lastIndexOf(pattern) === d;
	}
});
$MVC.String.camelize = function(string){
	var parts = string.split(/_|-/);
		for(var i = 0; i < parts.length; i++){
			parts[i] = parts[i].capitalize();
		}
		return parts.join('');
};


Date.month_names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

Object.extend(Date.prototype, {
	month_name: function() {
		return Date.month_names[this.getMonth()-1];
	},
	number_of_days_in_month : function() {
	    var year = this.getFullYear();
	    var month = this.getMonth();
	    var m = [31,28,31,30,31,30,31,31,30,31,30,31];
	    if (month != 1) return m[month];
	    if (year%4 != 0) return m[1];
	    if (year%100 == 0 && year%400 != 0) return m[1];
	    return m[1] + 1;
	}
});


//Array helpers
Array.from = function(iterable){
	if (!iterable) return [];
	return jQuery.makeArray(iterable);
}

Array.prototype.include = function(thing){
	return jQuery.inArray(thing, this) != -1;
};

//Function Helpers
if(typeof Function.prototype.bind == 'undefined'){
	Function.prototype.bind = function() {
	  var args = Array.from(arguments);
	  args.shift();
	  var __method = this, object = arguments[0];
	  return function() {
	    return __method.apply(object, args.concat(Array.from(arguments) )  );
	  }
	};
}


$E = function(id){
	return $('#'+id)[0]
};


$MVC.Browser = {
    IE:     !!(window.attachEvent && !window.opera),
    Opera:  !!window.opera,
    WebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
    Gecko:  navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') == -1,
    MobileSafari: !!navigator.userAgent.match(/Apple.*Mobile.*Safari/)
};