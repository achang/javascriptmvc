(function() {
	var checkExists = function(path){
		var xhr=createXHR();
		xhr.open("HEAD", path, false);
	    try{xhr.send(null);}
	    catch(e){if ( xhr.status == 404 || xhr.status == 2 ||(xhr.status == 0 && xhr.responseText == '') ) return false}
	    if ( xhr.status == 404 || xhr.status == 2 ||(xhr.status == 0 && xhr.responseText == '') ) return false;
	    return true;
	}
	
	function createXHR(){
	   var factories = [function() { return new ActiveXObject("Msxml2.XMLHTTP"); },function() { return new ActiveXObject("Microsoft.XMLHTTP"); },function() { return new XMLHttpRequest(); }];
	   for(var i = 0; i < factories.length; i++) {
	        try {
	            var request = factories[i]();
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
$MVC.Tests = [];
$MVC.Test = $MVC.Class.extend({
	init: function( type, steps, name ){
		this.type = type;
		this.steps = steps;
		this.id = $MVC.Tests.length;
		this.name = name;
		$MVC.Test.window.add_test(this)
		$MVC.Tests.push(this)
	},
	run_step: function(step){
		var assertions = new $MVC.Test.Assertions();
		if(typeof step == 'string'){
			for(var a = 0; a < this.steps.length; a++){
				if(this.steps[a].name == step) this.steps[a].run(assertions);
			}
		}else{
			this.steps[step].run(assertions)
		}
	},
	run: function(){
		var assertions = new $MVC.Test.Assertions();
		for(var a = 0; a < this.steps.length; a++){
			if($MVC.Test.window.step_checked(this.id, a))
				this.steps[a].run(assertions);
		}
	},
	add_test: function(){
		$MVC.Test.window.add_test(test)
		$MVC.Test.window[test.toString()] = function(){
			window.focus();
			test.run();
			//$MVC.Test.window.focus();
		};
		$MVC.Test.window[test.toString()].run_action = function(name){
			window.focus();
			test.run_action(name);
			//$MVC.Test.window.focus();
		};
		$MVC.Tests.push(test);
	}
});




$MVC.Test.Functional = $MVC.Test.extend({
	init: function(name ,steps ){
		this._super('functional', steps, name)
	}
});





$MVC.Test.window = window.open($MVC.root+'/plugins/test/test.html', null, "width=600,height=400,resizable=yes");


$MVC.Test.window.get_tests = function(){
	return $MVC.Tests;
} 

$MVC.Test.Assertions = function(){};

$MVC.Test.Assertions.prototype = {
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
	assertions : 0,
	failures : 0,
	messages : []
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



$MVC.Test.Controller = function(model_name, actions){
	var controller = window[model_name.camelize()+'Controller'];
	var reg_actions = $MVC.Object.extend({}, controller.actions()) ;
	var steps = [];
	
	for(var i = 0; i < actions.length; i++){
		var act = new $MVC.Test.Controller.Action(actions[i]);
		act.controller = controller;
		steps.push(act);
		if(reg_actions[act.name])
			delete reg_actions[act.name];
	}
	for(var action_name in reg_actions){
		if(!reg_actions[action_name].event_type) continue;
		var act = new $MVC.Test.Controller.Action({action_name: action_name, func: function(){} } );
		act.controller = controller;
		act.checked_default = false;
		steps.push(act);
	}
	
	var newt = new $MVC.Test.Functional(model_name.camelize()+'TestController', steps );
	window[model_name.camelize()+'TestController'] = newt
	window[model_name.camelize()+'TestController'].klass_name = model_name.camelize()+'ControllerTest';
}



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
			var defaults = $MVC.Object.extend({
				bubbles : true,cancelable : true,
				view : window,
				detail : 1,
				screenX : 366, screenY : 195,clientX : 169, clientY : 74,
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
				clientX : 1, clientY : 1,
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







(function(){
	var cont = include.controllers
	include.controllers = function(){
		cont.apply(null,arguments);
		include.app(function(i){return 'test/functional/'+i+'_controller_test'}).apply(null, arguments);
		
	};
})()

