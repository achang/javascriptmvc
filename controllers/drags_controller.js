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


