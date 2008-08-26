MVCObject.DPair = MVCObject.Class.extend(
{
    code_match: function(){ return null},
    classes: [],
    extended: function(Klass){
        if(Klass.className){
            this.classes.push(Klass)
        }
    },
    create: function(comment, code, scope){
        //first lets get the type!
        //check the comment
        var check =  comment.match(/\w+/), type

        if(!(type = this.has_type(check ? check[0] : null)) ){ //try code
            type = this.guess_type(code);
        }
        if(!type) return null;
        return new type(comment, code, scope)
    },
    has_type: function(type){
        for(var i=0;i< this.classes.length; i++){
            if(this.classes[i].className.toLowerCase() == type.toLowerCase() ) 
                return this.classes[i];
        }
        return null;
    },
    guess_type: function(code){
        for(var i=0;i< this.classes.length; i++){
            if(this.classes[i].code_match(code) ) 
                return this.classes[i];
        }
        return null;
    },
    starts_scope: false,
    sort_by_full_name : function(a, b){
       
       if(a.full_name == b.full_name) return 0;
       return a.full_name > b.full_name ? 1: -1;
    },
    sort_by_name : function(a, b){
       
       if(a.name == b.name) return 0;
       return a.name > b.name ? 1: -1;
    }
},
{
    init : function(comment, code, scope ){
        this.children = []
        this.comment = comment;
        this.code = code;

        //we need to add to a class if we 
        this.add_parent(scope);
        
        if(this.Class.code_match(this.code))
            this.code_setup();
        this.comment_setup();
    },
    add: function(child){
        this.children.push(child);
    },
    add_parent : function(scope){
         this.parent = scope;
         this.parent.add(this);
    },
    scope: function(){
        return this.Class.starts_scope ? this : this.parent
    },
    code_setup: function(){},
    comment_setup: function(){},
    toHTML : function(){
        var parts = [];
        for(var c=0; c<this.children.length; c++){
            parts.push( this.children[c].toHTML());
        }
        
        return this.Class.className+": "+this.name+"\n"+parts.join("\n\n");
    },
    full_name: function(){
        var par = this.parent.full_name()
        return (par ? par+"." : "")+this.name ;
    },
    make : function(arr){
        var res = ["<div>"];
        //we should alphabetize by name
        
        for(var c=0; c<arr.length; c++){
            var child = arr[c];
            res.push(child.toHTML());
        }
        res.push("</div>");
        return res.join("");
    },
    linker : function(){
        var result = [{name: this.name, full_name: this.full_name()}];
        
        if(this.children){
            for(var c=0; c<this.children.length; c++){
                result = result.concat( this.children[c].linker()  );
            }
        }
        return result;
    }
})