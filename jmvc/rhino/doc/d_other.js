MVCObject.DStatic = MVCObject.DPair.extend('static',
{starts_scope: true},
{
    toHTML: function(){
        var ret = "<h2>Static Methods</h2>"
        ret+= this.make(this.children.sort(MVCObject.DPair.sort_by_name)  );
        return ret;
    },
    add_parent : function(scope){
        var scope_class=  scope.Class.className;
        this.parent = scope_class == 'class' || scope_class == 'constructor' ? scope : scope.parent
        this.parent.add(this);
    },
    name: 'static'
});

MVCObject.DPrototype = MVCObject.DStatic.extend('prototype',
{
    toHTML: function(){
        var ret = "<h2>Prototype Methods</h2>"
        ret+= this.make(this.children);
        return ret;
    },
    name: 'prototype'
});




 
 MVCObject.DAttribute = MVCObject.DPair.extend('attribute',{
     code_match: function(code){
         return code.match(/(\w+)\s*[:=]\s*/) && !code.match(/(\w+)\s*[:=]\s*function\(([^\)]*)/)  
     }
 },{
     code_setup: function(){
        var parts = this.code.match(/(\w+)\s*[:=]\s*/);
        this.name = parts[1];
     },
     toHTML: function(){
         return "<div class='attribute'><h3>"+this.name+"</h3><p>"+this.comment
         +"</p></div>"
     }
 })






/*
 * 
 */
MVCObject.DFile = MVCObject.DPair.extend('file',
{
    group : new RegExp("(?:/\\*(?:[^*]|(?:\\*+[^*/]))*\\*+/\[\S\\n\\r]*[^\\n]*)", "g"),
    splitter : new RegExp("(?:/\\*+((?:[^*]|(?:\\*+[^*/]))*)\\*+/\[^\\w]*([^\\r\\n]*))")
},{
    init : function(inc){
        this.children = [];
        this.name = inc.path;
        this.src=inc.text;
        //if(!this.name.match(/jmvc/)  ){
            print('docs for '+this.name)
            this.generate();
        //}
            
            
    },
    generate : function(){
        //find all comments

        //pairs of comment and first liners
        
        
        var pairs = this.src.match(this.Class.group);
        //clean comments
        var scope = this;
        if(!pairs) return;
        for(var i = 0; i < pairs.length ; i ++){
            var splits = pairs[i].match(this.Class.splitter);
            var comment = splits[1].replace(/^ +|\/\*+|\*\//g,'').replace(/\r?\n\s*\**\s*/g,'\n');
            var code = splits[2];
            var pair = MVCObject.DPair.create( comment , code, scope);
            if(pair)
                scope = pair.scope();
        }
        //return this.toHTML();
    },
    make_doc: function(cleaned){
        //go through and match Class, Function, Member
    },
    clean_comment : function(comment){
        //get the comment
        
        
        return comment.replace(/\/\*|\*\//,'').replace(/\r?\n\s*\*?\s*/g,'\n')
    },
    full_name: function(){
        return "";
    }
})