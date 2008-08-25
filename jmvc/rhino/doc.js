MVCObject = {};
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  MVCObject.Class = function(){};
  // Create a new Class that inherits from this class
  MVCObject.Class.extend = function(className, klass, proto) {
    if(typeof className != 'string'){
        proto = klass;
        klass = className;
        className = null;
    }
    if(!proto){
        proto = klass;
        klass = null;
    }
    var _super_class = this;
    var _super = this.prototype;
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    // Copy the properties over onto the new prototype
    for (var name in proto) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof proto[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(proto[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);       
            this._super = tmp;
           
            return ret;
          };
        })(name, proto[name]) :
        proto[name];
    }
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    // Populate our constructed prototype object
    Class.prototype = prototype;
    Class.prototype.Class = Class;
    // Enforce the constructor to be what we expect
    Class.constructor = Class;
    // And make this class extendable
    
    for(var name in this){
        if(this.hasOwnProperty(name) && name != 'prototype'){
            Class[name] = this[name];
        }
    }
    
    for (var name in klass) {
      Class[name] = typeof klass[name] == "function" &&
        typeof Class[name] == "function" && fnTest.test(klass[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            this._super = _super_class[name];
            var ret = fn.apply(this, arguments);       
            this._super = tmp;
            return ret;
          };
        })(name, klass[name]) :
        klass[name];
	};
    Class.extend = arguments.callee;
    if(className) Class.className = className;
    
    if(Class.init) Class.init(Class);
    if(_super_class.extended) _super_class.extended(Class);
    
    return Class;
  };
})();




var reg = 

(function(){
    
    
    var Doc =  function(){
    
    }
    
    Doc.prototype = {
        comment: new RegExp("(?:/\\*(?:[^*]|(?:\\*+[^*/]))*\\*+/)", "g"),
        get_comments : function(text){
            var lines = text.match(this.comment);
        },
        clean_comment : function(comment){
            comment.replace(/\/\*|\*\//,'').replace(/\n\r?\w*\*?/,'\n')
        },
        add_file: function(){
            
        }
    }


    
    
    var DPair = MVCObject.Class.extend(
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
        starts_scope: false
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
            return this.name+ this.parent.full_name();
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
        }
    })
    
    
    var DStatic = DPair.extend('static',
    {starts_scope: true},
    {
        toHTML: function(){
            var ret = "<h2>Static</h2>"
            ret+= this.make(this.children);
            return ret;
        },
        add_parent : function(scope){
            this.parent = scope.Class.className == 'class' ? scope : scope.parent
            this.parent.add(this);
        }
    });
    
    var DPrototype = DStatic.extend('prototype',
    {
        toHTML: function(){
            var ret = "<h2>Prototype</h2>"
            ret+= this.make(this.children);
            return ret;
        }
    });
    
    
    
    DClass = DPair.extend('class',
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
            ret += "<p>"+this.comment+"</p>"
            ret+= this.make(this.children);

            //get names
            
            //go through and get static/prototype method and attributes
            
            
            return ret+"</div>"
            //return "Class: "+this.name+"\n"+parts.join("\n\n");
        }
    });
     var DAttribute = DPair.extend('attribute',{
         code_match: function(code){
             return code.match(/(\w+)\s*[:=]\s*/) && !code.match(/(\w+)\s*[:=]\s*function\(([^\)]*)/)  
         }
     },{
         code_setup: function(){
            var parts = this.code.match(/(\w+)\s*[:=]\s*/);
            this.name = parts[1];
         },
         toHTML: function(){
             return "<div class='attribute'>"+this.name+"</div>"
         }
     })
    
    var DFunction = DPair.extend('function',
    {
        code_match: /(\w+)\s*[:=]\s*function\(([^\)]*)/
    },
    {
        code_setup: function(){
            var parts = this.Class.code_match(this.code);
            this.name = parts[1];
            var params = parts[2].match(/\w+/);
            this.params = [];
            for(var i = 0 ; i < params.length; i++)
                this.params.push({name: params[i], description: ""})
        },
        comment_setup: function(){
            
        },
        toHTML: function(){
            return "<div class='method'>"+
                        "<h4 id="+this.full_name()+">"+this.name+"</h4>"+
                        "<p>"+this.comment+"<p>"+
                        //"<pre class='signiture'><code>"+this.signiture()+"<code></pre>"+
                        //this.long_desc+
                        this.paramsHTML()+"</div>";
        },
        signiture : function(){
            var res = [];
            for(var p = 0; p < this.params.length; p++){
                res.push(this.params[p].name)
            }
            return this.name+"("+res.push(", ")+") -> "+this.ret.name;
        },
        paramsHTML : function(){
            var res = '';
            for(var p = 0; p < this.params.length; p++){
                var param = this.params[p];
                res += "<div class='param'><label>"+param.name+"</label>"+param.description+"</div>"
            }
            return res;
        }
    });
    

    
    
    /*
     * 
     */
    DFile = DPair.extend('file',
    {
        group : new RegExp("(?:/\\*(?:[^*]|(?:\\*+[^*/]))*\\*+/\[\S\\n\\r]*[^\\n]*)", "g"),
        splitter : new RegExp("(?:/\\*((?:[^*]|(?:\\*+[^*/]))*)\\*+/\[^\\w]*([^\\r\\n]*))")
    },{
        init : function(code, n){
            this.children = [];
            this.name = n;
            this.src=code;
        },
        generate : function(){
            //find all comments

            //pairs of comment and first liners
            
            
            var pairs = this.src.match(this.Class.group);
            //clean comments
            var scope = this;
            
            for(var i = 0; i < pairs.length ; i ++){
                var splits = pairs[i].match(this.Class.splitter);
                var comment = splits[1].replace(/\/\*|\*\//,'').replace(/\r?\n\s*\*?\s*/g,'\n');
                var code = splits[2];
                var pair = DPair.create( comment , code, scope);
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
    
    
    
    var DObject = MVCObject.Class.extend('object',{
        
    },{
        init : function(parent, code){
            
        },
        full_name: function(){
            return this.name+ this.parent.full_name();
        }
    })
    
    
    var DMethod = DObject.extend('method',{
        
    },{
        init: function(par, n, short_desc, long_desc, file, params, ret){
            this.parent = par;
            this.name = n;
            this.short_desc = short_desc;
            this.long_desc = long_desc;
            this.file = file;
            this.params = params;
            this.ret = ret;
        },
        toHTML: function(){
            return "<div class='method'>"+
                        "<h3 id="+this.full_name()+">"+this.name+"</h3>"+
                        "<p>"+this.short_desc+"<p>"+
                        "<pre class='signiture'><code>"+this.signiture()+"<code></pre>"+
                        this.long_desc+
                        this.params();
        },
        signiture : function(){
            var res = [];
            for(var p = 0; p < this.params.length; p++){
                res.push(this.params[p].name)
            }
            return this.name+"("+res.push(", ")+") -> "+this.ret.name;
        },
        params : function(){
            var res = '';
            for(var p = 0; p < this.params.length; p++){
                res += "<div class='param'><label>"+this.params[p].name+"</label>"+this.params[p].description+"</div>"
            }
            return res;
        }
    })
    




    
})();

