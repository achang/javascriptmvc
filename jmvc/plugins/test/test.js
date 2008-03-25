(function() {
	var checkExists = function(path){
		$MVC.Console.log('Checking if '+path+' exists')
		var xhr=createXHR(path);
	    try{xhr.send(null);}
	    catch(e){if ( xhr.status == 404 || xhr.status == 2 ||(xhr.status == 0 && xhr.responseText == '') ) return false}
	    if ( xhr.status == 404 || xhr.status == 2 ||(xhr.status == 0 && xhr.responseText == '') ) return false;
	    return true;
	}
	
	function createXHR(path){
	   var factories = [function() { return new XMLHttpRequest(); }, function() { return new ActiveXObject("Msxml2.XMLHTTP"); },function() { return new ActiveXObject("Microsoft.XMLHTTP"); }];
	   for(var i = 0; i < factories.length; i++) {
	        try {
	            var request = factories[i]();
				request.open("HEAD", path, false);
	            if (request != null)  return request;
	        }
	        catch(e) { continue;}
	   }
	}
	
	if(checkExists($MVC.application_root+'apps/'+$MVC.script_options[0]+'_test.js'))
		include($MVC.application_root+'apps/'+$MVC.script_options[0]+'_test');
})();

(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  $MVC.Class = function(){};
  // Create a new Class that inherits from this class
  $MVC.Class.extend = function(prop) {
    var _super = this.prototype;
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);       
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    // Populate our constructed prototype object
    Class.prototype = prototype;
    // Enforce the constructor to be what we expect
    Class.constructor = Class;
    // And make this class extendable
    Class.extend = arguments.callee;
    return Class;
  };
})();



$MVC.Test = $MVC.Class.extend({
	init: function( type,name, tests  ){
		this.type = type;
		this.tests = tests;
		this.test_names = [];
		for(var t in this.tests) if(t.indexOf('test') == 0) this.test_names.push(t);
		this.name = name;
		this.Assertions = $MVC.Test.Assertions.extend(this.helpers()); //overwrite helpers
		this.assertions = 0;
		this.failures = 0;
		$MVC.Test.add(this);
	},
	helpers : function(){
		var helpers = {};
		for(var t in this.tests){
			if(t.indexOf('test') != 0){
				helpers[t] = this.tests[t];
			}
		}
		return helpers;
	},
	run_test: function(test_id){
		var assertions = new this.Assertions(this, test_id);
		
		this.tests[test_id].call(assertions);
		assertions._update();
	},
	run: function(callback){
		this.working_test = 0;
		this.run_next();
		this.callback = callback;
	},
	run_next: function(){
		if(this.working_test != null && this.working_test < this.test_names.length){
			this.working_test++;
			this.run_test(this.test_names[this.working_test-1])
		}else if(this.callback){
			this.callback();
			this.callback = null;
			this.working_test = null;
		}
	},
	toHTML : function(){
		var txt = "<h3><img class='min' src='minimize.png'/>   <img src='play.png' onclick='find_and_run(\""+this.name+"\")'/> "+this.name+"</h3>";
		txt+= "<table cellspacing='0px'><thead><tr><th>test</th><th>result</th></tr></thead><tbody>";
		for(var t in this.tests ){
			if(t.indexOf('test') != 0 ) continue;
			txt+= '<tr class="step" id="step_'+this.name+'_'+t+'">'+
			"<td class='name'>"+
			"<a href='javascript: void(0);' onclick='find_and_run(\""+this.name+"\",\""+t+"\")'>"+t+'</a></td>'+
			'<td class="result">&nbsp;</td></tr>'
		}
		txt+= "</tbody></table>";
		if(this.added_helpers){
			txt+= "<div class='helpers'>Helpers: "
			var helpers = [];
			for(var h in this.added_helpers)
				helpers.push( "<a href='javascript: void(0)'>"+h+"</a>")
			txt+= helpers.join(', ')+"</div>"
		}
		return txt;
	}
});

$MVC.Tests = {};
$MVC.Test.add = function(test){
	$MVC.Tests[test.name] = test
	$MVC.Test.window.add_test(test)
}

//almsot everything in here should be private
$MVC.Test.Assertions =  $MVC.Class.extend({
	init: function( test, test_name, remainder){
		this._test = test;
		this._test_name = test_name;
		this._delays = 0;
		this._remainder = remainder;
		$MVC.Test.window.running(this._test, this._test_name);
	},
	assert: function(expression) {
		var message = arguments[1] || 'assert: got "' + $MVC.Test.inspect(expression) + '"';
		try { expression ? this.pass() : 
			this.fail(message); }
		catch(e) { this.error(e); }
	},
  	assertEqual: function(expected, actual) {
		var message = arguments[2] || "assertEqual";
		try { (expected == actual) ? this.pass() :
			this.fail(message + ': expected "' + $MVC.Test.inspect(expected) + 
			'", actual "' + $MVC.Test.inspect(actual) + '"'); }
		catch(e) { this.error(e); }
  	},
	pass: function() {
    	this.assertions++;
	},
	fail: function(message) {
		this.failures++;
		this.messages.push("Failure: " + message);
	},
	error: function(error) {
	    this.errors++;
	    this.messages.push(error.name + ": "+ error.message + "(" + $MVC.Test.inspect(error) +")");
	 },
	assertions : 0,
	failures : 0,
	errors: 0,
	messages : [],
	delay: function(func, delay, params){
		this._delays ++;
		delay = delay || 1000;
		var assert = this;
		if(typeof func == 'string') func = this._test.tests[func];
		setTimeout(function(){
			try{
				func.call(assert, params);
			}catch(e){ assert.error(e); }
			assert._delays--;
			assert._update();
		}, delay)
	},
	next: function(fname, params, delay){
		this.delay(fname, delay, params)
	},
	_update : function(){
		if(this._delays == 0){
			$MVC.Test.window.update(this._test, this._test_name, this);
			this._test.run_next();
		}
	}//this should also trigger next test probably
});



