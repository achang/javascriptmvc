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
	},
	click: function(){
		success('mainclick')
	}
});
$MVC.Controller('tests',{
	change: function(){
		success('change')
	},
	click : function(params){
		success('click')
	},
	focus : function(params){
		success('focus')
	},
	blur : function(){
		success('blur')
	},
	'# submit' :function(params){
		success('submit')
		params.event.kill();
	},
	mousedown : function(params){
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
	},
	contextmenu : function(params){
		success('contextmenu')
	}
});

//some of the things, we would want to do
//run a single controller


$MVC.Controller.Tests = [];


//probably don't want people recreating
$MVC.Controller.Test = function(model_name, actions){
	var newt = new $MVC.Controller.TestFunctions(model_name, actions);
	window[model_name.camelize()+'ControllerTest'] = newt
	window[model_name.camelize()+'ControllerTest'].klass_name = model_name.camelize()+'ControllerTest';
}
//runs actions
$MVC.Controller.TestFunctions = function(model_name, actions){
	this.controller = window[model_name.camelize()+'Controller']
	
	this.actions = [];
	for(var i = 0; i < actions.length; i++){
		this.actions.push(new $MVC.Controller.Test.Action(actions[i]))
	}
}
$MVC.Controller.TestFunctions.prototype.run = function(){
	for(var a = 0; a < this.actions.length; a++){
		this.actions[a].run(this.controller);
	}
}

$MVC.Controller.Test.Action = function(action){
	this.name = action.action_name;
	this.selector = action.selector || 0;
	this.func = action.func;
}
$MVC.Controller.Test.Action.prototype = {
	//given a controller
	//looks up the actions it is going to call
	//uses a css selector or the first element it finds (you can pass in a css selector or number
	//calls the event, calls the function
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
	this.options = options || {};
}
$MVC.SyntheticEvent.prototype = {
	send : function(element){
		if(this.type == 'focus')
			return element.focus();
		if(this.type == 'blur')
			return element.blur();
		
		if(document.createEvent)
			this.createEvent();
		else if(document.createEventObject)
			this.createEventObject();
		else
			throw "Your browser doesn't support dispatching events"
		if(element.dispatchEvent)
			element.dispatchEvent(this.event)
		else if(element.fireEvent){
			element.fireEvent('on'+this.type, this.event);
		}
		else
			throw "Your browser doesn't support dispatching events";
		return this.event;
	},
	createEvent : function(){
		if(['click','dblclick','mouseover','mouseout','mousemove','mousedown','mouseup','contextmenu'].include(this.type))
			this.createMouseEvent();
		else if(['focus'].include(this.type)){
			this.event = document.createEvent('UIEvents')
			this.event.initUIEvent('DOMFocusIn', true, false, window, 1);
		}
	},
	createEventObject : function(){
		this.event = document.createEventObject();
		var defaults = {
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
		$MVC.Object.extend(defaults, this.options);
		$MVC.Object.extend(this.event, defaults);
	},
	createMouseEvent : function(){
		this.event = document.createEvent('MouseEvents');
		
		var defaults = {
			bubbles : true,
			cancelable : true,
			view : window,
			detail : 1,
			screenX : 366, screenY : 195,
			clientX : 169, clientY : 74,
			ctrlKey : false, altKey : false, shiftKey : false, metaKey : false,
			button : (this.type == 'contextmenu' ? 2 : 0), 
			relatedTarget : null
		}
		$MVC.Object.extend(defaults, this.options);
		
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
/*basically just converts this into an object ControllerTest will like*/
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

$MVC.Controller.Test('tests',[
	test('focus',0, function(params){
		
	})
]);



node_path_test = function(){
	//document.getElementById('input').focus();
	//alert(document.getElementById('input').style.backgroundColor)
	TestsControllerTest.run();
}
//Write something that can call event
