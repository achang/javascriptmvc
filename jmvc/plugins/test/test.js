

//adds check exist
(function() {
	include.checkExists = function(path){		
		var xhr=MVC.Ajax.factory();
		xhr.open("HEAD", path, false);
		try{ 
			xhr.send(null); 
		} catch(e) {
			if ( xhr.status > 505 || xhr.status == 404 || 
				xhr.status == 2 || xhr.status == 3 ||(xhr.status == 0 && xhr.responseText == '') ) 
			return false;
		}
		if ( xhr.status > 505 || xhr.status == 404 || xhr.status == 2 || 
			xhr.status == 3 ||(xhr.status == 0 && xhr.responseText == '') ) 
				return false;
	    return true;
	}
	if(include.checkExists(MVC.apps_root+'/'+MVC.app_name+'_test.js')){
		var path = include.get_path();
		include.set_path(MVC.apps_root)
		include(MVC.app_name+'_test')
		include.set_path(path)
	}else{
		MVC.Console.log("There is no application test file at:\n    \"apps/"+MVC.app_name+"_test.js\"\nUse it to include your test files.\n\nTest includes:\n    include.unit_tests('product')\n    include.functional_tests('widget')")
	}
})();


MVC.Tests = {};
MVC.Test = MVC.Class.extend({
	init: function( name, tests, type  ){
		this.type = type || 'unit';
		this.tests = tests;
		this.test_names = [];
		this.test_array = [];
		for(var t in this.tests) {
			if(! this.tests.hasOwnProperty(t) ) continue;
			if(t.indexOf('test') == 0) this.test_names.push(t);
			this.test_array.push(t);
		}
		this.name = name;
		this.Assertions = MVC.Test.Assertions.extend(this.helpers()); //overwrite helpers
		this.passes = 0;
		this.failures = 0;
		
		MVC.Tests[this.name] = this;
		this.updateElements(this);
	},
	fail : function(){
		this.failures++;
	},
	helpers : function(){
		var helpers = {}; 
		for(var t in this.tests) if(this.tests.hasOwnProperty(t) && t.indexOf('test') != 0) helpers[t] = this.tests[t];
		return helpers;
	},
	pass : function(){
		this.passes++;
	},
	run: function(callback){
		this.working_test = 0;
		this.callback = callback;
		this.passes = 0;
		this.failures = 0;
		this.run_next();
	},
	run_helper: function(helper_name){
		var a = new this.Assertions(this);
		a[helper_name](0);
	},
	run_next: function(){
		if(this.working_test != null && this.working_test < this.test_names.length){
			this.working_test++;
			this.run_test(this.test_names[this.working_test-1]);
		}else if(this.working_test != null){
			MVC.Console.window.update_test(this)
			this.working_test = null;
			if(this.callback){
				this.callback();
				this.callback = null;
			}
		}
	},
	run_test: function(test_id){
		var saved_this = this;
		// setTimeout with delay of 0 is necessary for Opera and Safari to trick them into thinking
		// the calling window was the application and not the console
		setTimeout(function(){ this.assertions = new saved_this.Assertions(saved_this, test_id); },0);
	},
	prepare_page : function(type) {
		MVC.Console.window.document.getElementById(type+'_explanation').style.display = 'none';
		MVC.Console.window.document.getElementById(type+'_test_runner').style.display = 'block';
	},
	updateElements : function(test){
		
		if(test.type == 'unit')
			this.prepare_page('unit');
		else
			this.prepare_page('functional');
		var insert_into = MVC.Console.window.document.getElementById(test.type+'_tests');
		var txt = "<h3><img alt='run' src='playwhite.png' onclick='find_and_run(\""+test.name+"\")'/>"+test.name+" <span id='"+test.name+"_results'></span></h3>";
		txt += "<div class='table_container'><table cellspacing='0px'><thead><tr><th>tests</th><th>result</th></tr></thead><tbody>";
		for(var t in test.tests ){
			if(! test.tests.hasOwnProperty(t) ) continue;
			if(t.indexOf('test') != 0 ) continue;
			var name = t.substring(5)
			txt+= '<tr class="step" id="step_'+test.name+'_'+t+'">'+
			"<td class='name'>"+
			"<a href='javascript: void(0);' onclick='find_and_run(\""+test.name+"\",\""+t+"\")'>"+name+'</a></td>'+
			'<td class="result">&nbsp;</td></tr>'
		}
		txt+= "</tbody></table></div>";
		if(this.added_helpers){
			txt+= "<div class='helpers'>Helpers: "
			var helpers = [];
			for(var h in test.added_helpers)
				if( test.added_helpers.hasOwnProperty(h) ) 
					helpers.push( "<a href='javascript: void(0)' onclick='run_helper(\""+test.name+"\",\""+h+"\")'>"+h+"</a>")
			txt+= helpers.join(', ')+"</div>";
		}
		//var t = document.getElementById('functional_tests');
		var t = MVC.Console.window.document.createElement('div');
		t.className = 'test'
		t.innerHTML  = txt;
		insert_into.appendChild(t);
	}
});

