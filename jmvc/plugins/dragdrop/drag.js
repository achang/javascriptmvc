/*
 * TODOS:
 * - Delegation events need to be turned canceled.
 * - Would there even be a way to cancel controller actions?  Eventually.
 * - Clean up callback parameter passing system for drags.  
 *     Issue is that multiple drag actions only need 1 DelegationEvent
 * - Event should be extended with pointer
 * - How can we add options, like return, or cancel the drag or drop.
 *     Most of that can happen in the actions, we can just write in extra helper actions
 */

//DragAction
//  Alows actions with the following events:
//    dragstart -> called when the drag is first moved
//    dragend -> when someone lets go of a dragable object
//    dragging -> called everytime someone moves the drag

MVC.Controller.DragAction = MVC.Controller.DelegateAction.extend({
    match: new RegExp("(.*?)\\s?(dragstart|dragend|dragging)$")
},
//Prototype functions
{    
    init: function(action, f, controller){
        this.action = action;
        this.func = f;
        this.controller = controller;
        this.css_and_event();
        var selector = this.selector();
        //here we are going to create a new mousedown event for selectors that match our mouse event
        
        //if one has already been created, lets add it to the list of callbacks we want to give our
        //draggable
        if(MVC.Draggable.selectors[selector]) {
            MVC.Draggable.selectors[selector].events[this.event_type] = action;
            return;
        }
        
        
        MVC.Draggable.selectors[selector] = 
            new MVC.DelegationEvent(this.selector(), 'mousedown', function(params){
               //go through list of events, add as parameters for
               for(var event_type in MVC.Draggable.selectors[selector].events){
                   if(MVC.Draggable.selectors[selector].events.hasOwnProperty(event_type) )
                       params[event_type] = MVC.Controller.dispatch_closure(controller.className, MVC.Draggable.selectors[selector].events[event_type]);
               }
               // create the dragable with the callbacks in place;
               // these callbacks should be prepared above, so they aren't created everytime you start dragging.
               MVC.Draggable.current = new MVC.Draggable(params);
            });
        MVC.Draggable.selectors[selector].events = {};
        MVC.Draggable.selectors[selector].events[this.event_type] = action;
    }
});
//drag controller name, for each selector and event, 
//Dragable takes the element and initial mousedown event as parameters.
MVC.Draggable = function(params){
    this.element = params.element;
    this.moved = false;
    //this.originalz = MVC.Element.getStyle(this.element,'z-Index');
    //this.originallyAbsolute = MVC.Element.getStyle(this.element,'position')  == 'absolute';

    this.mouse_position_on_element = 
            MVC.Event.pointer(params.event).minus( MVC.Element.cumulativeOffset(params.element) )
    
    this.dragstart = params.dragstart || function(){};
    this.dragend = params.dragend || function(){};
    this.dragging = params.dragging || function(){};
};


MVC.Draggable.prototype = {
    start: function(event){
        MVC.Element.makePositioned(this.element);
        this.element.style.zIndex = 1000;  //make the z-Index high
        this.moved = true;
        this.dragstart({element: this.element, event: event});
        MVC.Droppables.compile(); //Get the list of Droppables.
    },
    //returns the current relative offset
    currentDelta: function() {
        return new MVC.Vector( parseInt(MVC.Element.getStyle(this.element,'left') || '0'), 
                            parseInt(MVC.Element.getStyle(this.element,'top') || '0'))   ;
    },
    //draws the position of the dragging object
    draw: function(pointer, event){
        if(!this.moved) this.start(event);  //on first move, call start
        MVC.Position.prepare();
        var pos = MVC.Element.cumulativeOffset(this.element).minus(this.currentDelta());//current position, minus offset = where element should be
        var p = pointer.minus(pos).minus( this.mouse_position_on_element );  //from mouse position
        var s = this.element.style;
        s.top =  p.top()+"px";
        s.left =  p.left()+"px";
        MVC.Droppables.show(pointer, this.element, event);  //Tell dropables where mouse is
        this.dragging({element: this.element, event: event}); //Callback to controller dragging action
    }
}
MVC.Draggable.selectors = {};

//==============================================================================

MVC.Draggable.current = null;


//Observe all mousemoves and mouseups.
MVC.Event.observe(document, 'mousemove', function(event){
    if(!MVC.Draggable.current ) return;  //do nothing if nothing is being dragged.
    MVC.Draggable.current.draw(MVC.Event.pointer(event), event); //update draw
});

MVC.Event.observe(document, 'mouseup', function(event){
    //if there is a current, we should call its dragstop
    if(MVC.Draggable.current){
        MVC.Draggable.current.dragend({element: MVC.Draggable.current.element, event: event});
        MVC.Droppables.fire(event,MVC.Draggable.current.element)
    }

    MVC.Draggable.current = null;
});




