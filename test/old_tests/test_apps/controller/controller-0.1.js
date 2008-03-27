//Compressed Helpers
Object.extend=function(a,b){for(var c in b)a[c]=b[c];return a};$MVC={String:{}};$MVC.String.capitalize=function(a){return a.slice(0,1).toUpperCase()+a.slice(1)};String.is_number=function(a){if(typeof a=='number')return true;if(typeof a!='string')return false;return a.match(/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/)};$MVC.String.camelize=function(a){var b=a.split(/_|-/);for(var i=0;i<b.length;i++)b[i]=$MVC.String.capitalize(b[i]);return b.join('')};Array.from=function(a){if(!a)return[];var b=[];for(var i=0,length=a.length;i<length;i++)b.push(a[i]);return b};Array.prototype.include=function(a){for(var i=0;i<this.length;i++){if(this[i]==a)return true}return false};if(typeof Function.prototype.bind=='undefined'){Function.prototype.bind=function(){var a=Array.from(arguments);a.shift();var b=this,object=arguments[0];return function(){return b.apply(object,a.concat(Array.from(arguments)))}}}$MVC.Browser={IE:!!(window.attachEvent&&!window.opera),Opera:!!window.opera,WebKit:navigator.userAgent.indexOf('AppleWebKit/')>-1,Gecko:navigator.userAgent.indexOf('Gecko')>-1&&navigator.userAgent.indexOf('KHTML')==-1,MobileSafari:!!navigator.userAgent.match(/Apple.*Mobile.*Safari/)};
//Compressed inflector
$MVC.Inflector={Inflections:{plural:[[/(quiz)$/i,"$1zes"],[/^(ox)$/i,"$1en"],[/([m|l])ouse$/i,"$1ice"],[/(matr|vert|ind)ix|ex$/i,"$1ices"],[/(x|ch|ss|sh)$/i,"$1es"],[/([^aeiouy]|qu)y$/i,"$1ies"],[/(hive)$/i,"$1s"],[/(?:([^f])fe|([lr])f)$/i,"$1$2ves"],[/sis$/i,"ses"],[/([ti])um$/i,"$1a"],[/(buffal|tomat)o$/i,"$1oes"],[/(bu)s$/i,"$1ses"],[/(alias|status)$/i,"$1es"],[/(octop|vir)us$/i,"$1i"],[/(ax|test)is$/i,"$1es"],[/s$/i,"s"],[/$/,"s"]],singular:[[/(quiz)zes$/i,"$1"],[/(matr)ices$/i,"$1ix"],[/(vert|ind)ices$/i,"$1ex"],[/^(ox)en/i,"$1"],[/(alias|status)es$/i,"$1"],[/(octop|vir)i$/i,"$1us"],[/(cris|ax|test)es$/i,"$1is"],[/(shoe)s$/i,"$1"],[/(o)es$/i,"$1"],[/(bus)es$/i,"$1"],[/([m|l])ice$/i,"$1ouse"],[/(x|ch|ss|sh)es$/i,"$1"],[/(m)ovies$/i,"$1ovie"],[/(s)eries$/i,"$1eries"],[/([^aeiouy]|qu)ies$/i,"$1y"],[/([lr])ves$/i,"$1f"],[/(tive)s$/i,"$1"],[/(hive)s$/i,"$1"],[/([^f])ves$/i,"$1fe"],[/(^analy)ses$/i,"$1sis"],[/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i,"$1$2sis"],[/([ti])a$/i,"$1um"],[/(n)ews$/i,"$1ews"],[/s$/i,""]],irregular:[['move','moves'],['sex','sexes'],['child','children'],['man','men'],['foreman','foremen'],['person','people']],uncountable:["sheep","fish","series","species","money","rice","information","equipment"]},pluralize:function(a){for(var i=0;i<$MVC.Inflector.Inflections.uncountable.length;i++){var b=$MVC.Inflector.Inflections.uncountable[i];if(a.toLowerCase()==b){return b}}for(var i=0;i<$MVC.Inflector.Inflections.irregular.length;i++){var c=$MVC.Inflector.Inflections.irregular[i][0];var d=$MVC.Inflector.Inflections.irregular[i][1];if((a.toLowerCase()==c)||(a==d)){return a.substring(0,1)+d.substring(1)}}for(var i=0;i<$MVC.Inflector.Inflections.plural.length;i++){var e=$MVC.Inflector.Inflections.plural[i][0];var f=$MVC.Inflector.Inflections.plural[i][1];if(e.test(a)){return a.replace(e,f)}}},singularize:function(a){for(var i=0;i<$MVC.Inflector.Inflections.uncountable.length;i++){var b=$MVC.Inflector.Inflections.uncountable[i];if(a.toLowerCase()==b){return b}}for(var i=0;i<$MVC.Inflector.Inflections.irregular.length;i++){var c=$MVC.Inflector.Inflections.irregular[i][0];var d=$MVC.Inflector.Inflections.irregular[i][1];if((a.toLowerCase()==c)||(a.toLowerCase()==d)){return a.substring(0,1)+c.substring(1)}}for(var i=0;i<$MVC.Inflector.Inflections.singular.length;i++){var e=$MVC.Inflector.Inflections.singular[i][0];var f=$MVC.Inflector.Inflections.singular[i][1];if(e.test(a)){return a.replace(e,f)}}}};Object.extend(String.prototype,{pluralize:function(a,b){if(typeof a=='undefined'){return $MVC.Inflector.pluralize(this)}else{return a+' '+(1==parseInt(a)?this:b||$MVC.Inflector.pluralize(this))}},singularize:function(a){if(typeof a=='undefined'){return $MVC.Inflector.singularize(this)}else{return a+" "+$MVC.Inflector.singularize(this)}},is_singular:function(){if(this.singularize()==null&&this)return true;return false}});
//Compressed Event registration class
//This Event class is from JavaScript  'The Definitive Guide'
if(document.addEventListener){$MVC.Event={observe:function(a,b,c,d){if(d==null)d=false;a.addEventListener(b,c,d)},stopObserving:function(a,b,c){if(capture==null)capture=false;a.removeEventListener(b,c,false)}}}else if(document.attachEvent){$MVC.Event={observe:function(b,c,f){if($MVC.Event._find(b,c,f)!=-1)return;var g=function(e){if(!e)e=window.event;var a={_event:e,type:e.type,target:e.srcElement,currentTarget:b,relatedTarget:e.fromElement?e.fromElement:e.toElement,eventPhase:(e.srcElement==b)?2:3,clientX:e.clientX,clientY:e.clientY,screenX:e.screenX,screenY:e.screenY,altKey:e.altKey,ctrlKey:e.ctrlKey,shiftKey:e.shiftKey,charCode:e.keyCode,stopPropagation:function(){this._event.cancelBubble=true},preventDefault:function(){this._event.returnValue=false}};if(Function.prototype.call)f.call(b,a);else{b._currentHandler=f;b._currentHandler(a);b._currentHandler=null}};b.attachEvent("on"+c,g);var h={element:b,eventType:c,handler:f,wrappedHandler:g};var d=b.document||b,w=d.parentWindow,id=$MVC.Event._uid();if(!w._allHandlers)w._allHandlers={};w._allHandlers[id]=h;if(!b._handlers)b._handlers=[];b._handlers.push(id);if(!w._onunloadHandlerRegistered){w._onunloadHandlerRegistered=true;w.attachEvent("onunload",$MVC.Event._removeAllHandlers)}},stopObserving:function(a,b,c){var i=$MVC.Event._find(a,b,c);if(i==-1)return;var d=a.document||a,w=d.parentWindow,handlerId=a._handlers[i],h=w._allHandlers[handlerId];a.detachEvent("on"+b,h.wrappedHandler);a._handlers.splice(i,1);delete w._allHandlers[handlerId]},_find:function(a,b,c){var e=a._handlers;if(!e)return-1;var d=a.document||a,w=d.parentWindow;for(var i=e.length-1;i>=0;i--){var h=w._allHandlers[e[i]];if(h.eventType==b&&h.handler==c)return i}return-1},_removeAllHandlers:function(){var w=this;for(var a in w._allHandlers){var h=w._allHandlers[a];if(h.element)h.element.detachEvent("on"+h.eventType,h.wrappedHandler);delete w._allHandlers[a]}},_counter:0,_uid:function(){return"h"+$MVC.Event._counter++}}}



