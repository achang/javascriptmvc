/*
 * TODOS:
 * - Need to remove droppables after something has been dropped, or just keep adding new ones
 * - Need a method for removing droppables
 * 
 */


//add mouseover and mouseout when something is being dragged.
//  be good if mouseover and mouseout can only be called when appropriate

MVC.Controller.DropAction = MVC.Controller.DelegateAction.extend({
    match: new RegExp("(.*?)\\s?(dragover|dropped|dragout)$")
},
//Prototype functions
{    
    init: function(action, f, controller){
        this.action = action;
        this.func = f;
        this.controller = controller;
        this.css_and_event();
        var selector = this.selector();
        // basically add selector to list of selectors:
        if(MVC.Droppables.selectors[selector]) {
            MVC.Droppables.selectors[selector][this.event_type] = MVC.Controller.dispatch_closure(controller.className, action);
            return;
        }
        MVC.Droppables.selectors[selector] = {};
        MVC.Droppables.selectors[selector][this.event_type] = 
            MVC.Controller.dispatch_closure(controller.className, action); 
    }
});


MVC.Droppables = {
  drops: [],
  selectors: {},
  remove: function(element) {
    this.drops = this.drops.reject(function(d) { return d.element==$(element) });
  },

  add: function(element) {
    element = MVC.$E(element);
    var options = MVC.Object.extend({}, arguments[1] || { });

    // cache containers
    /*if(options.containment) {
      options._containers = [];
      var containment = options.containment;
      if(Object.isArray(containment)) {
        containment.each( function(c) { options._containers.push($(c)) });
      } else {
        options._containers.push($(containment));
      }
    }
    
    if(options.accept) options.accept = [options.accept].flatten();*/

    MVC.Element.makePositioned(element); // fix IE
    options.element = element;

    this.drops.push(options);
  },
  
  findDeepestChild: function(drops) {
    var deepest = drops[0];
      
    for (i = 1; i < drops.length; ++i)
      if (MVC.Element.isParent(drops[i].element, deepest.element))
        deepest = drops[i];
    
    return deepest;
  },

  isContained: function(element, drop) {
    var containmentNode = element.parentNode;
    for(var c = 0; i < drop._containers.length; i++ ){
        if(containmentNode == drop._containers[c]) return drop._containers[c]
    }
  },
  
  isAffected: function(point, element, drop) {
    return (
      (drop.element!=element) &&
      ( (!drop._containers) || this.isContained(element, drop) ) && 
      MVC.Position.withinIncludingScrolloffsets(drop.element, point[0], point[1]) );
  },

  deactivate: function(drop, element, event) {
    this.last_active = null;
    if(drop.dragout) drop.dragout( {element: drop.element, drag_element: element, event: event });
  }, //this is where we should call out

  activate: function(drop, element, event) { //this is where we should call over
    this.last_active = drop;
    if(drop.dragover) drop.dragover( {element: drop.element, drag_element: element, event: event });
      
  },

  show: function(point, element, event) {
    if(!this.drops.length) return;
    var drop, affected = [];
    
    for(var d =0 ; d < this.drops.length; d++ ){
        if(MVC.Droppables.isAffected(point, element, this.drops[d])) affected.push(this.drops[d]);
    }

    if(affected.length>0)
      drop = MVC.Droppables.findDeepestChild(affected);

    if(this.last_active && this.last_active != drop) this.deactivate(this.last_active, element, event);
    if (drop) {
      MVC.Position.within(drop.element, point[0], point[1]);  
      if (drop != this.last_active) MVC.Droppables.activate(drop, element, event);
    }
  },

  fire: function(event, element) {
    if(!this.last_active) return;
    MVC.Position.prepare();

    if (this.isAffected(MVC.Event.pointer(event), element, this.last_active))
      
      if (this.last_active.dropped) {
        this.last_active.dropped({dropped_element: element, event: event, element: this.last_active.element}); 
        return true; 
      }
  },

  reset: function() {
    if(this.last_active)
      this.deactivate(this.last_active);
  },
  compile : function(){
      var elements = [];
      for(var selector in MVC.Droppables.selectors){
          var sels = elements.concat( MVC.Query(selector) )
          for(var e= 0; e < sels.length; e++){
              MVC.Droppables.add(sels[e], MVC.Droppables.selectors[selector])
          }
      }
   
  }
};