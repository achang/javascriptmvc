// based on the Jester library

// Jester version 1.5
// Released October 25th, 2007
// Homepage: http://www.jesterjs.org

// Copyright 2007, thoughtbot, inc.
// Released under the MIT License.

MVC.Model = function(cname, options, class_f, inst_f){
	
	
	inst_f= inst_f || {};
	inst_f.className = cname;
	window[MVC.String.classize(cname)] = MVC.Model.InstanceFunctions.extend(inst_f);
	var clss = window[MVC.String.classize(cname)];
	clss.prototype.Class = clss;
	
	MVC.Object.extend(clss, MVC.Model.ClassFunctions);
	
	fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
	for (var name in class_f) {
      clss[name] = typeof class_f[name] == "function" &&
        typeof MVC.Model.ClassFunctions[name] == "function" && fnTest.test(class_f[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            this._super = _super[name];
            var ret = fn.apply(this, arguments);       
            this._super = tmp;
            return ret;
          };
        })(name, class_f[name]) :
        class_f[name];
	};
	clss.init(cname, options)
};
MVC.Model.ClassFunctions = {
	init: function(model, options){
		var new_model = null;
		if (!MVC.Tree) {
	      MVC.Tree = new XML.ObjTree();
	      MVC.Tree.attr_prefix = "@";
	    }

	    if (!options) options = {};

	    options              = MVC.Object.extend({
	      format:   "xml",
	      singular: MVC.String.underscore(model),
	      name:     model
	    }, options);
	    options.format       = options.format.toLowerCase();
	    options.plural       = MVC.String.pluralize(options.singular,options.plural);
	    options.singular_xml = options.singular.replace(/_/g, "-");
	    options.plural_xml   = options.plural.replace(/_/g, "-");
	    options.remote       = false;
    
    // Establish prefix
    var default_prefix = window.location.protocol == 'file:' ? '' : (window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : ""));
    if (options.prefix && options.prefix.match(/^https?:/))
      options.remote = true;
      
    if (!options.prefix) options.prefix = default_prefix;
    
    if (!options.prefix.match(/^https?:/)) options.prefix = default_prefix + (options.prefix.match(/^\//) ? "" : "/") + options.prefix;
            
    options.prefix = options.prefix.replace(/\b\/+$/,"");
    
    // Establish custom URLs
    options.urls = MVC.Object.extend(this._default_urls(options), options.urls);

    // Assign options to model

    this.options = options;

    for(var opt in options)
	  if(options.hasOwnProperty(opt)) {
      	this["_" + opt] = options[opt];
	  }
    // Establish custom URL helpers
    for (var url in options.urls){
		if(options.urls.hasOwnProperty(url)) {
			eval('this._' + url + '_url = function(params) {return this._url_for("' + url + '", params);}');
		}
	}
      
    
    if (options.checkNew) this.build_attributes(options.asynchronous, options.checkNewCallback)
  },
  create : function(attributes, callback) {
    var base = new this(attributes);
    
    createWork = MVC.Function.bind(function(saved) {
      return callback(base);
    },this);
    
    if (callback) {
      return base.save(createWork);
    }
    else {
      base.save();
      return base;
    }
  },
  
  // If not given an ID, destroys itself, if it has an ID.  If given an ID, destroys that record.
  // You can call destroy(), destroy(1), destroy(callback()), or destroy(1, callback()), and it works as you expect.
  destroy : function(id, callback) {
    if (!id) return false;
    
    var destroyWork = MVC.Function.bind( function(transport) {
      if (transport.status == 200)
        return true;
      else
        return false;
    }, this);
    
    return this._request(destroyWork, this._destroy_url(id), {method: "delete"}, callback);
  },
  
  find : function(id, params, callback) {
    // allow a params hash to be omitted and a callback function given directly
    if (!callback && typeof(params) == "function") {
      callback = params;
      params = null;
    }
    
    var findAllWork = MVC.Function.bind(function(doc) {
      if (!doc) return null;
      
      var collection = this._loadCollection(doc);
      
      if (!collection) return null;

      // This is better than requiring the controller to support a "limit" parameter
      if (id == "first")
        return collection[0];

      return collection;
    }, this);

    var findOneWork = MVC.Function.bind(function(doc) {
      if (!doc) return null;
      
      var base = this._loadSingle(doc);
      
      // if there were no properties, it was probably not actually loaded
      if (!base || base._properties.length == 0) return null;

      // even if the ID didn't come back, we obviously knew the ID to search with, so set it
      if (!MVC.Array.include(base._properties,"id")) base._setAttribute("id", parseInt(id));

      return base;
    },this);

    if (id == "first" || id == "all") {
      var url = this._list_url(params);
      return this._requestAndParse(this._format, findAllWork, url, {remote: this._remote}, callback);
    }
    else {
      if (isNaN(parseInt(id))) return null;
      if (!params) params = {};
      params.id = id;
      
      var url = this._show_url(params);
      return this._requestAndParse(this._format, findOneWork, url, {remote: this._remote}, callback);
    }
  },
  
  update : function(attributes, callback){
  	var base = new this(attributes);

	updateWork = MVC.Function.bind( function(saved) {
      return callback(base);
    }, this);
    
    if (callback) {
      return base.save(updateWork);
    }
    else {
      base.save();
      return base;
    }
  },
  
   _build : function(attributes) {
    return new this(attributes);
  },
  
  // used in init
  _build_attributes: function( async, callback){
    if(async == null) async = true;
    
    var buildWork = MVC.Function.bind(function(doc) {
	  this.columns_hash = this._format == 'json' ? doc : this._attributesFromTree(doc[this._singular_xml]);

	  this._attributes = {};
	  for(var col_name in this.columns_hash) {
	  	if(this.columns_hash.hasOwnProperty(col_name))  var column = this.columns_hash[col_name];
	  	this._attributes[col_name] = column.default_value;
	  }
    }, this);
	
    this._requestAndParse(this._format, buildWork, this._new_instance_url(), {asynchronous: async, remote: this._remote}, callback);
  },
  
  // Helper to aid in handling either async or synchronous requests
  _request : function(callback, url, options, user_callback) {
    if(this.use_fixture != null) options.use_fixture = this.use_fixture;
	if (user_callback) {
      options.asynchronous = true;
      // if an options hash was given instead of a callback
      if (typeof(user_callback) == "object") {
        for (var x in user_callback)
			if(user_callback.hasOwnProperty(x)) 
        		options[x] = user_callback[x];
        user_callback = options.onComplete;
      }
    }
    else
      user_callback = function(arg){return arg;};
    
    if (options.asynchronous) {
      options.onComplete = function(transport, json) {
	  	user_callback(callback(transport), json);
	  };
      return new MVC.Ajax(url, options).transport;
    }
    else
    {
      options.asynchronous = false; // Make sure it's set, to avoid being overridden.
      return callback(new MVC.Ajax(url, options).transport);
    }
  },
  
  _interpolate: function(string, params) {
    var result = string;
    for(var val in params) {
      if(params.hasOwnProperty(val)) {
		  var re = new RegExp(":" + val, "g");
	      if(result.match(re))
	      {
	        result = result.replace(re, params[val]);
	        delete params[val];
	      }
	  }
    }
    return result;
  },
  
  _url_for : function(action, params) {
  	params = params || {};
    if (!this._urls[action]) return "";
    // if an integer is sent, it's assumed just the ID is a parameter
    if (typeof(params) == "number") params = {id: params};
    //if (params) params = $H(params);
	// uncomment this if there is caching in IE
	//params['sid'] = Math.random();
	if(this._remote) {
		switch(action) {
			case 'list': 
				var method = 'GET';
				break;
			case 'show': 
				var method = 'GET';
				break;
			case 'create': 
				var method = 'POST';
				break;
			case 'update': 
				var method = 'PUT';
				break;
			case 'destroy': 
				var method = 'DELETE';
				break;
		}
    	params.method = method;
	}
    var url = this._interpolate(this._prefix + this._urls[action], params);
	var qs = MVC.Object.to_query_string(params);
    return url + (params && qs != '' ? "?" + qs : "");
  },
  
  _default_urls : function(options) {
    urls = {
      show : "/" + options.plural + "/:id." + options.format,
      list : "/" + options.plural + "." + options.format,
      new_instance : "/" + options.plural + "/new." + options.format
    };
    urls.index = urls.create = urls.list;
    urls.destroy = urls.update = urls.show;
    
    return urls;
  },
  
  
  _requestAndParse : function(format, callback, url, options, user_callback) { 
    var parse_and_callback = format.toLowerCase() == "json" ? 
    	function(transport) {
	        if (transport.status == 500) return callback(null);
	        eval("var attributes = " + transport.responseText); // hashes need this kind of eval
	        return callback(attributes);
	    }:
		function(transport) {
        	return transport.status == 500 ? callback(null) : callback(MVC.Tree.parseXML(transport.responseText));
      	};
	if (!(options.postBody || options.parameters || options.postbody || options.method == "post")) {
      options.method = "get";
    }
    return this._request(parse_and_callback, url, options, user_callback);
  },
  
  
  // Converts a JSON hash returns from ActiveRecord::Base#to_json into a hash of attribute values
  // Does not handle associations, as AR's #to_json doesn't either
  // Also, JSON doesn't include room to store types, so little auto-transforming is done here (just on 'id')
  _attributesFromJSON : function(json) {
    if (!json || json.constructor != Object) return false;
    if (json.attributes) json = json.attributes;
    
    var attributes = {};
    var i = 0;
    for (var attr in json) {
      if(json.hasOwnProperty(attr)) {
		  var value = json[attr];
	      if (attr == "id")
	        value = parseInt(value);
	      else if (attr.match(/(created_at|created_on|updated_at|updated_on)/)) {
	        var date = Date.parse(value);
	        if (date && !isNaN(date)) value = date;
	      }
	      attributes[attr] = value;
	      i += 1;
	  }
    }
    if (i == 0) return false; // empty hashes should just return false
    
    return attributes;
  },
  
  // Converts the XML tree returned from a single object into a hash of attribute values
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
          var date = Date.parse(value);
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
            var base = eval(name + "._build(this._attributesFromTree(single))");
            value.push(base);
          },this));
        }
        // has_one or belongs_to
        else {
          singular = attr;
          var name = MVC.String.classize(capitalize);
          
          // if the association hasn't been modeled, do a default modeling here
          // hosted object's prefix and format are inherited, singular is set from the XML
          if (eval("typeof(" + name + ")") == "undefined") {
            MVC.Resource.model(name, {prefix: this._prefix, singular: singular, format: this._format});
          }
          value = eval(name + "._build(this._attributesFromTree(value))");
        }
      }
      
      // transform attribute name if needed
      attribute = attr.replace(/-/g, "_");
      attributes[attribute] = value;
    }
    
    return attributes;
  },
  
  _loadSingle : function(doc) {
    var attributes;
    if (this._format == "json")
      attributes = this._attributesFromJSON(doc);
    else
      attributes = this._attributesFromTree(doc[this._singular_xml]);
    
    return this._build(attributes);
  },
  
  _loadCollection : function(doc) {
    var collection;
    if (this._format == "json") {
	  if(!doc.map)
	  	doc = $H(doc);
      collection = doc.map( MVC.Function.bind( function(item) {
        return this._build(this._attributesFromJSON(item));
      }, this));
    }
    else {
      // if only one result, wrap it in an array
	  if (!MVC.Model.elementHasMany(doc[this._plural_xml])){
	  	if(!doc[this._plural_xml])
			return [];
		doc[this._plural_xml][this._singular_xml] = [doc[this._plural_xml][this._singular_xml]];
	  }
      
      collection = [];
	  var attrs = doc[this._plural_xml][this._singular_xml];
	  for(var i = 0; i < attrs.length; i++){
	  	collection.push(this._build(this._attributesFromTree(attrs[i])))
	  }
    }
    return collection;
  }
};

