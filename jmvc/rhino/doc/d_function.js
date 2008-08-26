MVCObject.DFunction = MVCObject.DPair.extend('function',
    {
        code_match: /([\w\.]+)\s*[:=]\s*function\(([^\)]*)/
        
        
    },
    {
        code_setup: function(){
            var parts = this.Class.code_match(this.code);
            this.name = parts[1];
            this.params = {};
            this.ret = {type: 'undefined'}
            var params = parts[2].match(/\w+/);
            if(!params) return;
            
            for(var i = 0 ; i < params.length; i++){
                this.params[params[i]] = {description: "", type: "", optional: false};
            }
            
        },
        comment_setup: function(){
            var i = 0;
            var lines = this.comment.split("\n");
            this.real_comment = '';
            
            var last, last_data;

            for(var l=0; l < lines.length; l++){
                var line = lines[l];
                var match = line.match(/@(\w+)/)
                if(match){
                    last_data = this[match[1]+'_add'](line);
                    if(last_data) last = match[1]; else last = null;
                }
                else if(!line.match(/^constructor/i) && !last )
                    this.real_comment+= line+"\n"
                else if(last && this[last+'_add_more']){
                    this[last+'_add_more'](line, last_data);
                }
            }
        },
        param_add_more : function(line, last){
            if(last);
                last.description += "\n"+line;
        },
        param_add: function(line){
            var parts = line.match(/@param (?:\{(?:(optional):)?([\w\.\/]+)\})? ?([\w\.]+) ?(.*)?/);
            if(!parts) return;
            var description = parts.pop();
            var n = parts.pop();
            
            var type =  parts.pop();
            var optional = parts.pop() ? true : false;
            
            this.params[n] = {description: description || "", type: type|| "", optional: optional};
            return this.params[n];
        },
        return_add: function(line){
            var parts = line.match(/@return (?:\{([\w\.]+)\})? ?([\w\.]+)/);
            if(!parts) return;
            var description = parts.pop();
            var type = parts.pop();
            this.ret = {description: description, type: type};
            return this.ret;
        },
        
        toHTML: function(){
            return "<div class='method'>"+
                        "<h3 id="+this.full_name()+">"+this.name+"</h4>"+
                        "<pre class='signiture'><code>"+this.signiture()+"<code></pre>"+
                        "<p>"+this.real_comment+"</p>"+
                        //this.long_desc+
                        this.paramsHTML()+"</div>";
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