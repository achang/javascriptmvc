//adds check exist
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


//John Resig's class
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
		for(var t in this.tests) if(t.indexOf('test') != 0) helpers[t] = this.tests[t];
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
		txt += "<table cellspacing='0px'><thead><tr><th>test</th><th>result</th></tr></thead><tbody>";
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
		this.next = function(t){ time = t ? t*1000 : 1000;}
		this.setup();
		this.next = next;
		if(time){
			var t = this;
			var _start = this._start;
			setTimeout( function(){ _start.call(t); }, time);
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
	get_next_name :function(){
		for(var i = 0; i < this._test.test_array.length; i++){
			if(this._test.test_array[i] == this._last_called){
				return this._test.test_array[i+1];
			}
		}
	},
	_call_next_callback : function(fname, params){
		if(!fname) fname = this.get_next_name();
		var assert = this;
		var  func = this._test.tests[fname];
		return function(){
			assert._last_called = fname;
			var args = $MVC.Array.from(arguments);
			if(params) args.unshift(params)
			try{
				func.apply(assert, args);
			}catch(e){ assert.error(e); }
			assert._delays--;
			assert._update();
		};
	},
	next: function(params,delay, fname){
		this._delays ++;
		delay = delay ? delay*1000 : 1000;
		setTimeout(this._call_next_callback(fname, params), delay)
	},
	next_callback: function(fname,delay){
		this._delays++;
		var f = this._call_next_callback(fname)
		if(!delay) return f;
		return function(){
			setTimeout(f, delay*1000)
		};
	},
	_update : function(){
		if(this._delays == 0){
			if(this.teardown) this.teardown()
			$MVC.Test.window.update(this._test, this._test_name, this);
			this._test.run_next();
		}
	}
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
		helpers.Action =   function(event_type, selector, options){
			options = options || {};
			options.type = event_type;
			var number = 0;

			if(typeof options == 'number') 		 number = options || 0;
			else if (typeof options == 'object') number = options.number || 0;
			
			var element = typeof selector == 'string' ? $MVC.CSSQuery(selector)[number] : selector; //if not a selector assume element

			var event = new $MVC.SyntheticEvent(event_type, options).send(element);
			return {event: event, element: element, options: options};
		}
		for(var e = 0; e < $MVC.Test.Functional.events.length; e++){
			var event_name = $MVC.Test.Functional.events[e];
			helpers[$MVC.String.capitalize(event_name)] = helpers.Action.curry(event_name)
		}
		return helpers;
	}
});
$MVC.Test.Functional.events = ['change','click','contextmenu','dblclick','keyup','keydown','keypress','mousedown','mousemove','mouseout','mouseover','mouseup','reset','resize','scroll','select','submit','dblclick','focus','blur','load','unload','drag','write'];
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
			var helper_name = cleaned_name.replace(/(\w*)/g, function(m,part){ return $MVC.String.capitalize(part)}).replace(/ /g, '');
			helpers[helper_name] = helpers[event_type.capitalize()].curry(actions[action_name].selector);
			this.added_helpers[helper_name] = helpers[helper_name];
		}
		return helpers;
	}
});













$MVC.Test.window = window.open($MVC.root+'/plugins/test/test.html', null, "width=600,height=400,resizable=yes,scrollbars=yes");
if(!$MVC.Test.window)
	alert('Testing needs to open up a pop-up window.  Please enable popups and REFRESH this page.')

$MVC.Test.window.get_tests = function(){return $MVC.Tests; } 

//This function returns what something looks like
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




