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
		this.test_array = [];
		for(var t in this.tests) {
			if(t.indexOf('test') == 0) this.test_names.push(t);
			this.test_array.push(t);
		}
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
	},
	run: function(callback){
		this.working_test = 0;
		this.callback = callback;
		this.run_next();
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
	toElement : function(){
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
		var t = $MVC.Test.window.document.createElement('div');
		t.className = 'test'
		t.innerHTML  = txt;
		return t;
	}
});

$MVC.Tests = {};
$MVC.Test.add = function(test){
	$MVC.Tests[test.name] = test
	
	var insert_into = $MVC.Test.window.document.getElementById(test.type+'_tests');
	insert_into.appendChild(test.toElement());
}

//almsot everything in here should be private
$MVC.Test.Assertions =  $MVC.Class.extend({
	init: function( test, test_name, remainder){
		this._test = test;
		this._test_name = test_name;
		this._delays = 0;
		this._remainder = remainder;
		this._last_called = test_name;
		$MVC.Test.window.running(this._test, this._test_name);
		
		if(this.setup) 
			this._setup();
		else{
			this._start();
		}
			
		
			
	},
	_start : function(){
		this._test.tests[this._test_name].call(this);
		this._update();
	},
	_setup : function(){
		var next = this.next;
		var time;
		this.next = function(t){
			time = t ? t*1000 : 1000;
		}
		this.setup();
		this.next = next;
		if(time){
			var t = this;
			var _start = this._start;
			setTimeout(
				function(){
					_start.call(t);
				}, time
			);
		}else{
			this._start();	
		}
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
	assertNull: function(obj) {
	    var message = arguments[1] || 'assertNull'
	    try { (obj==null) ? this.pass() : 
	      this.fail(message + ': got "' + $MVC.Test.inspect(obj) + '"'); }
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
	next: function(params,delay, fname){
		if(!fname){
			for(var i = 0; i < this._test.test_array.length; i++){
				if(this._test.test_array[i] == this._last_called){
					fname = this._test.test_array[i+1]; break;
				}
			}
		}
		this._delays ++;
		delay = delay ? delay*1000 : 1000;
		var assert = this;
		var  func = this._test.tests[fname];
		setTimeout(function(){
			assert._last_called = fname;
			try{
				func.call(assert, params);
			}catch(e){ assert.error(e); }
			assert._delays--;
			assert._update();
		}, delay)
	},
	next_callback: function(fname,delay){
		this._delays ++;
		var assert = this;
		func = this._test.tests[fname];
		var f = function(){
			try{
				func.apply(assert, arguments);
			}catch(e){ assert.error(e); }
			assert._delays--;
			assert._update();
		}
		if(!delay) return f;
		return function(){
			setTimeout(f, delay*1000)
		}
	},
	_update : function(){
		if(this._delays == 0){
			if(this.teardown) this.teardown()
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
		this._super('functional',  name, tests);
		$MVC.Test.Functional.tests.push(this)
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
$MVC.Test.Functional.events = ['change','click','contextmenu','dblclick','keypress','mousedown','mousemove','mouseout','mouseover','mouseup','reset','resize','scroll','select','submit','dblclick','focus','blur','load','unload','drag'];
$MVC.Test.Functional.tests = [];
$MVC.Test.Functional.run = function(callback){
	var t = $MVC.Test.Functional;
	t.working_test = 0;
	t.callback = callback;
	t.run_next();
}
$MVC.Test.Functional.run_next = function(){
	var t = $MVC.Test.Functional;
	if(t.working_test != null && t.working_test < t.tests.length){
			t.working_test++;
			t.tests[t.working_test-1].run( t.run_next )
	}else if(t.callback){
		t.working_test = null;
		t.callback();
		t.callback = null;
	}
}

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
if(!$MVC.Test.window)
	alert('Testing needs to open up a pop-up window.  Please enable popups and REFRESH this page.')

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
		//if(this.type == 'submit') return element.submit();
		if(this.type == 'write') return this.write(element);
		if(this.type == 'drag') return this.drag(element);
		
		return this.create_event(element)
	},
	create_event: function(element){
		if(document.createEvent) {
			this.createW3CEvent(element);
		} else if (document.createEventObject) {
			this.createIEEvent(element);
		} else
			throw "Your browser doesn't support dispatching events";
		
		return this.event;
	},
	createW3CEvent : function(element) {
		if(this.type == 'keypress')
			this.createW3CKeypressEvent(element, this.options.character);
		else if(this.type == 'submit')
			this.createW3CSubmitEvent(element);
		else if(['click','dblclick','mouseover','mouseout','mousemove','mousedown','mouseup','contextmenu'].include(this.type))
			this.createW3CMouseEvent(element);
	},
	createIEEvent : function(element) {
		if(this.type == 'keypress')
			this.createIEKeypressEvent(element, this.options.character);
		else if(this.type == 'submit')
			this.createIESubmitEvent(element);
		else if(['click','dblclick','mouseover','mouseout','mousemove','mousedown','mouseup','contextmenu'].include(this.type))
			this.createIEMouseEvent(element);
	},
	simulateEvent : function(element) {
		if(element.dispatchEvent)			element.dispatchEvent(this.event)
		else if(element.fireEvent)			element.fireEvent('on'+this.type, this.event);
		else								throw "Your browser doesn't support dispatching events";
	},
	createW3CSubmitEvent : function(element) {
        this.event = document.createEvent("Events");
        this.event.initEvent(this.type, true, true ); 
		this.simulateEvent(element);
	},
	createIESubmitEvent : function(element) {
		// if using controller
		if($MVC.Controller) {
			// look for submit input
			for(var i=0; i<element.elements.length; i++) {
				var el = element.elements[i];
				// if found, click it
				if(el.nodeName.toLowerCase()=='input' && el.type.toLowerCase() == 'submit')
					return (new $MVC.SyntheticEvent('click').send(el));
			}
			// if not, find a text input and click enter
			// look for submit input
			for(var i=0; i<element.elements.length; i++) {
				var el = element.elements[i];
				// if found, click it
				if((el.nodeName.toLowerCase()=='input' && el.type.toLowerCase() == 'text') || el.nodeName.toLowerCase() == 'textarea')
					return (new $MVC.SyntheticEvent('keypress', {keyCode: 13}).send(el));
			}
		} else {
			// if not using controller, fire event normally 
			//   - should trigger event handlers not using event delegation
	        this.event = document.createEventObject();
	        this.simulateEvent(element);
		}
	},
	write : function(element) {
		element.focus();
		this.type = 'keypress';
		var text = this.options.text || this.options;
		for(var i = 0; i < text.length; i++) {
			if(document.createEvent) {
				this.createW3CKeypressEvent(element, text.substr(i,1));
			} else if (document.createEventObject) {
				this.createIEKeypressEvent(element, text.substr(i,1));
			} else
				throw "Your browser doesn't support dispatching events";
		}
	},
	createW3CKeypressEvent : function(element, character) {
		this.event = document.createEvent("KeyEvents");
		var options = $MVC.Object.extend({
			ctrlKey: false,
			altKey: false,
			shiftKey: false,
			metaKey: false,
			keyCode: this.options.keyCode || 0,
			charCode: (character? character.charCodeAt(0) : 0)
		}, arguments[2] || {});
		this.event.initKeyEvent(this.type, true, true, window, 
		options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
		options.keyCode, options.charCode );
		this.simulateEvent(element);
		if(!$MVC.Browser.Gecko && character && (element.nodeName.toLowerCase() == 'input' || element.nodeName.toLowerCase() == 'textarea')) element.value += character;
	},
	createIEKeypressEvent : function(element, character) {
		this.event = document.createEventObject();
		
  		this.event.charCode = (character? character.charCodeAt(0) : 0);
  		this.event.keyCode = this.options.keyCode || (character? character.charCodeAt(0) : 0);
		this.simulateEvent(element);
		// check if isKilled
		if(!$MVC.Browser.Gecko && character && (element.nodeName.toLowerCase() == 'input' || element.nodeName.toLowerCase() == 'textarea')) element.value += character;
	},
	createW3CMouseEvent : function(element){
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
		this.simulateEvent(element);
	},
	createIEMouseEvent : function(element){
		this.event = document.createEventObject();
		var center = $MVC.Test.center(element);
		var defaults =$MVC.Object.extend({
			bubbles : true,
			cancelable : true,
			view : window,
			detail : 1,
			screenX : 1, screenY : 1,
			clientX : center[0], clientY : center[1],
			ctrlKey : false, altKey : false, shiftKey : false, metaKey : false,
			button : (this.type == 'contextmenu' ? 2 : 1), 
			relatedTarget : null
		}, this.options);
		
		$MVC.Object.extend(this.event, defaults);
		if(!$MVC.Browser.Gecko && 
			(element.nodeName.toLowerCase() == 'input' || 
			(element.type && element.type.toLowerCase() == 'checkbox'))) 
			element.checked = (element.checked ? false : true);
		this.simulateEvent(element);
	},
	drag: function(target){
		//get from and to
		
		var addxy = function(part, options){
			if(!options[part].x || !options[part].y ){
				if(typeof options[part] == 'string') options[part] = document.getElementById(options[part])
				var center = $MVC.Test.center(options[part]);
				options[part].x = center.left;
				options[part].y = center.top;
			}
		}
		addxy('from', this.options);
		addxy('to', this.options);
		if(this.options.duration){
			return new $MVC.Test.Drag(target, this.options)
		}
		var x = this.options.from.x;
		var y = this.options.from.y;
		var steps = this.options.steps || 100;
		
		this.type = 'mousedown';
		this.options.clientX = x;
		this.options.clientY = y;
		this.create_event(target);
		
		this.type = 'mousemove';
		for(var i = 0; i < steps; i++){
			x = this.options.from.x + (i * (this.options.to.x - this.options.from.x )) / steps;
			y = this.options.from.y + (i * (this.options.to.y - this.options.from.y )) / steps;
			this.options.clientX = x;
			this.options.clientY = y;
			this.create_event(target);
		}
	}
};
$MVC.Test.Drag = function(target , options){
	this.callback = options.callback;
	this.start_x = options.from.x;
	this.end_x = options.to.x;
	this.delta_x = this.end_x - this.start_x;
	this.start_y = options.from.y;
	this.end_y = options.to.y;
	this.delta_y = this.end_y - this.start_y;
	this.target = target;
	this.duration = options.duration ? options.duration*1000 : 1000;
	this.start = new Date();
	new $MVC.SyntheticEvent('mousedown', {clientX: this.start_x, clientY: this.start_y}).send(target);
	
	this.pointer = document.createElement('div')
	this.pointer.style.width = '10px'
	this.pointer.style.height = '10px'
	this.pointer.style.backgroundColor = 'RED'
	this.pointer.style.position = 'absolute'
	this.pointer.style.left = ''+this.start_x+'px'
	this.pointer.style.top = ''+this.start_y+'px'
	this.pointer.style.lineHeight = '1px'
	document.body.appendChild(this.pointer)
	setTimeout(this.next_callback(), 20);
};
$MVC.Test.Drag.prototype = {
	next: function(){
		var now = new Date();
		var difference = now - this.start;
		if( difference > this.duration ){
			new $MVC.SyntheticEvent('mousemove', {clientX: this.end_x, clientY: this.end_y}).send(this.target);
			var event = new $MVC.SyntheticEvent('mouseup', {clientX: this.end_x, clientY: this.end_y}).send(this.target);
			this.pointer.parentNode.removeChild(this.pointer);
			if(this.callback) this.callback({event: event, element: this.target});
		}else{
			var percent = difference / this.duration;
			var x =  this.start_x + percent * this.delta_x;
			var y = this.start_y + percent * this.delta_y;
			
			this.pointer.style.left = ''+x+'px';
			this.pointer.style.top = ''+y+'px';
			new $MVC.SyntheticEvent('mousemove', {clientX: x, clientY: y}).send(this.target);
			setTimeout(this.next_callback(), 20);
		}
	},
	next_callback : function(){
		var t = this;
		return function(){
			t.next();
		};
	}
};

/*basically just converts this into an object ControllerTest will like*/
$MVC.test = function(action_name, selector, f){
	if(!f){ f = selector; selector = null;}
	return {action_name: action_name, selector: selector, func: f};	
};



test = $MVC.test;
//from prototype
$MVC.Test.get_dimensions = function(element){

    var display = element.style.display;
    if (display != 'none' && display != null) // Safari bug
      return {width: element.offsetWidth, height: element.offsetHeight};

    // All *Width and *Height properties give 0 on elements with display none,
    // so enable the element temporarily
    var els = element.style;
    var originalVisibility = els.visibility;
    var originalPosition = els.position;
    var originalDisplay = els.display;
    els.visibility = 'hidden';
    els.position = 'absolute';
    els.display = 'block';
    var originalWidth = element.clientWidth;
    var originalHeight = element.clientHeight;
    els.display = originalDisplay;
    els.position = originalPosition;
    els.visibility = originalVisibility;
    return {width: originalWidth, height: originalHeight};
}

$MVC.Test.center= function(element) {
    var d = $MVC.Test.get_dimensions(element)
	var valueT = d.height / 2, valueL =d.width / 2;
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

