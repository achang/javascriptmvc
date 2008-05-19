// The code from the event plugin comes from 
// JavaScript: the Definitive Guide by David Flanagan
// Copyright 2006 O'Reilly Media

if(document.addEventListener) {
	MVC.Event = {
		observe: function(el, eventType, handler, capture) {
			if(capture == null) capture = false; 
			el.addEventListener(eventType, handler, capture);
    	},
		stop_observing : function(el, eventType, handler) {
	        if(capture == null) capture = false;
	        el.removeEventListener(eventType, handler, false);
	    }
	};
}else if(document.attachEvent) {
  MVC.Event={
	observe: function(element, eventType, handler) {
        if (MVC.Event._find(element, eventType, handler) != -1) return;
        var wrappedHandler = function(e) {
            if (!e) e = window.event;
            var event = {
                _event: e, 
                type: e.type, 
                target: e.srcElement,  
                currentTarget: element, 
                relatedTarget: e.fromElement?e.fromElement:e.toElement,
                eventPhase: (e.srcElement==element)?2:3,
                clientX: e.clientX, clientY: e.clientY,
                screenX: e.screenX, screenY: e.screenY,
                altKey: e.altKey, ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey, charCode: e.keyCode,
                stopPropagation: function() {this._event.cancelBubble = true;},
                preventDefault: function() {this._event.returnValue = false;}
            };
            if (Function.prototype.call) 
                handler.call(element, event);
            else {
                element._currentHandler = handler;
                element._currentHandler(event);
                element._currentHandler = null;
            }
        };
        element.attachEvent("on" + eventType, wrappedHandler);
        var h = {
            element: element,
            eventType: eventType,
            handler: handler,
            wrappedHandler: wrappedHandler
        };
        var d = element.document || element, w = d.parentWindow, id = MVC.Event._uid(); 
        if (!w._allHandlers) w._allHandlers = {}; 
        w._allHandlers[id] = h;
        if (!element._handlers) element._handlers = [];
        element._handlers.push(id);
        if (!w._onunloadHandlerRegistered) {
            w._onunloadHandlerRegistered = true;
            w.attachEvent("onunload", MVC.Event._removeAllHandlers);
        }
    },
	stop_observing: function(element, eventType, handler) {
        var i = MVC.Event._find(element, eventType, handler);
        if (i == -1) return; 
        var d = element.document || element, w = d.parentWindow, handlerId = element._handlers[i], h = w._allHandlers[handlerId];
        element.detachEvent("on" + eventType, h.wrappedHandler);
        element._handlers.splice(i, 1);
        delete w._allHandlers[handlerId];
    },
	_find: function(element, eventType, handler) {
        var handlers = element._handlers;
        if (!handlers) return -1;
        var d = element.document || element, w = d.parentWindow;
        for(var i = handlers.length-1; i >= 0; i--) {
            var h = w._allHandlers[handlers[i]];
            if(h.eventType == eventType && h.handler == handler)  return i;
        }
        return -1;
    },
	_removeAllHandlers: function() {
        var w = this;
        for(var id in w._allHandlers) {
            if(! w._allHandlers.hasOwnProperty(id) ) continue;
			var h = w._allHandlers[id]; 
            if(h.element) h.element.detachEvent("on" + h.eventType, h.wrappedHandler);
            delete w._allHandlers[id];
        }
    },
	_counter : 0,
	_uid : function() { return "h" + MVC.Event._counter++; }
  };
};

if(!MVC._no_conflict){
	Event = MVC.Event;
}