/**
 * Creates a new controller object with actions
 * @param {String} model - The name of the controller type.  Example: todo.
 * @param {Object} actions - a hash of functions that get added to the controller's prototype
 */
$MVC.Controller = function(model, actions){
	var className= model, newmodel = null, singular = model.is_singular();
	model = $MVC.String.camelize(model)+'Controller';
	newmodel = eval(model + " = function() { this.klass = "+model+"; "+
				"this.initialize.apply(this, arguments);"+
				"};");

	var controller_functions = new $MVC.Controller.functions();
	newmodel.prototype = controller_functions;
	newmodel.prototype.klass_name = 	model;
	newmodel.prototype.className = className;
	newmodel.className = className;
	newmodel.views = {};
	newmodel.attached =false;
	Object.extend(newmodel.prototype, actions );
	var registered_actions = {};
	var controller_actions = {};
	newmodel.add_register_action = function(action,observe_on, event_type, capture){
		if(!registered_actions[event_type]){
			registered_actions[event_type] = [];
			$MVC.Event.observe(observe_on, event_type, $MVC.Controller.dispatch_event, capture);
		}
		registered_actions[event_type].push(action);
	};
	for(var action_name in actions ){
		var val = actions[action_name];
		if( actions.hasOwnProperty(action_name) && typeof val == 'function') {
			
			var action = new $MVC.Controller.Action(action_name, val,newmodel);
			controller_actions[action_name] = action;
		}
	}
	newmodel.actions = function(){ return controller_actions;};
	newmodel.registered_actions = function(){return registered_actions;};
	$MVC.Controller.klasses.push(newmodel);
	return newmodel;
};

