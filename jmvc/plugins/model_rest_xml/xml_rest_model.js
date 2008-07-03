MVC.Tree = new XML.ObjTree();
MVC.Tree.attr_prefix = "@";

MVC.XMLRestModel = MVC.Model.extend(
{
    init: function(){
        if(!this.className) return;
        this.plural_name = MVC.String.pluralize(this.className);
        this.singular_name =  this.className;
    },
    find_all: function(params, callback){
        var url = '/'+this.plural_name+'.xml';
        new MVC.Ajax(url, {parameters: params, method: 'get', onComplete: this.find_callback(callback)} );
    },
    find_callback : function(callback){
        return MVC.Function.bind( function(transport){
            if(transport.status == 500) return callback(null);
            
            var doc = MVC.Tree.parseXML(transport.responseText);
			
			// convert dashes to underscores for second and third level hash keys
			for(var key in doc) {
				if(key.match(/-/) && typeof doc[key] == 'object' ){
					doc[key.replace(/-/,'_')] = doc[key];
					delete doc[key];
				}
			}
			for(var key in doc) {
				if (typeof doc[key] == 'object') {
					for (var second_key in doc[key]) {
						if (second_key.match(/-/) && typeof doc[key][second_key] == 'object') {
							doc[key][second_key.replace(/-/, '_')] = doc[key][second_key];
							delete doc[key][second_key];
						}
					}
				}
			}
            if(!doc[this.plural_name]) return callback([]);
            
            //check if there is only one.  If there is create it in an array
            //if (!this.elementHasMany(doc[this.plural_name])){
			if(!(doc[this.plural_name][this.singular_name] instanceof Array)){
        		doc[this.plural_name][this.singular_name] = [doc[this.plural_name][this.singular_name]];
        	}
          
            collection = [];
        	var attrs = doc[this.plural_name][this.singular_name];
        	for(var i = 0; i < attrs.length; i++){
        		collection.push(this.create_as_existing(this._attributesFromTree(attrs[i])))
        	}
            callback( collection );
        }, this);
    },
    create: function(attributes, callback){
        //we need to create
        //
        var params = {}
        //params[this.singular_name] = attributes;
		params = attributes;

        var instance = new this(attributes);
        var url = '/'+this.plural_name+'.xml';
        new MVC.Ajax(url, {parameters: params, method: 'post', onComplete: this.create_callback(callback, instance)} );
    },
    create_callback: function(callback, instance){
        return MVC.Function.bind( function(transport){
            var saved = false;
              if (/\w+/.test(transport.responseText)) {
                var errors = this._errorsFromXML(transport.responseText);
                if (errors)
                  this.add_errors(errors);
                else {
                    var attributes;
                    var doc = MVC.Tree.parseXML(transport.responseText);
                    
                    if (doc && doc[this.Class.singular_name])
                      attributes = this.Class._attributesFromTree(doc[this.Class.singular_name]);

                    if (attributes)
                      this._resetAttributes(attributes);
                }
              }
        
              // Get ID from the location header if it's there
              if (this.is_new_record() && transport.status == 201) {
        	  	loc = transport.responseText;
        	  	try{loc = transport.getResponseHeader("location");}catch(e){};
                if (loc) {
                  //todo check this with prototype
        		  var mtcs = loc.match(/\/[^\/]*?(\w+)?$/);
        		  
        		  if(mtcs){
        		  	var id = parseInt(mtcs[1]);
        			if (!isNaN(id))
                    	this._setProperty("id", id);
        		  }
                }
              }
        	  callback(this);
        	  //return (this.errors.length == 0);
              //return (transport.status >= 200 && transport.status < 300 && this.errors.length == 0);
            
        }, instance);
    },
    update: function(id, attributes, callback){
        delete attributes.id
        var params = {};
        params[this.singular_name] = attributes;
        var instance = this.create_as_existing(attributes);
        instance.id = id;
        
        var url = '/'+this.plural_name+'/'+id+'.xml';
        new MVC.Ajax(url, {parameters: params, method: 'put', onComplete: this.update_callback(callback, instance)} );
    },
    update_callback: function(callback, instance){
        return MVC.Function.bind( function(transport){
            var saved = false;
              if (/\w+/.test(transport.responseText)) {
                var errors = this._errorsFromXML(transport.responseText);
                if (errors)
                  this.add_errors(errors);
                else {
                    var attributes;
                    var doc = MVC.Tree.parseXML(transport.responseText);
                    
                    if (doc && doc[this.Class.singular_name])
                      attributes = this.Class._attributesFromTree(doc[this.Class.singular_name]);

                    if (attributes)
                      this._resetAttributes(attributes);
                }
              }
        	  callback(this);
        }, instance);
    },
    destroy: function(id, callback){
        var url = '/'+this.plural_name+'/'+id+'.xml';
        new MVC.Ajax(url, { method: 'delete', onComplete: this.destroy_callback(callback)} );
    },
    destroy_callback: function(callback){
        return MVC.Function.bind( function(transport){
            if (transport.status == 200)
                callback(true);
            else
                callback(false);
        }, this);
    },
    elementHasMany: function(element) {
          if(!element)
          	return false;
          var i = 0;
          var singular = null;
          var has_many = false;
          for (var val in element) {
          	if(element.hasOwnProperty(val)){
        	    if (i == 0)
        	      singular = val;
        	    i += 1;
        	}
          }
          return (element[singular] && typeof(element[singular]) == "object" && element[singular].length != null && i == 1);
    },
    _attributesFromTree : function(elements) {
        var attributes = {};
        for (var attr in elements) {
          if(! elements.hasOwnProperty(attr)) continue;
    	  // pull out the value
          var value = elements[attr];
          if (elements[attr] && elements[attr]["@type"]) {
            if (elements[attr]["#text"])
              value = elements[attr]["#text"];
            else
              value = undefined;
          }
          
          // handle empty value (pass it through)
          if (!value) var a = {};
          
          // handle scalars
          else if (typeof(value) == "string") {
            // perform any useful type transformations
            if (elements[attr]["@type"] == "integer") {
              var num = parseInt(value);
              if (!isNaN(num)) value = num;
            }
            else if (elements[attr]["@type"] == "boolean")
              value = (value == "true");
            else if (elements[attr]["@type"] == "datetime") {
              var date = MVC.Date.parse(value);
              if (!isNaN(date)) value = date;
            }
          }
          // handle arrays (associations)
          else {
            var relation = value; // rename for clarity in the context of an association
            
            // first, detect if it's has_one/belongs_to, or has_many
            var i = 0;
            var singular = null;
            var has_many = false;
            for (var val in relation) {
              if(relation.hasOwnProperty(val)){
    			  if (i == 0)	
    	            singular = val;
    	          i += 1;
    		  }
            }
            
            // has_many
            if (relation[singular] && typeof(relation[singular]) == "object" && i == 1) {
              alert('has_many')
              var value = [];
              var plural = attr;
              var name = MVC.String.classize(singular);
              
              // force array
              if (!(elements[plural][singular].length > 0))
                elements[plural][singular] = [elements[plural][singular]];
              
              elements[plural][singular].each( MVC.Function.bind(function(single) {
                // if the association hasn't been modeled, do a default modeling here
                // hosted object's prefix and format are inherited, singular and plural are set
                // from the XML
                if (eval("typeof(" + name + ")") == "undefined") {
                  MVC.Resource.model(name, {prefix: this._prefix, singular: singular, plural: plural, format: this._format});
                }
                var base = eval(name + ".create_as_existing(this._attributesFromTree(single))");
                value.push(base);
              },this));
            }
            // has_one or belongs_to, or nothing
            else {
              singular = attr;
              var name = MVC.String.classize(singular);
              
              // if the association hasn't been modeled, do a default modeling here
              // hosted object's prefix and format are inherited, singular is set from the XML
              if (eval("typeof(" + name + ")") != "undefined") {
                value = eval(name + ".create_as_existing(this._attributesFromTree(value))");
                //MVC.Resource.model(name, {prefix: this._prefix, singular: singular, format: this._format});
              }else{
                  value = null;
              }
              
            }
          }
          
          // transform attribute name if needed
          attribute = attr.replace(/-/g, "_");
          attributes[attribute] = value;
        }
        return attributes;
	}
},
{
    
    _errorsFromXML : function(xml) {
        if (!xml) return false;
        var doc = MVC.Tree.parseXML(xml);
    
        if (doc && doc.errors) {
          var errors = [];
          if (typeof(doc.errors.error) == "string") doc.errors.error = [doc.errors.error];
          
          for(var i=0; i < doc.errors.error.length; i++){
              //check if 
              var error = doc.errors.error[i];
              var matches = error.match(/(\w+) (.*)/)
              errors.push([matches[1].toLowerCase(), matches[2].toLowerCase()]);
          }
          return errors;
        }
        else return false;
    }
    
    
}
)