Function.prototype.curry = function() {
	var fn = this, args = Array.prototype.slice.call(arguments);
	return function() {
	  return fn.apply(this, args.concat(
	    Array.prototype.slice.call(arguments)));
	};
};



$MVC.Test.Functional = $MVC.Test.extend({
	init: function(name , tests ){
		this._super('functional',  name, tests)
	},
	helpers : function(){
		var helpers = this._super();
		helpers.Action =   function(event, selector, options){
			options = options || {};
			options.type = event.type;
			var number = 0;
			if(typeof event == 'string') event = {type: event};
			
			if(typeof options == 'number') 		 number = options || 0;
			else if (typeof options == 'object') number = options.number || 0;
			var element;
			
			if(typeof selector == 'string') element = $MVC.CSSQuery(selector)[number]
			else element = selector;
			var se = new $MVC.SyntheticEvent(event.type, options);
			var event = se.send(element);
			return {event: event, element: element, options: options};
		}
		for(var e = 0; e < $MVC.Test.Functional.events.length; e++){
			var event = $MVC.Test.Functional.events[e];
			helpers[event.capitalize()] = helpers.Action.curry(event)
		}
		return helpers;
	}
});
$MVC.Test.Functional.events = ['change','click','contextmenu','dblclick','keypress','mousedown','mousemove','mouseout','mouseover','mouseup','reset','resize','scroll','select','submit','dblclick','focus','blur','load','unload'];