/**
 * $MVC.Controller prototype functions
 */
$MVC.Controller.functions = function(){};
Object.extend($MVC.Controller.functions.prototype, {
	initialize : function(){},
	continue_to :function(action){
		if(!action) action = this.action.name+'ing';
		if(typeof this[action] != 'function'){ throw 'There is no action named '+action+'. ';}
		return function(){
			this.action = this.klass.actions()[action];
			this[action].apply(this, arguments);
		}.bind(this);
	}
});

/**
 * $MVC.Controller class functions
 */
Object.extend($MVC.Controller , {
	klasses: [],
    add_kill_event: function(event){
		if(!event.kill){
			var killed = false;
			event.kill = function(){
				killed = true;
				if(!event) event = window.event;
			    try{
			    event.cancelBubble = true;
			    if (event.stopPropagation) event.stopPropagation(); 
			    if (event.preventDefault)  event.preventDefault();
			    }catch(e)
			    {}
			};
			event.is_killed = function(){return killed;}
		}
	},
	dispatch: function(controller, action_name, params){
		var c_name = controller;
		if(typeof controller == 'string'){
			controller = window[$MVC.String.camelize(controller)+'Controller'];
		}
		if(!controller) 'No controller named '+c_name+' was found for $MVC.Controller.dispatch.';
		if(!action_name) action_name = 'index';
		
		if(typeof action_name == 'string'){
			if(!(action_name in controller.actions()) ) throw 'No action named '+action+' was found for '+c_name+'.';
		}else{
			action_name = action_name.name;
		}
		var action = controller.actions()[action_name], instance = new controller(), ret_val;
		instance.params = params;
		instance.action = action;
		ret_val = instance[action_name](params);
		return ret_val;
	},
	node_path: function(el){
		var body = document.body, parents = [], iterator =el;
		while(iterator != body){
			parents.unshift({tag: iterator.nodeName, className: iterator.className, id: iterator.id, element: iterator});
			iterator = iterator.parentNode;
			if(iterator == null)
				return [];
		}
		return parents;
	},
	dispatch_event: function(event){
		var target = event.target, classes = $MVC.Controller.klasses, matched = false, ret_value = true, matches = [];
		var parents_path = $MVC.Controller.node_path(target);
	
		for(var c = 0 ; c < classes.length; c++){
			var klass= $MVC.Controller.klasses[c];
			var actions = klass.registered_actions()[event.type];
			if(!actions) continue;
			for(var i =0; i < actions.length;  i++){
				var action = actions[i];
				var match_result = action.match(target, event, parents_path);
				if(match_result){
					match_result.controller = klass;
					matches.push(match_result);
				}
			}
		}
		if(matches.length == 0) return true;
		$MVC.Controller.add_kill_event(event);
		matches.sort($MVC.Controller.dispatch_event.sort_by_order);
		for(var m = 0; m < matches.length; m++){
			var match = matches[m];
			var action_name = match.action.name;
			var params = new $MVC.Controller.Params({event: event, element: match.node, action: action_name, controller: match.controller  });
			ret_value = $MVC.Controller.dispatch(match.controller, action_name, params) && ret_value;
			if(event.is_killed()) return true;
		}
	},
	event_closure: function(controller_name, f_name, element){
		return function(event){
			$MVC.Controller.add_kill_event(event);
			var params = new $MVC.Controller.Params({event: event, element: element, action: f_name, controller: controller_name   });
			return $MVC.Controller.dispatch(controller_name, f_name, params);
		}
	}
});