MVC.Test.Runner = function(object, iterator_name,params){
	var iterator_num;
	object.run = function(callback){
		object._callback = callback;
		iterator_num = 0;
		params.start.call(object);
		object.run_next();
	}
	object.run_next = function(){
		if(iterator_num != null && iterator_num < object[iterator_name].length){
			if(iterator_num > 0) params.after.call(object, iterator_num-1);
			iterator_num++;
			object[iterator_name][iterator_num-1].run(object.run_next)
		}else if(iterator_num != null){
			if(iterator_num > 0) params.after.call(object, iterator_num-1);
			params.done.call(object);
			if(object._callback){
				object._callback();
				object._callback = null;
			}else{
				//if(MVC.Browser.Gecko) window.blur();
				//else MVC.Console.window.focus();
			}
		}
	}
};


//almsot everything in here should be private
MVC.Test.Assertions =  MVC.Class.extend({
	init: function( test, test_name){
		this.assertions = 0;
		this.failures = 0;
		this.errors= 0;
		this.messages = [];
		this._test = test;
		
		if(!test_name) return;
		this._delays = 0;
		this._test_name = test_name;
		this._last_called = test_name;
		MVC.Console.window.running(this._test, this._test_name);
		if(this.setup) 
			this._setup();
		else{
			this._start();
		}
	},
	_start : function(){
		try{
			this._test.tests[this._test_name].call(this);
		}catch(e){ this.error(e); this._delays = 0;}
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
		var message = arguments[1] || 'assert: got "' + MVC.Test.inspect(expression) + '"';
		try { expression ? this.pass() : 
			this.fail(message); }
		catch(e) { this.error(e); }
	},
  	assert_equal: function(expected, actual) {
		var message = arguments[2] || "assertEqual";
		try { (expected == actual) ? this.pass() :
			this.fail(message + ': expected "' + MVC.Test.inspect(expected) + 
			'", actual "' + MVC.Test.inspect(actual) + '"'); }
		catch(e) { this.error(e); }
  	},
	assert_null: function(obj) {
	    var message = arguments[1] || 'assertNull'
	    try { (obj==null) ? this.pass() : 
	      this.fail(message + ': got "' + MVC.Test.inspect(obj) + '"'); }
	    catch(e) { this.error(e); }
	},
	assert_not: function(expression) {
	   var message = arguments[1] || 'assert: got "' + MVC.Test.inspect(expression) + '"';
		try {! expression ? this.pass() : 
			this.fail(message); }
		catch(e) { this.error(e); }
	},
	assert_not_null: function(object) {
	    var message = arguments[1] || 'assertNotNull';
	    this.assert(object != null, message);
	},
	assert_each: function(expected, actual) {
	    var message = arguments[2] || "assert_each";
	    try { 
			var e = MVC.Array.from(expected);
			var a = MVC.Array.from(actual);
			if(e.length != a.length){
				return this.fail(message + ': expected ' + MVC.Test.inspect(expected)+', actual ' + MVC.Test.inspect(actual));
				
			}else{
				for(var i =0; i< e.length; i++){
					if(e[i] != a[i]){
						return this.fail(message + ': expected '+MVC.Test.inspect(expected)+', actual ' + MVC.Test.inspect(actual));
					}
				}
			}
			this.pass();
	    }catch(e) { this.error(e); }
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
	    this.messages.push(error.name + ": "+ error.message + "(" + MVC.Test.inspect(error) +")");
	 },
	_get_next_name :function(){
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
		if(!fname) fname = this._get_next_name();
		var assert = this;
		var  func = this._test.tests[fname];
		return function(){
			assert._last_called = fname;
			var args = MVC.Array.from(arguments);
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
			if(this._do_blur_back)
				this._blur_back();
			MVC.Console.window.update(this._test, this._test_name, this);
			this.failures == 0 && this.errors == 0?  this._test.pass(): this._test.fail();
			this._test.run_next();
		}
	},
	_blur_back: function(){
		MVC.Browser.Gecko ? window.blur() : MVC.Console.window.focus();
	}
});

Function.prototype.curry = function() {
	var fn = this, args = Array.prototype.slice.call(arguments);
	return function() {
	  return fn.apply(this, args.concat(
	    Array.prototype.slice.call(arguments)));
	};
};
MVC.Test.Unit = MVC.Test.extend({
	init: function(name , tests ){
		this._super(  name, tests, 'unit');
		MVC.Test.Unit.tests.push(this)
	}
});
MVC.Test.Unit.tests = [];


