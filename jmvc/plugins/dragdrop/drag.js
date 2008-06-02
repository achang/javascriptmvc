


//basically, if uses one of those, I need to add a mousedown action, that will call this shit back.

MVC.Controller.DragAction = MVC.Controller.DelegateAction.extend({
    match: new RegExp("(.*?)\s?(dragstart|dragend|dragging)$")
},
//Prototype functions
{    
    init: function(action, f, controller){
        this.action = action;
        this.func = f;
        this.controller = controller;
        this.css_and_event();
        var selector = this.selector();
        if(MVC.Draggable.selectors[selector]) {
            MVC.Draggable.selectors[selector].events[this.event_type] = action;
            return;
        }
        MVC.Draggable.selectors[selector] = 
            new MVC.DelegationEvent(this.selector(), 'mousedown', function(params){
               //take controller too
               for(var event_type in MVC.Draggable.selectors[selector].events){
                   if(MVC.Draggable.selectors[selector].events.hasOwnProperty(event_type) )
                       params[event_type] = MVC.Controller.dispatch_closure(controller.className, MVC.Draggable.selectors[selector].events[event_type]);
               }
               MVC.Draggable.current = new MVC.Draggable(params);
            });
        MVC.Draggable.selectors[selector].events = {};
        MVC.Draggable.selectors[selector].events[this.event_type] = action;
    }
});
//drag controller name, for each selector and event, 

MVC.Draggable = function(params){
    this.params = params;
    this.element = params.element;
    this.event = params.event;
    this.width = this.element.clientWidth;
    this.height = this.element.clientHeight;
    this.moved = false;
    //this.originalz = MVC.Element.getStyle(this.element,'z-Index');
    //this.originallyAbsolute = MVC.Element.getStyle(this.element,'position')  == 'absolute';
    this.mouse_offset();
    this.dragstart = params.dragstart || function(){};
    this.dragend = params.dragend || function(){};
    this.dragging = params.dragging || function(){};
};


MVC.Draggable.prototype = {
    start: function(event){
        MVC.Element.makePositioned(this.element);
        //this.element.style.width = this.element.clientWidth.toString()+'px';
        this.element.style.zIndex = 1000;
        this.moved = true;
        this.dragstart({element: this.element, event: event});
        MVC.Droppables.compile();
    },
    mouse_offset: function(){
        this.element_start = MVC.Element.cumulativeOffset(this.element);
        
        var mousePos  = MVC.Event.pointer(this.event);

        this.mouse_position_on_element = mousePos.minus( this.element_start )

    },
    currentDelta: function() {
        return new MVC.Vector( parseInt(MVC.Element.getStyle(this.element,'left') || '0'), 
                            parseInt(MVC.Element.getStyle(this.element,'top') || '0'))   ;
    },
    draw: function(pointer, event){
        MVC.Position.prepare();
        var pos = MVC.Element.cumulativeOffset(this.element);
        var d = this.currentDelta();
        //remove current relocation ... this could be removed if we knew someone wasn't changing the dom
        //or we were using absolute positioning, and leaving a spacer
        
        var newpos = pos.minus(d);
        var p = pointer.minus(newpos).minus( this.mouse_position_on_element );
        var s = this.element.style;
        s.top =  p.top()+"px";
        s.left =  p.left()+"px";
        
        MVC.Droppables.show(pointer, this.element, event);
        
        
        MVC.$E('relative').innerHTML = p.toString();
    }
}
MVC.Draggable.selectors = {};

//==============================================================================

MVC.Draggable.current = null;

MVC.Event.observe(document, 'mousemove', function(event){
        var mousePos = MVC.Event.pointer(event);
        MVC.$E('mouse').innerHTML = mousePos.toString();
        if(!MVC.Draggable.current ) return;
        if(!MVC.Draggable.current.moved) MVC.Draggable.current.start(event);
        MVC.Draggable.current.draw(mousePos, event);
        //we should call dragging
        MVC.Draggable.current.dragging({element: MVC.Draggable.current.element, event: event})
        //event.stopPropagation();
});

MVC.Event.observe(document, 'mouseup', function(event){
    //if there is a current, we should call its dragstop
    if(MVC.Draggable.current){
        MVC.Draggable.current.dragend({element: MVC.Draggable.current.element, event: event});
        MVC.Droppables.fire(event,MVC.Draggable.current.element)
    }

    MVC.Draggable.current = null;
});