$MVC.Controller.dispatch_event.sort_by_order = function(a,b){
	if(a.order < b.order) return 1;
	if(b.order < a.order) return -1;
	return 0;
};

$MVC.Controller.Params = function(params){
	for(var thing in params){
		if( params.hasOwnProperty(thing) )
			this[thing] = params[thing];
	}
};
$MVC.Controller.Params.prototype = {
	form_params : function(){
		var data = {};
		if(this.element.nodeName.toLowerCase() != 'form') return data;
		var els = this.element.elements;
		var uri_params = [];
		for(var i=0; i < els.length; i++){
			var el = els[i];
			if(el.type.toLowerCase()=='submit') continue;
			var key = el.name, value = el.value;
			if(String.is_number(value) ) value = parseFloat(value);
			var key_components = key.rsplit(/\[[^\]]*\]/);
			if( key_components.length > 1 ) {
				var last = key_components.length - 1;
				var nested_key = key_components[0].toString();
				if(! data[nested_key] ) data[nested_key] = {};
				var nested_hash = data[nested_key];
				for(var k = 1; k < last; k++){
					nested_key = key_components[k].substring(1, key_components[k].length - 1);
					if( ! nested_hash[nested_key] ) nested_hash[nested_key] ={};
					nested_hash = nested_hash[nested_key];
				}
				nested_hash[ key_components[last].substring(1, key_components[last].length - 1) ] = value;
			} else {
		        if (key in data) {
		        	if (typeof data[key] == 'string' ) data[key] = [data[key]];
		         	data[key].push(value);
		        }
		        else data[key] = value;
			}
		}
		return data;
	},
	class_element : function(){
		var start = this.element, controller = this.controller;
		var className = controller.className.is_singular() ? controller.className : controller.className.singularize();
		while(start && start.className.indexOf(className) == -1 ){
			start = start.parentNode;
			if(start == document) return null;
		}
		return start;
	},
	is_event_on_element : function(){
		return this.event.target == this.element;
	}
};


$MVC.Controller.Action = function(action_name, func ,controller){
	this.name = action_name;
	this.func = func;
	this.controller = controller;
	if(this.name.search(/change|click|contextmenu|dblclick|keypress|mousedown|mousemove|mouseout|mouseover|mouseup|reset|resize|scroll|select|submit|dblclick|focus|blur|load|unload/) == -1 ) {
		return;		
	}
	this.parse_name();
	if(this.className() == 'main')  {
		this.main_controller();
		return;
	}
	this.singular = this.className().is_singular();
	if(this.singular){
		this.selector = this.last_space == -1 ? '#'+this.className() : '#'+this.className()+' '+this.before_space;
	}else{
		this.set_plural_selector();
	}

	if(this.event_type == 'submit' && $MVC.Browser.IE){
		this.submit_for_ie();
		return;
	}
	this.controller.add_register_action(this,document.documentElement, this.registered_event(), this.capture());
};

