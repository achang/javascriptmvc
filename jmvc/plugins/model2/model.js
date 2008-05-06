MVC.Model = MVC.Class.extend(
{
    find : function(id, params, callback){
        if(id == 'all'){
            return this.create_many_as_existing( this.find_all(params, callback)  );
        }else{
            if(!params[this.id])
                params[this.id] = id
            return this.create_as_existing( this.find_one(params, callback) );
        }
    },
    create_as_existing : function(attributes){
        if(!attributes) return null;
        var inst = new this(attributes);
        inst.is_new_record = this.new_record_func();
        return inst;
    },
    create_many_as_existing : function(instances){
        if(!instances) return null;
        var res = [];
        for(var i =0 ; i < instances.length; i++)
            res.push( this.create_as_existing(instances[i]) );  
        return res;
    },
    id : 'id', //if null, maybe treat as an array?
    new_record_func : function(){return false;}

},
{
    init : function(attributes){
        this._properties = [];
        this._associations = [];
        this.errors = [];
        this.set_attributes(this.Class._attributes || {});
        this.set_attributes(attributes);
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
    _setAttribute : function(attribute, value) {
        if (value && typeof(value) == "object" && value.constructor != Date)
          this._setAssociation(attribute, value);
        else
          this._setProperty(attribute, value);
    },
    _setProperty : function(property, value) {  
        this[property] = value;
        if (!(MVC.Array.include(this._properties,property)))
          this._properties.push(property);  
    },
    attributes : function() {
        var attributes = {};
        for (var i=0; i<this._properties.length; i++) attributes[this._properties[i]] = this[this._properties[i]];
        return attributes;
    },
    is_new_record : function(){ return true;},
    save: function(){
        var result;
        if(this.is_new_record())
            result = this.Class.create(this.attributes());
        else
            result = this.Class.update(this[this.Class.id], this.attributes());
        this.is_new_record = this.Class.new_record_func;
        return true;
    },
    destroy : function(){
        this.Class.destroy(this[this.Class.id])
    }
});