/*================================================
 * 
 * 
 */



MVC.Model.InstanceFunctions =  MVC.Class.extend({
  init : function(attributes) {
    // Initialize no attributes, no associations
    this._properties = [];
    this._associations = [];
    
    this.set_attributes(this.Class._attributes || {});
    this.set_attributes(attributes);

    // Initialize with no errors
    this.errors = [];
    
    // Establish custom URL helpers
    for (var url in this.Class._urls){
		if(this.Class._urls.hasOwnProperty(url)) eval('this._' + url + '_url = function(params) {return this._url_for("' + url + '", params);}');
	}
     
  },
  
  // mimics ActiveRecord's behavior of omitting associations, but keeping foreign keys
  attributes : function(include_associations) {
    var attributes = {};
    for (var i=0; i<this._properties.length; i++) attributes[this._properties[i]] = this[this._properties[i]];
    if (include_associations) {
      for (var i=0; i<this._associations.length; i++) attributes[this._associations[i]] = this[this._associations[i]];
    }
    return attributes;
  },
  
  
  // If not given an ID, destroys itself, if it has an ID.  If given an ID, destroys that record.
  // You can call destroy(), destroy(1), destroy(callback()), or destroy(1, callback()), and it works as you expect.
  destroy : function(callback) {
    var id = this.id;
    if (!id) return false;
    
    var destroyWork = MVC.Function.bind(function(transport) {
      if (transport.status == 200) {
          this.id = null;
          return true;
      }
      else
          return false;
    }, this);
    
    return this.Class._request(destroyWork, this._destroy_url(), {method: "delete"}, callback);
  },

  new_record : function() {return !(this.id);},
  
  reload : function(callback) {
    var reloadWork = MVC.Function.bind(function(copy) {
      this._resetAttributes(copy.attributes(true));
  	  return callback ? callback(this) : this;
    }, this);
    
    if (this.id) 
        return callback ? this.Class.find(this.id, {}, reloadWork) : reloadWork(this.Class.find(this.id));
    else
      return this;
  },
  
  save : function(callback) {
    var saveWork = MVC.Function.bind(function(transport) {
      var saved = false;
      if (/\w+/.test(transport.responseText)) {
        var errors = this._errorsFrom(transport.responseText);
        if (errors)
          this._setErrors(errors);
        else {
          var attributes;
          if (this.Class._format == "json") {
            attributes = this._attributesFromJSON(transport.responseText);
          }
          else {
            var doc = MVC.Tree.parseXML(transport.responseText);
            if (doc && doc[this.Class._singular_xml])
              attributes = this._attributesFromTree(doc[this.Class._singular_xml]);
          }
          if (attributes)
            this._resetAttributes(attributes);
        }
      }

      // Get ID from the location header if it's there
      if (this.new_record() && transport.status == 201) {
	  	loc = transport.responseText;
	  	try{loc = transport.getResponseHeader("location");}catch(e){};
        if (loc) {
          //todo check this with prototype
		  var mtcs = loc.match(/\/[^\/]*?(\w+)?$/);
		  
		  if(mtcs){
		  	id = parseInt(mtcs[1]);
			if (!isNaN(id))
            	this._setProperty("id", id);
		  }
        }
      }
	  
	  //return (this.errors.length == 0);
      return (transport.status >= 200 && transport.status < 300 && this.errors.length == 0);
    }, this);
  
    // reset errors
    this._setErrors([]);
  
    var url = null;
    var method = null;
    
    // collect params
    var params = {};
	
	
	for(var i = 0; i < this._properties.length; i++){
		var value = this._properties[i];
	    params[this.Class._singular + "[" + value + "]"] = this[value];
	}

	
    if (this.Class._remote && this.Class._format == "json" && callback)
		var remote = true;
		
    // distinguish between create and update
    if (this.new_record()) {
      url = this._create_url();
	  //if(remote)
	  //    url = this._create_url(params);
      method = "post";
    }
    else {
      url = this._update_url();
	  //if(remote)
	  //   url = this._update_url(params);
      method = "put";
    }
    
    

    // send the request
    return this.Class._request(saveWork, url, {parameters: params, method: method}, callback);
  },
  
  
  set_attributes : function(attributes)
  {
    for(key in attributes){ if(attributes.hasOwnProperty(key)) this._setAttribute(key, attributes[key]);}
    return attributes;
  },
  
  update_attributes : function(attributes, callback)
  {
    this.set_attributes(attributes);
    return this.save(callback);
  },
  
  
  valid : function() {
  	return  this.errors.length == 0;
  },
  
    
  /*
    Internal methods.
  */
  
  _attributesFromJSON: function()
  {
    return this.Class._attributesFromJSON.apply(this.Class, arguments);
  },
  
  _attributesFromTree: function()
  {
    return this.Class._attributesFromTree.apply(this.Class, arguments);
  },
  
  _errorsFrom : function(raw) {
    if (this.Class._format == "json") {
      return this._errorsFromJSON(raw);
    }
    else
      return this._errorsFromXML(raw);
  },
  
    // Pulls errors from JSON
  _errorsFromJSON : function(json) {
    try {
      json = eval(json); // okay for arrays
    } catch(e) {
      return false;
    }
    
    if (!(json && json.constructor == Array && json[0] && json[0].constructor == Array)) return false;
    
	var errors = [];
	for(var j = 0 ; j < json.length; j++){
		errors.push(json[j])
	}
	return errors;
  },
  
  // Pulls errors from XML
  _errorsFromXML : function(xml) {
    if (!xml) return false;
    var doc = MVC.Tree.parseXML(xml);

    if (doc && doc.errors) {
      var errors = [];
      if (typeof(doc.errors.error) == "string")
        doc.errors.error = [doc.errors.error];
      
      doc.errors.error.each(function(value, index) {
        errors.push(value);
      });
      
      return errors;
    }
    else return false;
  },
  
  // Sets errors with an array.  Could be extended at some point to include breaking error messages into pairs (attribute, msg).
  _setErrors : function(errors) {
    this.errors = errors;
  },
  
  
  // Sets all attributes and associations at once
  // Deciding between the two on whether the attribute is a complex object or a scalar
  _resetAttributes : function(attributes) {
    this._clear();
    for (var attr in attributes){
		if(attributes.hasOwnProperty(attr)){
			this._setAttribute(attr, attributes[attr]);
		}
	}
      
  },
  
  _setAttribute : function(attribute, value) {
    if (value && typeof(value) == "object" && value.constructor != Date)
      this._setAssociation(attribute, value);
    else
      this._setProperty(attribute, value);
  },
  
  _setProperties : function(properties) {
    this._clearProperties();
    for (var prop in properties)
		if(properties.hasOwnProperty(prop)){
      		this._setProperty(prop, properties[prop]);
	    }
  },
  
  _setAssociations : function(associations) {
    this._clearAssociations();
    for (var assoc in associations)
	  if(associations.hasOwnProperty(assoc))
      	this._setAssociation(assoc, associations[assoc]);
  },
      
  _setProperty : function(property, value) {  
    this[property] = value;
    if (!(MVC.Array.include(this._properties,property)))
      this._properties.push(property);  
  },
  
  _setAssociation : function(association, value) {
    this[association] = value;
    if (!(MVC.Array.include(this._associations,association)))
      this._associations.push(association);
  },
  
  _clear : function() {
    this._clearProperties();
    this._clearAssociations();
  },
  
  _clearProperties : function() {
    for (var i=0; i<this._properties.length; i++)
      this[this._properties[i]] = null;
    this._properties = [];
  },
  
  _clearAssociations : function() {
    for (var i=0; i<this._associations.length; i++)
      this[this._associations[i]] = null;
    this._associations = [];
  },
  
  // helper URLs
  _url_for : function(action, params) {
    if (!params) params = this.id || 0;
    if (typeof(params) == "object" && !params.id)
      params.id = this.id || 0;
    
    return this.Class._url_for(action, params);
  }
});


