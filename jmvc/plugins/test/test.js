$MVC.Test = function(){};
$MVC.Test.window = window.open($MVC.root+'/plugins/test/test.html', null, "width=600,height=400,resizable=yes");
$MVC.Test.add_test = function(test){
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


$MVC.Test.prototype = {
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
$MVC.Tests = [];





$MVC.Test.Controller = function(model_name, actions){
	var newt = new $MVC.Test.Controller.Functions(model_name, actions);
	window[model_name.camelize()+'TestController'] = newt
	window[model_name.camelize()+'TestController'].klass_name = model_name.camelize()+'ControllerTest';
	
	$MVC.Test.add_test(newt)
}
//runs actions
$MVC.Test.Controller.Functions = function(model_name, actions){
	this.controller = window[model_name.camelize()+'Controller']
	
	var reg_actions = $MVC.Object.extend({}, this.controller.actions()) ;
	
	
	this.actions = [];
	this.untested = [];
	
	for(var i = 0; i < actions.length; i++){
		var act = new $MVC.Test.Controller.Action(actions[i]);
		act.controller = this;
		this.actions.push(act);
		if(reg_actions[act.name])
			delete reg_actions[act.name];
	}
	for(var action_name in reg_actions){
		if(!reg_actions[action_name].event_type) continue;
		var act = new $MVC.Test.Controller.Action({action_name: action_name, func: function(){} } );
		act.controller = this;
		this.untested.push(act);
	}
};
$MVC.Test.Controller.Functions.prototype = {
	run: function(){
		var newtest = new $MVC.Test()
		for(var a = 0; a < this.actions.length; a++){
			this.actions[a].run(this.controller, newtest);
		}
	},
	run_action: function(name){
		var newtest = new $MVC.Test()
		for(var a = 0; a < this.actions.length; a++){
			if(this.actions[a].name == name)
				this.actions[a].run(this.controller, newtest);
		}
		for(var a = 0; a < this.untested.length; a++){
			if(this.untested[a].name == name)
				this.untested[a].run(this.controller, newtest);
		}
	},
	toString : function(){
		return this.klass_name;
	}
}

$MVC.Test.Controller.Action = function(action){
	this.name = action.action_name;
	this.selector = action.selector || 0;
	this.func = action.func;
}
$MVC.Test.Controller.Action.prototype = {
	//given a controller
	//looks up the actions it is going to call
	//uses a css selector or the first element it finds (you can pass in a css selector or number
	//calls the event, calls the function
	run : function(controller, test){
		var action = controller.actions()[this.name];
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
		
		if(document.createEvent) 			this.createEvent(element);
		else if(document.createEventObject) this.createEventObject(element);
		else								throw "Your browser doesn't support dispatching events"
		if(element.dispatchEvent)			element.dispatchEvent(this.event)
		else if(element.fireEvent)			element.fireEvent('on'+this.type, this.event);
		else								throw "Your browser doesn't support dispatching events";
		return this.event;
	},
	createEvent : function(element){
		if(['click','dblclick','mouseover','mouseout','mousemove','mousedown','mouseup','contextmenu'].include(this.type))
			this.createMouseEvent();
		else if(['keypress'].include(this.type))
			this.createKeypressEvents(element);
	},
	createEventObject : function(element){
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
	},
	createKeypressEvents : function(element) {
	  element.focus();
	  for(var i=0; i<this.options.write.length; i++) {
	    this.createKeypressEvent(element,this.options.write.charCodeAt(i));
	  }
	},
	createKeypressEvent : function(element, character) {
		  var options = $MVC.Object.extend({
		    ctrlKey: false,
		    altKey: false,
		    shiftKey: false,
		    metaKey: false,
		    keyCode: 0,
		    charCode: character
		  }, arguments[2] || {});
		
		  var oEvent = document.createEvent("KeyEvents");
		  oEvent.initKeyEvent(this.type, true, true, window, 
		    options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
		    options.keyCode, options.charCode );
		  element.dispatchEvent(oEvent);
	},
	createMouseEvent : function(){
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

