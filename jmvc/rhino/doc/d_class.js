MVCObject.DClass = MVCObject.DPair.extend('class',
{
    code_match: /(\w+)\s*=\s*([\w\.]+?).extend\(/,
    starts_scope: true,
    listing: []
},
{
    init: function(comment, code, scope ){
        this._super(comment, code, scope);
        this.Class.listing.push(this);
    },
    add_parent : function(scope){
        this.parent = scope.Class.className != 'file' ? scope.parent : scope;
        this.parent.add(this);
    },
    code_setup: function(){
        var parts = this.code.match(this.Class.code_match);
        this.name = parts[1];
        this.sup = parts[2];
    },
    comment_setup: function(){
        
    },
    toHTML : function(){
        //get children
        
        var ret = "<div><h1>"+this.name+" <label>API</label></h1>"
        ret+= "<div id='shortcuts'>"+this.get_quicklinks()+"</div>";
        
        
        ret += "<div class='group'>"+this.comment+"</div>\n"
        ret+= this.make(this.children);

        //get names
        
        //go through and get static/prototype method and attributes
        
        
        return ret+"</div>"
        //return "Class: "+this.name+"\n"+parts.join("\n\n");
    },
    toFile : function(){
        var res = '<html><head><link rel="stylesheet" href="../style.css" type="text/css"><title>'+this.name+"<title></head><body>"
        res+= this.toHTML();
        res +="</body></html>"
        MVCOptions.save('docs/classes/'+this.name+".html", res)
    },
    get_quicklinks : function(){
        var inside = this.linker().sort(MVCObject.DPair.sort_by_full_name);
        var result = [];
        for(var i = 0; i < inside.length; i++){
            var link = inside[i];
            result.push( "<a href='#"+link.full_name+"'>"+link.name+"</a>"  )
        }
        return result.join(", ")
        
    }
});