MVC.String.underscore = function(string) {
    return string.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g,'#{1}_#{2}').replace(/([a-z\d])([A-Z])/g,'#{1}_#{2}').replace(/-/g,'_').toLowerCase();
};


MVC.Model.elementHasMany = function(element) {
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
};




/*

This is a lighter form of ObjTree, with parts MVC doesn't use removed.
Compressed using http://dean.edwards.name/packer/.
Homepage: http://www.kawa.net/works/js/xml/objtree-e.html

XML.ObjTree -- XML source code from/to JavaScript object like E4X

Copyright (c) 2005-2006 Yusuke Kawasaki. All rights reserved.
This program is free software; you can redistribute it and/or
modify it under the Artistic license. Or whatever license I choose,
which I will do instead of keeping this documentation like it is.

*/

eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('5(p(o)==\'w\')o=v(){};o.r=v(){m 9};o.r.1i="0.1b";o.r.u.14=\'<?L 1s="1.0" 1o="1n-8" ?>\\n\';o.r.u.Y=\'-\';o.r.u.1c=\'1a/L\';o.r.u.N=v(a){6 b;5(W.U){6 c=K U();6 d=c.1r(a,"1p/L");5(!d)m;b=d.A}q 5(W.10){c=K 10(\'1k.1h\');c.1g=z;c.1e(a);b=c.A}5(!b)m;m 9.E(b)};o.r.u.1d=v(c,d,e){6 f={};y(6 g 19 d){f[g]=d[g]}5(!f.M){5(p(f.18)=="w"&&p(f.17)=="w"&&p(f.16)=="w"){f.M="15"}q{f.M="13"}}5(e){f.X=V;6 h=9;6 i=e;6 j=f.T;f.T=v(a){6 b;5(a&&a.x&&a.x.A){b=h.E(a.x.A)}q 5(a&&a.J){b=h.N(a.J)}i(b,a);5(j)j(a)}}q{f.X=z}6 k;5(p(S)!="w"&&S.I){f.1q=c;6 l=K S.I(f);5(l)k=l.12}q 5(p(Q)!="w"&&Q.I){6 l=K Q.I(c,f);5(l)k=l.12}5(e)m k;5(k&&k.x&&k.x.A){m 9.E(k.x.A)}q 5(k&&k.J){m 9.N(k.J)}};o.r.u.E=v(a){5(!a)m;9.H={};5(9.P){y(6 i=0;i<9.P.t;i++){9.H[9.P[i]]=1}}6 b=9.O(a);5(9.H[a.F]){b=[b]}5(a.B!=11){6 c={};c[a.F]=b;b=c}m b};o.r.u.O=v(a){5(a.B==7){m}5(a.B==3||a.B==4){6 b=a.G.1j(/[^\\1f-\\1l]/);5(b==1m)m z;m a.G}6 c;6 d={};5(a.D&&a.D.t){c={};y(6 i=0;i<a.D.t;i++){6 e=a.D[i].F;5(p(e)!="Z")C;6 f=a.D[i].G;5(!f)C;e=9.Y+e;5(p(d[e])=="w")d[e]=0;d[e]++;9.R(c,e,d[e],f)}}5(a.s&&a.s.t){6 g=V;5(c)g=z;y(6 i=0;i<a.s.t&&g;i++){6 h=a.s[i].B;5(h==3||h==4)C;g=z}5(g){5(!c)c="";y(6 i=0;i<a.s.t;i++){c+=a.s[i].G}}q{5(!c)c={};y(6 i=0;i<a.s.t;i++){6 e=a.s[i].F;5(p(e)!="Z")C;6 f=9.O(a.s[i]);5(f==z)C;5(p(d[e])=="w")d[e]=0;d[e]++;9.R(c,e,d[e],f)}}}m c};o.r.u.R=v(a,b,c,d){5(9.H[b]){5(c==1)a[b]=[];a[b][a[b].t]=d}q 5(c==1){a[b]=d}q 5(c==2){a[b]=[a[b],d]}q{a[b][a[b].t]=d}};',62,91,'|||||if|var|||this|||||||||||||return||XML|typeof|else|ObjTree|childNodes|length|prototype|function|undefined|responseXML|for|false|documentElement|nodeType|continue|attributes|parseDOM|nodeName|nodeValue|__force_array|Request|responseText|new|xml|method|parseXML|parseElement|force_array|MVC.Ajax|addNode|HTTP|onComplete|DOMParser|true|window|asynchronous|attr_prefix|string|ActiveXObject||transport|post|xmlDecl|get|parameters|postbody|postBody|in|text|24|overrideMimeType|parseHTTP|loadXML|x00|async|XMLDOM|VERSION|match|Microsoft|x20|null|UTF|encoding|application|uri|parseFromString|version'.split('|'),0,{}));