//Synthetic event class
$MVC.SyntheticEvent = function(type, options){
	this.type = type;
	this.options = options || {};
}
$MVC.SyntheticEvent.prototype = {
	send : function(element){
		this.firefox_autocomplete_off(element);
		if(this.type == 'focus') return element.focus();
		if(this.type == 'blur') return element.blur();
		if(this.type == 'write') return this.write(element);
		if(this.type == 'drag') return this.drag(element);
		
		return this.create_event(element)
	},
	firefox_autocomplete_off : function(element) {
		if($MVC.Browser.Gecko && element.nodeName.toLowerCase() == 'input' && element.getAttribute('autocomplete') != 'off')
			element.setAttribute('autocomplete','off');
	},
	create_event: function(element){
		if(document.createEvent) {
			this.createEvent(element);
		} else if (document.createEventObject) {
			this.createEventObject(element);
		} else
			throw "Your browser doesn't support dispatching events";
		
		return this.event;
	},
	createEvent : function(element) {
		if(['keypress','keyup','keydown'].include(this.type))
			this.createKeypress(element, this.options.character);
		else if(this.type == 'submit')
			this.createSubmit(element);
		else if(['click','dblclick','mouseover','mouseout','mousemove','mousedown','mouseup','contextmenu'].include(this.type))
			this.createMouse(element);
	},
	createEventObject : function(element) {
		if(['keypress','keyup','keydown'].include(this.type))
			this.createKeypressObject(element, this.options.character);
		else if(this.type == 'submit')
			this.createSubmitObject(element);
		else if(['click','dblclick','mouseover','mouseout','mousemove','mousedown','mouseup','contextmenu'].include(this.type))
			this.createMouseObject(element);
	},
	simulateEvent : function(element) {
		if(element.dispatchEvent) {
			return element.dispatchEvent(this.event);
		} else if(element.fireEvent) {
			return element.fireEvent('on'+this.type, this.event);
		} else
			throw "Your browser doesn't support dispatching events";
	},
	createSubmit : function(element) {
        this.event = document.createEvent("Events");
        this.event.initEvent(this.type, true, true ); 
		this.simulateEvent(element);
	},
	createSubmitObject : function(element) {
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
	createKeypress : function(element, character) {
		if(character && character.match(/\n/)) {
			this.options.keyCode = 13;
			character = 0;
		}
		var options = $MVC.Object.extend({
			ctrlKey: false,
			altKey: false,
			shiftKey: false,
			metaKey: false,
			keyCode: this.options.keyCode || 0,
			charCode: (character? character.charCodeAt(0) : 0)
		}, arguments[2] || {});
		try {
			this.event = document.createEvent("KeyEvents");
			this.event.initKeyEvent(this.type, true, true, window, 
			options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
			options.keyCode, options.charCode );
		} catch(e) {
			try {
				this.event = document.createEvent("Events");
			} catch(e2) {
				this.event = document.createEvent("UIEvents");
			} finally {
				this.event.initEvent(this.type, true, true);
				$MVC.Object.extend(this.event, options);
			}
		}
		var fire_event = this.simulateEvent(element);
		if(fire_event && this.type == 'keypress' && !$MVC.Browser.Gecko && character && 
			(element.nodeName.toLowerCase() == 'input' || element.nodeName.toLowerCase() == 'textarea')) element.value += character;
	},
	createKeypressObject : function(element, character) {
		if(character && character.match(/\n/)) {
			this.options.keyCode = 13;
			character = 0;
		}
		this.event = document.createEventObject();
		
  		this.event.charCode = (character? character.charCodeAt(0) : 0);
  		this.event.keyCode = this.options.keyCode || (character? character.charCodeAt(0) : 0);
		var fire_event = this.simulateEvent(element);
		if(fire_event && this.type == 'keypress' && !$MVC.Browser.Gecko && character && 
			(element.nodeName.toLowerCase() == 'input' || element.nodeName.toLowerCase() == 'textarea')) element.value += character;
	},
	createMouse : function(element){
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
	createMouseObject : function(element){
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
	},
	// syntax 1: this.Write(input_params.element, 'Brian');
	// syntax 2: this.Write(input_params.element, {text: 'Brian', callback: this.next_callback()});
	write : function(element) {
		element.focus();
		return new $MVC.Test.Write(element, this.options)
	}
};

$MVC.Test.Write = function(element, options){
	this.delay = 100;
	if(typeof options == 'string') {
		this.text = options;
		this.synchronous = true;
	} else {
		if(options.callback) 			this.callback = options.callback;
		if(options.text) 				this.text = options.text;
		if(options.synchronous == true) this.synchronous = true;
	}
	this.element = element;
	this.text_index = 1;
	if(this.synchronous == true) {
		for(var i = 0; i < this.text.length; i++) {
			this.write_character(this.text.substr(i,1));
		}
	} else {
		this.write_character(this.text.substr(0,1));
		setTimeout(this.next_callback(), this.delay);
	}
};
$MVC.Test.Write.prototype = {
	next: function(){
		if( this.text_index >= this.text.length){
			if(this.callback) 	
				this.callback({element: this.target});
			else
				return;
		}else{
			this.write_character(this.text.substr(this.text_index,1));
			this.text_index++;
			setTimeout(this.next_callback(), this.delay);
		}
	},
	write_character : function(character) {
		new $MVC.SyntheticEvent('keypress', {character: character}).send(this.element);
	},
	next_callback : function(){
		var t = this;
		return function(){
			t.next();
		};
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
			$MVC.Console.log('Trying to load: '+'../test/functional/'+i+'_controller_test')
			return '../test/functional/'+i+'_controller_test'
		}).apply(null, arguments);
		
	};
})()