$MVC.Controller.Action.prototype = {
	registered_event : function(){
		if($MVC.Browser.IE){
			if(this.event_type == 'focus')
				return 'activate';
			else if(this.event_type == 'blur')
				return 'deactivate';
		}
		return this.event_type;
	},
	set_plural_selector : function(){
		if(this.name.substring(0,2) == "# "){
			var newer_action_name = this.name.substring(2,this.name.length);
			newlast_space = newer_action_name.lastIndexOf(' ');
			this.selector = newlast_space == -1 ? '#'+this.className() : '#'+this.className()+' '+newer_action_name.substring(0,newlast_space);
		}else{
			this.selector = this.last_space == -1 ? '.'+this.className().singularize() : '.'+this.className().singularize()+' '+this.before_space;
		}
	},
	parse_name : function(){
		this.last_space = this.name.lastIndexOf(' ');
		this.before_space = this.last_space == -1 ? '' : this.name.substring(0,this.last_space);
		this.event_type = this.last_space == -1 ? this.name :this.name.substring(this.last_space+1);
		this.event_type;
	},
	main_controller : function(){
		if(['load','unload','resize','scroll'].include(this.event_type)){
			$MVC.Event.observe(window, this.event_type, $MVC.Controller.event_closure(this.className(), this.event_type, window) );
			return;
		}
		this.selector = this.before_space;
		if(this.event_type == 'submit' && $MVC.Browser.IE){
			this.submit_for_ie();
			return;
		}
		this.controller.add_register_action(this,document.documentElement, this.registered_event(), this.capture());
	},
	submit_for_ie : function(){
		this.controller.add_register_action(this,document.documentElement, 'click');
		this.controller.add_register_action(this,document.documentElement, 'keypress');
		this.filters= {
			click : function(el, event){
				return el.nodeName.toUpperCase() == 'INPUT' && el.type.toLowerCase() == 'submit';
			},
			keypress : function(el, event){
				if(el.nodeName.toUpperCase()!= 'INPUT') return false;
				if(typeof Prototype != 'undefined'){
					return event.keyCode == 13;
				}
				return event.charCode == 13;
			}
		};
	},
	className : function(){
		return this.controller.className;
	},
	capture : function(){
		return ['focus','blur'].include(this.event_type);
	},
	selector_order : function(){
		if(this.order) return this.order;
		var selector_parts = this.selector.split(/\s+/);
		var patterns = {tag :    		/^\s*(\*|[\w\-]+)(\b|$)?/,
        				id :            /^#([\w\-\*]+)(\b|$)/,
    					className :     /^\.([\w\-\*]+)(\b|$)/};
		
		var order = [];
		for(var i =0; i< selector_parts.length; i++){
			var v = {}, r;
			var p =selector_parts[i];
			for(var attr in patterns){
				if( patterns.hasOwnProperty(attr) && (r = p.match(patterns[attr])) ){
					if(attr == 'tag') v[attr] = r[1].toUpperCase();
					else v[attr] = r[1];
					p.replace(r[0],'');
				}
			}
			order.push(v);
		}
		this.order = order;
		return this.order;
	},
	match : function(el, event, parents){
		if(this.filters){
			if(!this.filters[event.type](el, event)) return null;
		}
		var docEl = document.documentElement, body = document.body;
		if(el == docEl || el==body) return false;
		var matching = 0;
		for(var n=0; n < parents.length; n++){
			var node = parents[n], matched = true;
			var match = this.selector_order()[matching];

			for(var attr in match){
				if(!match.hasOwnProperty(attr) || attr == 'element') continue;
				if(match[attr] && attr == 'className'){
					if(! node.className.split(' ').include(match[attr])){
						matched = false;
					}
				}else if(match[attr] && node[attr] != match[attr]){
					matched = false;
				}
			}
			if(matched){
				matching++;
				if(matching >= this.selector_order().length){
					return {node: node.element, order: n, action: this};
				}
			}
		}
		return null;
	}
};
Controller = $MVC.Controller;