/*

This is a Date parsing library by Nicholas Barthelemy, packed to keep MVC.js light.
Homepage: https://svn.nbarthelemy.com/date-js/
Compressed using http://dean.edwards.name/packer/.

*/
eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('N.q.F||(N.q.F=t(a){o u.1d().F(a)});O.q.F||(O.q.F=t(a){o\'0\'.1H(a-u.K)+u});O.q.1H||(O.q.1H=t(a){v s=\'\',i=0;2k(i++<a){s+=u}o s});N.q.1j||(N.q.1j=t(){o u.1d().1j()});O.q.1j||(O.q.1j=t(){v n=u,l=n.K,i=-1;2k(i++<l){u.20(i,i+1)==0?n=n.20(1,n.K):i=l}o n});k.1m="2H 2F 2z 2y 2x 2u 2r 3q 3n 3k 3i 3d".1x(" ");k.1o="38 35 2Y 2U 2Q 2O 2M".1x(" ");k.2K="31 28 31 30 31 30 31 31 30 31 30 31".1x(" ");k.1A={2G:"%Y-%m-%d %H:%M:%S",2w:"%Y-%m-%2v%H:%M:%S%T",2s:"%a, %d %b %Y %H:%M:%S %Z",3p:"%d %b %H:%M",3o:"%B %d, %Y %H:%M"};k.3l=-1;k.3j=-2;(t(){v d=k;d["3h"]=1;d["2i"]=1t;d["2h"]=d["2i"]*19;d["2e"]=d["2h"]*19;d["P"]=d["2e"]*24;d["37"]=d["P"]*7;d["34"]=d["P"]*31;d["1q"]=d["P"]*2X;d["2W"]=d["1q"]*10;d["2R"]=d["1q"]*23;d["2P"]=d["1q"]*1t})();k.q.1D||(k.q.1D=t(){o D k(u.1k())});k.q.26||(k.q.26=t(a,b){u.1F(u.1k()+((a||k.P)*(b||1)));o u});k.q.2a||(k.q.2a=t(a,b){u.1F(u.1k()-((a||k.P)*(b||1)));o u});k.q.1Z||(k.q.1Z=t(){u.1Y(0);u.1X(0);u.1U(0);u.1T(0);o u});k.q.1I||(k.q.1I=t(a,b){C(1i a==\'1p\')a=k.1J(a);o 18.2l((u.1k()-a.1k())/(b|k.P))});k.q.1N||(k.q.1N=k.q.1I);k.q.2n||(k.q.2n=t(){d=O(u);o d.1f(-(18.1y(d.K,2)))>3&&d.1f(-(18.1y(d.K,2)))<21?"V":["V","17","16","1a","V"][18.1y(N(d)%10,4)]});k.q.1w||(k.q.1w=t(){v f=(D k(u.1h(),0,1)).1e();o 18.2t((u.1n()+(f>3?f-4:f+3))/7)});k.q.1M=t(){o u.1d().1v(/^.*? ([A-Z]{3}) [0-9]{4}.*$/,"$1").1v(/^.*?\\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\\)$/,"$1$2$3")};k.q.2p=t(){o(u.1u()>0?"-":"+")+O(18.2l(u.1u()/19)).F(2)+O(u.1u()%19,2,"0").F(2)};k.q.1n||(k.q.1n=t(){o((k.2o(u.1h(),u.1c(),u.1b()+1,0,0,0)-k.2o(u.1h(),0,1,0,0,0))/k.P)});k.q.2m||(k.q.2m=t(){v a=u.1D();a.15(a.1c()+1);a.L(0);o a.1b()});k.2j||(k.2j=t(a,b){a=(a+12)%12;C(k.1K(b)&&a==1)o 29;o k.3g.3f[a]});k.1K||(k.1K=t(a){o(((a%4)==0)&&((a%23)!=0)||((a%3e)==0))});k.q.1B||(k.q.1B=t(c){C(!u.3c())o\'&3b;\';v d=u;C(k.1A[c.2g()])c=k.1A[c.2g()];o c.1v(/\\%([3a])/g,t(a,b){39(b){E\'a\':o k.1l(d.1e()).1f(0,3);E\'A\':o k.1l(d.1e());E\'b\':o k.13(d.1c()).1f(0,3);E\'B\':o k.13(d.1c());E\'c\':o d.1d();E\'d\':o d.1b().F(2);E\'H\':o d.1G().F(2);E\'I\':o((h=d.1G()%12)?h:12).F(2);E\'j\':o d.1n().F(3);E\'m\':o(d.1c()+1).F(2);E\'M\':o d.36().F(2);E\'p\':o d.1G()<12?\'33\':\'32\';E\'S\':o d.2Z().F(2);E\'U\':o d.1w().F(2);E\'W\':R Q("%W 2V 2T 2S 25");E\'w\':o d.1e();E\'x\':o d.1r("%m/%d/%Y");E\'X\':o d.1r("%I:%M%p");E\'y\':o d.1h().1d().1f(2);E\'Y\':o d.1h();E\'T\':o d.2p();E\'Z\':o d.1M()}})});k.q.1r||(k.q.1r=k.q.1B);k.22=k.1J;k.1J=t(a){C(1i a!=\'1p\')o a;C(a.K==0||(/^\\s+$/).1E(a))o;2N(v i=0;i<k.1g.K;i++){v r=k.1g[i].J.2L(a);C(r)o k.1g[i].G(r)}o D k(k.22(a))};k.13||(k.13=t(c){v d=-1;C(1i c==\'2J\'){o k.1m[c.1c()]}2I C(1i c==\'27\'){d=c-1;C(d<0||d>11)R D Q("1s 1C 2b 2q 1W 1V 2d 1 2c 12:"+d);o k.1m[d]}v m=k.1m.1S(t(a,b){C(D 1O("^"+c,"i").1E(a)){d=b;o 1R}o 2f});C(m.K==0)R D Q("1s 1C 1p");C(m.K>1)R D Q("1Q 1C");o k.1m[d]});k.1l||(k.1l=t(c){v d=-1;C(1i c==\'27\'){d=c-1;C(d<0||d>6)R D Q("1s 1z 2b 2q 1W 1V 2d 1 2c 7");o k.1o[d]}v m=k.1o.1S(t(a,b){C(D 1O("^"+c,"i").1E(a)){d=b;o 1R}o 2f});C(m.K==0)R D Q("1s 1z 1p");C(m.K>1)R D Q("1Q 1z");o k.1o[d]});k.1g||(k.1g=[{J:/(\\d{1,2})\\/(\\d{1,2})\\/(\\d{2,4})/,G:t(a){v d=D k();d.1L(a[3]);d.L(14(a[2],10));d.15(14(a[1],10)-1);o d}},{J:/(\\d{4})(?:-?(\\d{2})(?:-?(\\d{2})(?:[T ](\\d{2})(?::?(\\d{2})(?::?(\\d{2})(?:\\.(\\d+))?)?)?(?:Z|(?:([-+])(\\d{2})(?::?(\\d{2}))?)?)?)?)?)?/,G:t(a){v b=0;v d=D k(a[1],0,1);C(a[2])d.15(a[2]-1);C(a[3])d.L(a[3]);C(a[4])d.1Y(a[4]);C(a[5])d.1X(a[5]);C(a[6])d.1U(a[6]);C(a[7])d.1T(N("0."+a[7])*1t);C(a[9]){b=(N(a[9])*19)+N(a[10]);b*=((a[8]==\'-\')?1:-1)}b-=d.1u();1P=(N(d)+(b*19*1t));d.1F(N(1P));o d}},{J:/^2E/i,G:t(){o D k()}},{J:/^2D/i,G:t(){v d=D k();d.L(d.1b()+1);o d}},{J:/^2C/i,G:t(){v d=D k();d.L(d.1b()-1);o d}},{J:/^(\\d{1,2})(17|16|1a|V)?$/i,G:t(a){v d=D k();d.L(14(a[1],10));o d}},{J:/^(\\d{1,2})(?:17|16|1a|V)? (\\w+)$/i,G:t(a){v d=D k();d.L(14(a[1],10));d.15(k.13(a[2]));o d}},{J:/^(\\d{1,2})(?:17|16|1a|V)? (\\w+),? (\\d{4})$/i,G:t(a){v d=D k();d.L(14(a[1],10));d.15(k.13(a[2]));d.1L(a[3]);o d}},{J:/^(\\w+) (\\d{1,2})(?:17|16|1a|V)?$/i,G:t(a){v d=D k();d.L(14(a[2],10));d.15(k.13(a[1]));o d}},{J:/^(\\w+) (\\d{1,2})(?:17|16|1a|V)?,? (\\d{4})$/i,G:t(a){v d=D k();d.L(14(a[2],10));d.15(k.13(a[1]));d.1L(a[3]);o d}},{J:/^3m (\\w+)$/i,G:t(a){v d=D k();v b=d.1e();v c=k.1l(a[1]);v e=c-b;C(c<=b){e+=7}d.L(d.1b()+e);o d}},{J:/^2B (\\w+)$/i,G:t(a){R D Q("2A 25 3r");}}]);',62,214,'||||||||||||||||||||Date||||return||prototype|||function|this|var|||||||if|new|case|zf|handler|||re|length|setDate||Number|String|DAY|Error|throw||||th||||||||parseMonth|parseInt|setMonth|nd|st|Math|60|rd|getDate|getMonth|toString|getDay|substr|__PARSE_PATTERNS|getFullYear|typeof|rz|getTime|parseDay|MONTH_NAMES|getDayOfYear|DAY_NAMES|string|YEAR|format|Invalid|1000|getTimezoneOffset|replace|getWeek|split|min|day|FORMATS|strftime|month|clone|test|setTime|getHours|str|diff|parse|isLeapYear|setYear|getTimezone|compare|RegExp|time|Ambiguous|true|findAll|setMilliseconds|setSeconds|be|must|setMinutes|setHours|clearTime|substring||__native_parse|100||yet|increment|number|||decrement|index|and|between|HOUR|false|toLowerCase|MINUTE|SECOND|daysInMonth|while|floor|lastDayOfMonth|getOrdinal|UTC|getGMTOffset|value|July|rfc822|round|June|dT|iso8601|May|April|March|Not|last|yes|tom|tod|February|db|January|else|object|DAYS_PER_MONTH|exec|Saturday|for|Friday|MILLENNIUM|Thursday|CENTURY|supported|not|Wednesday|is|DECADE|365|Tuesday|getSeconds|||PM|AM|MONTH|Monday|getMinutes|WEEK|Sunday|switch|aAbBcdHIjmMpSUWwxXyYTZ|nbsp|valueOf|December|400|DAYS_IN_MONTH|Convensions|MILLISECOND|November|ERA|October|EPOCH|next|September|longd|shortd|August|implemented'.split('|'),0,{}));


if(!MVC._no_conflict){
	Model = MVC.Model;
}