$MVC.Test.Controller = $MVC.Test.Functional.extend({
	init: function(name , tests ){
		var controller_name = $MVC.String.camelize(name)+'Controller';
		this.controller = window[controller_name];
		if(!this.controller) alert('There is no controller named '+controller_name);
		this.unit = name;
		this._super($MVC.String.camelize(name)+'TestController', tests);
	},
	helpers : function(){
		var helpers = this._super();
		var actions = $MVC.Object.extend({}, this.controller.actions()) ;
		this.added_helpers = {};
		for(var action_name in actions){
			if(!actions[action_name].event_type) continue;
			var event_type = actions[action_name].event_type;
			var cleaned_name = actions[action_name].selector.replace(/\.|#/g, '')+' '+event_type;
			var helper_name = cleaned_name.replace(/(\w*)/g, function(m,part){ 
				return $MVC.String.capitalize(part)}
			).replace(/ /g, '');
			var test_name = 'test_'+cleaned_name.replace(/ /g, '_');
			
			helpers[helper_name] = helpers[event_type.capitalize()].curry(actions[action_name].selector);
			this.added_helpers[helper_name] = helpers[helper_name];
			
			//now go through tests and see if one of these is being tested			
			/*var found = false;
			for(var t in this.tests){
				if(t.indexOf(test_name) == 0){
					var test = this.tests[t];
					this.tests[t] = function(){
						test(helpers[helper_name]()); // might need to pass the thing into name
					};
					found = true;
				}
			}
			if(!found){
				this.tests[test_name] = helpers[helper_name]
			}*/
		}
		return helpers;
	}
});














$MVC.Test.window = window.open($MVC.root+'/plugins/test/test.html', null, "width=600,height=400,resizable=yes,scrollbars=yes");


$MVC.Test.window.get_tests = function(){
	return $MVC.Tests;
} 


$MVC.Test.inspect =  function(object) {
	try {
		if (object === undefined) return 'undefined';
		if (object === null) return 'null';
		return object.inspect ? object.inspect() : object.toString();
	} catch (e) {
		if (e instanceof RangeError) return '...';
		throw e;
	}
};

//we need to create the helper functions
//maybe each class has its assertions class




$MVC.Test.Controller.Action = function(action){
	this.name = action.action_name;
	this.selector = action.selector || 0;
	this.func = action.func;
	this.checked_default = true;
}
$MVC.Test.Controller.Action.prototype = {
	//given a controller
	//looks up the actions it is going to call
	//uses a css selector or the first element it finds (you can pass in a css selector or number
	//calls the event, calls the function
	run : function(test){
		var action = this.controller.actions()[this.name];
		var selector, number;
		var options = {};
		if(typeof this.selector == 'string'){
			selector = this.selector;
			number = 0;
		} else if(typeof this.selector == 'object') {
			selector = action.selector;
			options.write = this.selector.write || '';
			number = this.selector.selector || 0;
		}else{
			selector = action.selector;
			number = this.selector;
		}
		var target = $MVC.CSSQuery(selector)[number];
		
		var e = new $MVC.SyntheticEvent(action.event_type, options).send( target)
		
		this.func.call(test, {event: e, element: target})
	},
	toString : function(){
		return this.name;
	},
	toHTML : function(){
		return "<li><a href='javascript: void(0);' onclick='"+this.controller.toString()+".run_action(\""+this.toString()+"\")'>"+this.toString()+"</a></li>"
	}
}



$MVC.SyntheticEvent = function(type, options){
	this.type = type;
	this.options = options || {};
}
$MVC.SyntheticEvent.prototype = {
	send : function(element){
		if(this.type == 'focus') return element.focus();
		if(this.type == 'blur') return element.blur();
		if(this.type == 'submit') return element.submit();
		
		if(this.type == 'keypress')
			this.createKeypressEvents(element);
		else if(['click','dblclick','mouseover','mouseout','mousemove','mousedown','mouseup','contextmenu'].include(this.type))
			this.createMouseEvent(element);
		
		return this.event;
	},
	simulateEvent : function(element) {
		if(element.dispatchEvent)			element.dispatchEvent(this.event)
		else if(element.fireEvent)			element.fireEvent('on'+this.type, this.event);
		else								throw "Your browser doesn't support dispatching events";
	},
	createKeypressEvents : function(element) {
		element.focus();
		for(var i=0; i<this.options.write.length; i++) {
			this.createKeypressEvent(element,this.options.write.substr(i,1));
			this.simulateEvent(element);
		}
	},
	createKeypressEvent : function(element, character) {
		if(document.createEvent) {
			var options = $MVC.Object.extend({
				ctrlKey: false,
				altKey: false,
				shiftKey: false,
				metaKey: false,
				keyCode: 0,
				charCode: character.charCodeAt(0)
			}, arguments[2] || {});
			
			this.event = document.createEvent("KeyEvents");
			this.event.initKeyEvent(this.type, true, true, window, 
			options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
			options.keyCode, options.charCode );
		} else if (document.createEventObject) {
			this.event = document.createEventObject();
			
	  		this.event.charCode = character.charCodeAt(0);
	  		this.event.keyCode = character.charCodeAt(0);
		} else
			throw "Your browser doesn't support dispatching events";
		if(!$MVC.Browser.Gecko && (element.nodeName.toLowerCase() == 'input' || element.nodeName.toLowerCase() == 'textarea')) element.value = element.value + character;
	},
	createKeypressEventObject : function(element, character) {
	    element.focus();
		if(!$MVC.Browser.Gecko) element.value = element.value + character;
	},
	createMouseEvent : function(element){
		if(document.createEvent) {
			this.event = document.createEvent('MouseEvents');
			var center = $MVC.Test.center(element);

			var defaults = $MVC.Object.extend({
				bubbles : true,cancelable : true,
				view : window,
				detail : 1,
				screenX : 366, screenY : 195,clientX : center[0], clientY : center[1],
				ctrlKey : false, altKey : false, shiftKey : false, metaKey : false,
				button : (this.type == 'contextmenu' ? 2 : 0), 
				relatedTarget : null
			}, this.options);
			
			this.event.initMouseEvent(this.type, 
				defaults.bubbles, defaults.cancelable, 
				defaults.view, 
				defaults.detail, 
				defaults.screenX, defaults.screenY,defaults.clientX,defaults.clientY,
				defaults.ctrlKey,defaults.altKey,defaults.shiftKey,defaults.metaKey,
				defaults.button,defaults.relatedTarget);
		} else if(document.createEventObject) {
			this.event = document.createEventObject();
			var defaults =$MVC.Object.extend({
				bubbles : true,
				cancelable : true,
				view : window,
				detail : 1,
				screenX : 1, screenY : 1,
				clientX : center[0], clientY : center[1],
				ctrlKey : false, altKey : false, shiftKey : false, metaKey : false,
				button : 0, 
				relatedTarget : null
			}, this.options);
			
			$MVC.Object.extend(this.event, defaults);
		} else
			throw "Your browser doesn't support dispatching events";
		this.simulateEvent(element);
	}
}
/*basically just converts this into an object ControllerTest will like*/
$MVC.test = function(action_name, selector, f){
	if(!f){ f = selector; selector = null;}
	return {action_name: action_name, selector: selector, func: f};	
};



test = $MVC.test;


$MVC.Test.center= function(element) {
    var valueT = element.clientHeight / 2, valueL =element.clientWidth / 2;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
    } while (element);
	var result = [valueL, valueT];
	result.left = valueL;
	result.top = valueT;
    return result;
};




(function(){
	var cont = include.controllers
	include.controllers = function(){
		cont.apply(null,arguments);
		include.app(function(i){
			$MVC.Console.log('Trying to load: '+'test/functional/'+i+'_controller_test')
			return 'test/functional/'+i+'_controller_test'
		}).apply(null, arguments);
		
	};
})()

