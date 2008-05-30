MVC.Droppables = {
  drops: [],

  remove: function(element) {
    this.drops = this.drops.reject(function(d) { return d.element==$(element) });
  },

  add: function(element) {
    element = $(element);
    var options = MVC.Object.extend({
      greedy:     true,
      hoverclass: null,
      tree:       false
    }, arguments[1] || { });

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

    Element.makePositioned(element); // fix IE
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
    var containmentNode = drop.tree ? element.treeNode : element.parentNode;
    for(var c = 0; i < drop._containers.length; i++ ){
        if(containmentNode == drop._containers[c]) return drop._containers[c]
    }
  },
  
  isAffected: function(point, element, drop) {
    return (
      (drop.element!=element) &&
      
      ( (!drop._containers) || this.isContained(element, drop) ) && 
      
      (
        (!drop.accept) ||
        (Element.classNames(element).detect( function(v) { return drop.accept.include(v) } ) )
      ) &&
      
      MVC.Position.withinIncludingScrolloffsets(drop.element, point[0], point[1]) );
      
	  //Position.within(drop.element, point[0], point[1]) );
  },

  deactivate: function(drop) {
    if(drop.hoverclass)
      Element.removeClassName(drop.element, drop.hoverclass);
    this.last_active = null;
  },

  activate: function(drop) {
    if(drop.hoverclass)
      Element.addClassName(drop.element, drop.hoverclass);
    this.last_active = drop;
  },

  show: function(point, element) {
    if(!this.drops.length) return;
    var drop, affected = [];
    
    for(var d =0 ; d < this.drops.length; d++ ){
        if(MVC.Droppables.isAffected(point, element, this.drops[d])) affected.push(this.drops[d]);
    }
    

        
    if(affected.length>0)
      drop = MVC.Droppables.findDeepestChild(affected);

    if(this.last_active && this.last_active != drop) this.deactivate(this.last_active);
    if (drop) {
      MVC.Position.within(drop.element, point[0], point[1]);
      if(drop.onHover)
        drop.onHover(element, drop.element, Position.overlap(drop.overlap, drop.element));
      
      if (drop != this.last_active) Droppables.activate(drop);
    }
  },

  fire: function(event, element) {
    if(!this.last_active) return;
    Position.prepare();

    if (this.isAffected([Event.pointerX(event), Event.pointerY(event)], element, this.last_active))
      if (this.last_active.onDrop) {
        this.last_active.onDrop(element, this.last_active.element, event); 
        return true; 
      }
  },

  reset: function() {
    if(this.last_active)
      this.deactivate(this.last_active);
  }
};