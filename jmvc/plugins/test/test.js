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






$MVC.Test = $MVC.Class.extend({
	init: function( name, tests, type  ){
		this.type = type || 'unit';
		this.tests = tests;
		this.test_names = [];
		this.test_array = [];
		for(var t in this.tests) {
			if(t.indexOf('test') == 0) this.test_names.push(t);
			this.test_array.push(t);
		}
		this.name = name;
		this.Assertions = $MVC.Test.Assertions.extend(this.helpers()); //overwrite helpers
		this.passes = 0;
		this.failures = 0;
		$MVC.Test.add(this);
	},
	helpers : function(){
		var helpers = {};
		for(var t in this.tests) if(t.indexOf('test') != 0) helpers[t] = this.tests[t];
		return helpers;
	},
	run_test: function(test_id){
		this.assertions = new this.Assertions(this, test_id);
	},
	run: function(callback){
		this.working_test = 0;
		this.callback = callback;
		this.passes = 0;
		this.failures = 0;
		this.run_next();
	},
	run_next: function(){
		if(this.working_test != null && this.working_test < this.test_names.length){
			this.working_test++;
			this.run_test(this.test_names[this.working_test-1])
		}else if(this.working_test != null){
			$MVC.Test.window.update_test(this)
			this.working_test = null;
			if(this.callback){
				this.callback();
				this.callback = null;
			}
		}
	},
	toElement : function(){
		var txt = "<h3><img alt='run' src='playwhite.png' onclick='find_and_run(\""+this.name+"\")'/>"+this.name+" <span id='"+this.name+"_results'></span></h3>";
		txt += "<div class='table_container'><table cellspacing='0px'><thead><tr><th>tests</th><th>result</th></tr></thead><tbody>";
		for(var t in this.tests ){
			if(t.indexOf('test') != 0 ) continue;
			var name = t.substring(5)
			txt+= '<tr class="step" id="step_'+this.name+'_'+t+'">'+
			"<td class='name'>"+
			"<a href='javascript: void(0);' onclick='find_and_run(\""+this.name+"\",\""+t+"\")'>"+name+'</a></td>'+
			'<td class="result">&nbsp;</td></tr>'
		}
		txt+= "</tbody></table></div>";
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
	},
	pass : function(){
		this.passes++;
	},
	fail : function(){
		this.failures++;
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
		this.assertions = 0;
		this.failures = 0;
		this.errors= 0;
		this.messages = [];
		
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
		try{
			this._test.tests[this._test_name].call(this);
		}catch(e){ this.error(e); }
		this._update();
	},
	_setup : function(){
		var next = this.next;
		var time;
		this.next = function(t){ time = t ? t*1000 : 500;}
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
	assertNotNull: function(object) {
	    var message = arguments[1] || 'assertNotNull';
	    this.assert(object != null, message);
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
	get_next_name :function(){
		for(var i = 0; i < this._test.test_array.length; i++){
			if(this._test.test_array[i] == this._last_called){
				if(i+1 >= this._test.test_array.length){
					alert("There is no function following '"+this._last_called+ "'.  Please make sure you have no duplicate function names in your tests.")
				}
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
		delay = delay ? delay*1000 : 500;
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
			this.failures == 0 && this.errors == 0?  this._test.pass(): this._test.fail();
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
$MVC.Test.Unit = $MVC.Test.extend({
	init: function(name , tests ){
		this._super(  name, tests, 'unit');
		$MVC.Test.Unit.tests.push(this)
	}
});
$MVC.Test.Unit.tests = [];
$MVC.Test.Unit.run = function(callback){
	var t = $MVC.Test.Unit;
	t.working_test = 0;
	t.callback = callback;
	t.run_next();
}
$MVC.Test.Unit.run_next = function(){
	var t = $MVC.Test.Unit;
	if(t.working_test != null && t.working_test < t.tests.length){
			t.working_test++;
			t.tests[t.working_test-1].run( t.run_next )
	}else if(t.callback){
		t.working_test = null;
		t.callback();
		t.callback = null;
	}
}



$MVC.Test.Functional = $MVC.Test.extend({
	init: function(name , tests ){
		this._super(  name, tests, 'functional');
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
		if(object.length !=  null){
			return "[ ... ]"
		}
		return object.inspect ? object.inspect() : object.toString();
	} catch (e) {
		if (e instanceof RangeError) return '...';
		throw e;
	}
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
include.unit_test = include.app(function(i){ return '../test/unit/'+i+'_test'})
		