MVC.Test.Runner(MVC.Test.Unit, "tests", {
	start : function(){
		this.passes = 0;
	},
	after : function(number ){
		if(this.tests[number].failures == 0 ) this.passes++;
	},
	done: function(){
		MVC.Console.window.document.getElementById('unit_result').innerHTML = 
			'('+this.passes+'/'+this.tests.length+')' + (this.passes == this.tests.length ? ' Wow!' : '')
	}
})




MVC.Test.Functional = MVC.Test.extend({
	init: function(name , tests ){
		this._super(  name, tests, 'functional');
		MVC.Test.Functional.tests.push(this)
	},
	helpers : function(){
		var helpers = this._super();
		helpers.Action =   function(event_type, selector, options){
			options = options || {};
			options.type = event_type;
			var number = 0;

			if(typeof options == 'number') 		 number = options || 0;
			else if (typeof options == 'object') number = options.number || 0;
			
			var element = typeof selector == 'string' ? MVC.Query(selector)[number] : selector; //if not a selector assume element
			
			if((event_type == 'focus' || event_type == 'write' || event_type == 'click') && !this._do_blur_back){
				MVC.Browser.Gecko ? MVC.Console.window.blur() : window.focus();
				this._do_blur_back =true;
			}
			

			var event = new MVC.SyntheticEvent(event_type, options).send(element);
			return {event: event, element: element, options: options};
		}
		for(var e = 0; e < MVC.Test.Functional.events.length; e++){
			var event_name = MVC.Test.Functional.events[e];
			helpers[MVC.String.capitalize(event_name)] = helpers.Action.curry(event_name)
		}
		return helpers;
	}
});
MVC.Test.Functional.events = ['change','click','contextmenu','dblclick','keyup','keydown','keypress','mousedown','mousemove','mouseout','mouseover','mouseup','reset','resize','scroll','select','submit','dblclick','focus','blur','load','unload','drag','write'];
MVC.Test.Functional.tests = [];


MVC.Test.Runner(MVC.Test.Functional, "tests", {
	start : function(){
		this.passes = 0;
	},
	after : function(number ){
		if(this.tests[number].failures == 0 ) this.passes++;
	},
	done: function(){
		MVC.Console.window.document.getElementById('functional_result').innerHTML = 
			'('+this.passes+'/'+this.tests.length+')' + (this.passes == this.tests.length ? ' Wow!' : '')
	}
})


MVC.Test.Controller = MVC.Test.Functional.extend({
	init: function(name , tests ){
		var part = MVC.String.classize(name);
		var controller_name = part+'Controller';
		this.controller = window[controller_name];
		if(!this.controller) alert('There is no controller named '+controller_name);
		this.unit = name;
		this._super(part+'TestController', tests);
	},
	helpers : function(){
		var helpers = this._super();
		var actions = MVC.Object.extend({}, this.controller.actions()) ;
		this.added_helpers = {};
		for(var action_name in actions){
			if(!actions.hasOwnProperty(action_name) || 
				!actions[action_name].event_type || 
				!actions[action_name].selector) 
					continue;
			var event_type = actions[action_name].event_type;
			var cleaned_name = actions[action_name].selector.replace(/\.|#/g, '')+' '+event_type;
			var helper_name = cleaned_name.replace(/(\w*)/g, function(m,part){ return MVC.String.capitalize(part)}).replace(/ /g, '');
			helpers[helper_name] = helpers[MVC.String.capitalize(event_type)].curry(actions[action_name].selector);
			this.added_helpers[helper_name] = helpers[helper_name];
		}
		return helpers;
	}
});




MVC.Console.window.get_tests = function(){return MVC.Tests; } 

//This function returns what something looks like
MVC.Test.inspect =  function(object) {
	try {
		if (object === undefined) return 'undefined';
		if (object === null) return 'null';
		if(object.length !=  null && typeof object != 'string'){
			return "[ ... ]";
		}
		return object.inspect ? object.inspect() : object.toString();
	} catch (e) {
		if (e instanceof RangeError) return '...';
		throw e;
	}
};
MVC.Test.loaded_files = {};


include.unit_tests = function(){
	for(var i=0; i< arguments.length; i++)
		MVC.Console.log('Trying to load: test/unit/'+arguments[i]+'_test.js');
	include.app(function(i){ return '../test/unit/'+i+'_test'}).apply(null, arguments);
}
include.functional_tests = function(){
	for(var i=0; i< arguments.length; i++)
		MVC.Console.log('Trying to load: test/functional/'+arguments[i]+'_test.js');
	include.app(function(i){ return '../test/functional/'+i+'_test'}).apply(null, arguments);
}

if(!MVC._no_conflict) Test = MVC.Test;