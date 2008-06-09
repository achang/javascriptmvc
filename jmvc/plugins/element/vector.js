MVC.Vector = function(){
    this.update( MVC.Array.from(arguments) );
};
MVC.Vector.prototype = {
    plus: function(){
        var args = arguments[0] instanceof MVC.Vector ? 
                 arguments[0].array : 
                 MVC.Array.from(arguments), 
            arr=this.array.slice(0), 
            vec = new MVC.Vector();
        for(var i=0; i < args.length; i++)
            arr[i] = (arr[i] ? arr[i] : 0) + args[i];
        return vec.update(arr);
    },
    minus: function(){
         var args = arguments[0] instanceof MVC.Vector ? 
                 arguments[0].array : 
                 MVC.Array.from(arguments), 
             arr=this.array.slice(0), vec = new MVC.Vector();
         for(var i=0; i < args.length; i++)
            arr[i] = (arr[i] ? arr[i] : 0) - args[i];
         return vec.update(arr);
    },
    x : function(){ return this.array[1] },
    y : function(){ return this.array[0] },
    top : function(){ return this.array[1] },
    left : function(){ return this.array[0] },
    toString: function(){
        return "("+this.array[0]+","+this.array[1]+")";
    },
    update: function(array){
        if(this.array){
            for(var i =0; i < this.array.length; i++) delete this.array[i];
        }
        this.array = array;
        for(var i =0; i < array.length; i++) this[i]= this.array[i];
        return this;
    }
};


MVC.Event.pointer = function(event){
	return new MVC.Vector( 
        event.pageX || (event.clientX +
          (document.documentElement.scrollLeft || document.body.scrollLeft)),
          event.pageY || (event.clientY +
          (document.documentElement.scrollTop || document.body.scrollTop)
         )
    );
};