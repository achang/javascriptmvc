MVCObject.DConstructor = MVCObject.DPair.extend('constructor',
{
    code_match: /([\w\.]+)\s*[:=]\s*function\(([^\)]*)/,
    starts_scope: true,
    listing: [],
    create_index : function(){
        var res = '<html><head><link rel="stylesheet" href="../style.css" type="text/css">'+
            '<title>Constructors<title></head><body>'
        res += '<h1>Constructors <label>LIST</label></h1>'
        for(var i = 0; i < this.listing.length; i++){
            var name = this.listing[i].name;
            res += "<a href='"+name+".html'>"+name+"</a> "
        }
        res +="</body></html>"
        MVCOptions.save('docs/constructors/index.html', res)
    }
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
    code_setup: MVCObject.DFunction.prototype.code_setup,
    comment_setup: MVCObject.DFunction.prototype.comment_setup,
    return_add: MVCObject.DFunction.prototype.return_add,
    param_add: MVCObject.DFunction.prototype.param_add,
    constructor_add: function(line){
            var parts = line.match(/@constructor (.*)/);
            if(!parts) return;
            this.constructor = parts.pop();
            return this.constructor;
    },
    constructor_add_more: function(line){
        this.constructor +="\n"+ line;
    },
    toHTML : function(){
        //get children
        var ret = "<div><h1>"+this.name+" <label>API</label></h1>"
        ret+= "<div id='shortcuts'>"+this.get_quicklinks()+"</div>";
        ret += "<div class='group'>"+this.real_comment+"</div>\n"
        
        ret += "<div class='method'>"+
                        "<h3 id="+this.full_name()+">"+this.name+"</h4>"+
                        "<pre class='signiture'><code>"+this.signiture()+"<code></pre>"+
                        "<p>"+this.constructor+"</p>"+
                        //this.long_desc+
                        this.paramsHTML()+"</div>"
        
        
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
        MVCOptions.save('docs/constructors/'+this.name+".html", res)
    },
    get_quicklinks : function(){
        var inside = this.linker().sort(MVCObject.DPair.sort_by_full_name);
        var result = [];
        for(var i = 0; i < inside.length; i++){
            var link = inside[i];
            result.push( "<a href='#"+link.full_name+"'>"+link.name+"</a>"  )
        }
        return result.join(", ")
        
    },
    signiture : function(){
            var res = [];
            for(var n in this.params){
                res.push(n)
            }
            var n = this.name;
            //if(this.parent.Class.className == 'static')
            //    n = this.parent.parent.name+"."+this.name;
            //else if(this.parent.Class.className == 'prototype')
            //    n = this.parent.parent.name.toLowerCase()+"."+this.name;
            if(this.ret.type =='undefined'){
                n = "new "+n;
                this.ret.type = this.name.toLowerCase();
            }
            return n+"("+res.join(", ")+") -> "+this.ret.type;
        },
        paramsHTML : function(){
            var res = '';
            for(var n in this.params){
                var param = this.params[n];
                res += "<div class='param'><label>"+n+"</label> <code>"+param.type+"</code> "+param.description+"</div>"
            }
            return res;
        }
});