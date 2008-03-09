$MVC.Controller('main',{
	load : function(){
		success('load');
	},
	resize : function(){
		success('resize')
	},
	scroll : function(){
		success('scroll')
	},
	unload : function(){
		success('unload')
		//alert('unload')
	}
});
$MVC.Controller('tests',{
	
	/*click : function(params){
		success('click')
	},
	focus : function(){
		success('focus')
	},*/
	blur : function(){
		success('blur')
	},
	'# submit' :function(params){
		success('submit')
		params.event.kill();
	},
	/*mousedown : function(params){
		success('mousedown')
	},
	mousemove : function(params){
		success('mousemove')
	},
	mouseup : function(params){
		success('mouseup')
	},
	mouseover : function(params){
		success('mouseover')
	},
	mouseout : function(params){
		success('mouseout')
	},*/
	contextmenu : function(params){
		success('contextmenu')
	}
});

DispatchTest = function(model_name, actions){
	this.controller = window[model_name.capitalize()+'Controller']
	
	this.actions = [];
	for(var i = 0; i < actions.length; i++){
		this.actions.push(new DispatchTest.Action(actions[i]))
	}
}
DispatchTest.prototype.run = function(){
	for(var a = 0; a < this.actions.length; a++){
		this.actions[a].run(this.controller);
	}
}
DispatchTest.Action = function(action){
	this.name = action.action_name;
	this.selector = action.selector || 0;
	this.func = action.func;
}
DispatchTest.Action.prototype = {
	run : function(controller){
		var action = controller.actions()[this.name];
		var selector, number;
		if(typeof this.selector == 'string'){
			selector = this.selector;
			number = 0;
		}else{
			selector = action.selector;
			number = this.selector;
		}
		var target = $MVC.CSSQuery(selector)[number];
		var e = new $MVC.SyntheticEvent(action.event_type, {}).send( target)
		this.func.call($MVC.Test, {event: e, element: target})
	}
}



$MVC.SyntheticEvent = function(type, options){
	this.type = type;
	this.options = options;
}
$MVC.SyntheticEvent.prototype = {
	send : function(element){
		if(document.createEvent)
			this.createEvent();
		else if(document.createEventObject)
			this.createEventObject();
		else
			throw "Your browser doesn't support dispatching events"
			
		if(element.dispatchEvent)
			element.dispatchEvent(this.event)
		else if(this.fireEvent)
			element.fireEvent(this.type, this.event)
		else
			throw "Your browser doesn't support dispatching events";
		return this.event;
	},
	createEvent : function(){
		if(['click','dblclick','mouseover','mouseout','mousemove','mousedown','mouseup','contextmenu'].include(this.type))
			this.createMouseEvent();
	},
	createEventObject : function(){
		this.event = document.createEventObject();
		defaults = {
			bubbles : true,
			cancelable : true,
			view : window,
			detail : 1,
			screenX : 1, screenY : 1,
			clientX : 1, clientY : 1,
			ctrlKey : false, altKey : false, shiftKey : false, metaKey : false,
			button : 0, 
			relatedTarget : null
		}
		Object.extend(defaults, this.options);
		Object.extend(this.event, defaults);
	},
	createMouseEvent : function(){
		this.event = document.createEvent('MouseEvents');
		
		defaults = {
			bubbles : true,
			cancelable : true,
			view : window,
			detail : 1,
			screenX : 1, screenY : 1,
			clientX : 1, clientY : 1,
			ctrlKey : false, altKey : false, shiftKey : false, metaKey : false,
			button : (this.type == 'contextmenu' ? 2 : 0), 
			relatedTarget : null
		}
		Object.extend(defaults, this.options);
		
		this.event.initMouseEvent(this.type, 
			defaults.bubbles, 
			defaults.cancelable, 
			defaults.view, 
			defaults.detail, 
			defaults.screenX, defaults.screenY,
			defaults.clientX,defaults.clientY,
			defaults.ctrlKey,defaults.altKey,defaults.shiftKey,defaults.metaKey,
			defaults.button,defaults.relatedTarget);
	}
}

$MVC.test = function(action_name, selector, f){
	if(!f){ f = selector; selector = null;}
	return {action_name: action_name, selector: selector, func: f};	
};
$MVC.Test = {
	assertEqual : function(expected, actual) {
		if(expected != actual){
			alert('go crazy')
		}
	}
}


test = $MVC.test;

TestsTestController = new DispatchTest('tests',[
	test('contextmenu',0, function(params){
		
	})
]);


//For testing Node Path
$MVC.tests_run = false;
$MVC.run_tests = function(){
	if(!$MVC.tests_run)
		DirectoriesControllerTest.run();
	$MVC.tests_run = true;
}

node_path_test = function(){
	TestsTestController.run();
}
//Write something that can call event
