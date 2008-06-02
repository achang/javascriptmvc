//Dragging = null;

/*MVC.Controller('main',{
    load: function(){
        
        MVC.Droppables.add( $('drop_here'), {hoverclass: 'hover',onHover: this.continue_to('hovered') } );
        new Draggable($('script_drag') );	
    },
    mousemove : function(params){
        var mousePos = MVC.Event.pointer(params.event);
        $('mouse').innerHTML = mousePos.toString();
        
        if(!Dragging ) return;
        
        
        if(!Dragging.moved){
            Dragging.start();
        }
        
        var mouse_position = MVC.Event.pointer(params.event);
        Dragging.draw(mouse_position)
        params.event.kill();
        
    },
    mouseup : function(){
        Dragging = null;
    },
    hovered : function(params){
        params.element.backgroundColor = 'Blue'
    }
})
new MVC.DelegationEvent('body','click', function(){
    alert('clicked')
});
new MVC.DelegationEvent('p','click', function(){
    alert('p click')
});*/

MainController = MVC.Controller.extend('main',{
    load: function(){
        alert('load')
    }
})


DragsController = MVC.Controller.extend('drags',{
    dragstart: function(params){
        document.documentElement.style.backgroundColor = 
            'rgb('+parseInt(Math.random()*255)+','+parseInt(Math.random()*255)+','+parseInt(Math.random()*255)+  ')'
    },
    dragging: function(params){
        params.element.style.backgroundColor = 
            'rgb('+parseInt(Math.random()*255)+','+parseInt(Math.random()*255)+','+parseInt(Math.random()*255)+  ')'
    },
    dragend: function(params){
        document.documentElement.style.backgroundColor = 
            'rgb('+parseInt(Math.random()*255)+','+parseInt(Math.random()*255)+','+parseInt(Math.random()*255)+  ')'
    },
    mouseover : function(params){
        params.element.style.backgroundColor = '#ddddff'
    },
    mouseout : function(params){
        params.element.style.backgroundColor = ''
    }
})


DropsController = MVC.Controller.extend('drops',{
    dragover : function(params){ //the element being hovered over, dropped_element
        params.element.style.backgroundColor = "Gray"
    },
    dropped : function(params){
       params.element.style.backgroundColor = "Yellow"
    },
    dragout : function(params){
        params.element.style.backgroundColor = ""
    }
});


