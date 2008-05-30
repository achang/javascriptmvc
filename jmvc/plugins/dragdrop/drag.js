// if drag/dragging/dropped .. create a mousedown event to create a new draggable
// Draggable should add drag, dragging, and dropped to its events

/*
MVC.Controller.Action.special_actions.push({
       matches: function(action){
           if(action.name == 'dragging'){
               return true;
           }
           return false;
       },
       add: function(action, controller){
           //basically need the mousedown action for this controller 
           
           var mousedown = function(params){
               MVC.Draggable.current = new MVC.Draggable(params)
           };
           
           controller.prototype.mousedown= mousedown;
           controller.controller_actions.mousedown = new MVC.Controller.Action('mousedown',mousedown, controller);
       }
})*/

MVC.Draggable = function(params){
    this.params = params;
    this.element = params.element;
    this.event = params.event;
    this.width = this.element.clientWidth;
    this.height = this.element.clientHeight;
    this.moved = false;
    this.originalz = MVC.Element.getStyle(this.element,'z-Index');
    this.originallyAbsolute = MVC.Element.getStyle(this.element,'position')  == 'absolute';
    this.mouse_offset();
};


MVC.Draggable.prototype = {
    start: function(){
        MVC.Element.makePositioned(this.element);
        this.element.style.width = (this.element.clientWidth);
        this.element.style.zIndex = 1000;
        this.moved = true;
    },
    mouse_offset: function(){
        this.element_start = MVC.Element.cumulativeOffset(this.element);
        log("<b>Element Offset:</b> "+this.element_start);
        var mousePos  = MVC.Event.pointer(this.event);
        log("<b>Starting Mouse:</b> "+mousePos)
        this.mouse_position_on_element = mousePos.minus( this.element_start )
        log("<b>Difference Mouse:</b> "+this.mouse_position_on_element)
    },
    currentDelta: function() {
        return new MVC.Vector( parseInt(MVC.Element.getStyle(this.element,'left') || '0'), 
                            parseInt(MVC.Element.getStyle(this.element,'top') || '0'))   ;
    },
    draw: function(pointer){
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
        
        MVC.Droppables.show(pointer, this.element);
        
        
        MVC.$E('relative').innerHTML = p.toString();
    }
}


//==============================================================================

MVC.Draggable.current = null;

MVC.Event.observe(document, 'mousemove', function(event){
        var mousePos = MVC.Event.pointer(event);
        MVC.$E('mouse').innerHTML = mousePos.toString();

        if(!MVC.Draggable.current ) return;
        if(!MVC.Draggable.current.moved) MVC.Draggable.current.start();
        MVC.Draggable.current.draw(mousePos)
        event.stopPropagation();
});

MVC.Event.observe(document, 'mouseup', function(event){
    MVC.Draggable.current = null;
});




