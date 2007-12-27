JMVC.check_dependency('Prototype', 'Helpers.js')
JMVC.check_dependency('Element', 'Helpers.js')
JMVC.check_dependency('Element.Methods', 'Helpers.js')



JMVC.Event = {
	events_hash : {},
	register_event : function(event_name, func) {
		if(!this.events_hash[event_name])
			this.events_hash[event_name] = [];
		this.events_hash[event_name].push(func);
	},
	fire_event : function(event_name) {
		if(!this.events_hash[event_name]) return;
		for(var i=0; i<this.events_hash[event_name].length; i++) {
			this.events_hash[event_name][i]();
		}
		delete this.events_hash[event_name];
	}
}


String.prototype.uncapitalize = function()            
{
    return this.slice(0,1).toLowerCase()+this.slice(1)
}
//chomp function for strings
String.prototype.chomp = function(str)             
{
    var index = this.lastIndexOf(str)
    if(index!= -1)
        return this.slice(0, index)
    else
        return this
}
String.prototype.first_capitalize = function() {
    return this.substring(0,1).capitalize()+this.substring(1);
}
String.prototype.name = function()
{
    return this.replace(/[_!@\#\$\%^&*()\<\>\"\'\\?,.\{\}\[\]~\- ]/g, '').uncapitalize()
}
Array.prototype.last = function()
{
    return this[this.length - 1]
}
/**
 * Adds one array to another
 * @param {Object} array
 */
Array.prototype.add = function(array){
	var len;
	for (var index = 0, len = array.length; index < len; ++index){
		this.push(array[index])
	}
	return array
}
String.prototype.replace_angle_brackets = function() {
	return this.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}


Date.from_sql = function(data) {
    if(typeof data == "string") {
        var date_format_1 = /\d{4}-\d{1,2}-\d{1,2}/
        var date_format_2 = /\d{4}\/\d{1,2}\/\d{1,2}/
        var date_format_3 = /\d{4}-\d{1,2}-\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}/
        if(data.match(date_format_3)) {
			var timeArr = data.match(date_format_3)[0].split(' ')[1].split(':');
            var dateArr = data.match(date_format_3)[0].split(' ')[0].split('-');
            return new Date(parseInt(dateArr[0], 10), (parseInt(dateArr[1], 10)-1), parseInt(dateArr[2], 10), 
				parseInt(timeArr[0], 10), parseInt(timeArr[1], 10), parseInt(timeArr[2], 10));
        }
        if(data.match(date_format_1)) {
            var dateArr = data.match(date_format_1)[0].split('-');
            return new Date(parseInt(dateArr[0], 10), (parseInt(dateArr[1], 10)-1), parseInt(dateArr[2], 10));
        }
        if(data.match(date_format_2)) {
            var dateArr = data.match(date_format_2)[0].split('/');
            return new Date(parseInt(dateArr[0], 10), (parseInt(dateArr[1], 10)-1), parseInt(dateArr[2], 10));
        }
    }
    return null;
}
Date.prototype.to_sql = function() {
    return [this.getFullYear(), '-', (this.getMonth()+1), '-', this.getDate(), ' ', 
		this.getHours(), ':', this.getMinutes(), ':', this.getSeconds()].join('');
}
Date.month_names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
Date.prototype.month_name = function() {
	return Date.month_names[this.getMonth()-1];
}
Date.prototype.number_of_days_in_month = function() {
    var year = this.getFullYear();
    var month = this.getMonth();
    var m = [31,28,31,30,31,30,31,31,30,31,30,31];
    if (month != 1) return m[month];
    if (year%4 != 0) return m[1];
    if (year%100 == 0 && year%400 != 0) return m[1];
    return m[1] + 1;
}
/* Cross-Browser Split v0.1; MIT-style license
By Steven Levithan <http://stevenlevithan.com>
An ECMA-compliant, uniform cross-browser split method */

String.prototype.split = function(separator, limit) {
	var flags = "";
	
	/* Behavior for separator: If it's...
	- Undefined: Return an array containing one element consisting of the entire string
	- A regexp or string: Use it
	- Anything else: Convert it to a string, then use it */
	if (separator === undefined) {
		return [this.toString()]; // toString is used because the typeof this is object
	} else if (separator === null || separator.constructor !== RegExp) {
		// Convert to a regex with escaped metacharacters
		separator = new RegExp(String(separator).replace(/[.*+?^${}()|[\]\/\\]/g, "\\$&"), "g");
	} else {
		flags = separator.toString().replace(/^[\S\s]+\//, "");
		if (!separator.global) {
			separator = new RegExp(separator.source, "g" + flags);
		}
	}
	
	// Used for the IE non-participating capturing group fix
	var separator2 = new RegExp("^" + separator.source + "$", flags);
	
	/* Behavior for limit: If it's...
	- Undefined: No limit
	- Zero: Return an empty array
	- A positive number: Use limit after dropping any decimal value (if it's then zero, return an empty array)
	- A negative number: No limit, same as if limit is undefined
	- A type/value which can be converted to a number: Convert, then use the above rules
	- A type/value which cannot be converted to a number: Return an empty array */
	if (limit === undefined || +limit < 0) {
		limit = false;
	} else {
		limit = Math.floor(+limit);
		if (!limit) return []; // NaN and 0 (the values which will trigger the condition here) are both falsy
	}
	
	var match,
		output = [],
		lastLastIndex = 0,
		i = 0;
	
	while ((limit ? i++ <= limit : true) && (match = separator.exec(this))) {
		// Fix IE's infinite-loop-resistant but incorrect RegExp.lastIndex
		if ((match[0].length === 0) && (separator.lastIndex > match.index)) {
			separator.lastIndex--;
		}
		
		if (separator.lastIndex > lastLastIndex) {
			/* Fix IE to return undefined for non-participating capturing groups (NPCGs). Although IE
			incorrectly uses empty strings for NPCGs with the exec method, it uses undefined for NPCGs
			with the replace method. Conversely, Firefox incorrectly uses empty strings for NPCGs with
			the replace and split methods, but uses undefined with the exec method. Crazy! */
			if (match.length > 1) {
				match[0].replace(separator2, function(){
					for (var j = 1; j < arguments.length - 2; j++){
						if (arguments[j] === undefined) match[j] = undefined;
					}
				});
			}
			
			output = output.concat(this.substring(lastLastIndex, match.index), (match.index === this.length ? [] : match.slice(1)));
			lastLastIndex = separator.lastIndex;
		}
		
		if (match[0].length === 0) {
			separator.lastIndex++;
		}
	}
	
	return (lastLastIndex === this.length)
		? (separator.test("") ? output : output.concat(""))
		: (limit ? output : output.concat(this.substring(lastLastIndex)));
};