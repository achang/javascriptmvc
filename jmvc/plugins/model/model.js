MVC.Model = MVC.Class.extend(
{
    //determines which find to pick, calls find_all or find_one which should be overwritten
    
    find : function(id, params, callback, error_callback){
        if(!params)  params = {};
        if(typeof params == 'function') {
            callback = params;
            params = {};
        }
        if(id == 'all'){
            return this.create_many_as_existing( this.find_all(params, callback, error_callback)  );
        }else{
            if(!params[this.id] && id != 'first')
                params[this.id] = id;
            return this.create_as_existing( this.find_one(id == 'first'? null : params, callback) );
        }
    },
    // Called after creating something
    create_as_existing : function(attributes){
        if(!attributes) return null;
        if(attributes.attributes) attributes = attributes.attributes;
        var inst = new this(attributes);
        inst.is_new_record = this.new_record_func;
        return inst;
    },
    // Called after creating many
    create_many_as_existing : function(instances){
        if(!instances) return null;
        var res = [];
        for(var i =0 ; i < instances.length; i++)
            res.push( this.create_as_existing(instances[i]) );  
        return res;
    },
    id : 'id', //if null, maybe treat as an array?
    new_record_func : function(){return false;},
    validations: [],
    has_many: function(){
        for(var i=0; i< arguments.length; i++){
            this._associations.push(arguments[i]);
        }
    },
    belong_to: function(){
        for(var i=0; i< arguments.length; i++){
            this._associations.push(arguments[i]);
        }
    },
    _associations: [],
    from_html: function(element_or_id){
        var el =MVC.$E(element_or_id);
        var el_class = window[ MVC.String.classize(el.getAttribute('type')) ];
        
        if(! el_class) return null;
        //get data here
        var attributes = {};
        attributes[el_class.id] = this.element_id_to_id(el.id);
        return el_class.create_as_existing(attributes);
    },
    element_id_to_id: function(element_id){
        var re = new RegExp(this.className+'_', "");
        return element_id.replace(re, '');
    },
    add_attribute : function(property, type){
        if(! this.attributes[property])
            this.attributes[property] = type;
    },
    attributes: {}
},
{   //Prototype functions
    init : function(attributes){
        //this._properties = [];
        this.errors = [];
        
        this.set_attributes(this.Class._attributes || {});
        this.set_attributes(attributes);
    },
    setup : function(){
        
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
    validate : function(){
        //run validate function and any error functions  
        
    },
    _setAttribute : function(attribute, value) {
        if (value && typeof(value) == "object" && value.constructor != Date)
          this._setAssociation(attribute, value);
        else
          this._setProperty(attribute, value);
    },
    _setProperty : function(property, value) {  
        this[property] = MVC.Array.include(['created_at','updated_at'], property) ? MVC.Date.parse(value) :  value;

        //if (!(MVC.Array.include(this._properties,property))) this._properties.push(property);  
        
        this.Class.add_attribute(property, MVC.Object.guess_type(value)  );
    },
    _setAssociation : function(association, values) {
        this[association] = function(){
            if(! MVC.String.is_singular(association ) ) association = MVC.String.singularize(association);
            
            var associated_class = window[MVC.String.capitalize(association)];
            if(!associated_class) return values;
            //alert(values.length)
            return associated_class.create_many_as_existing(values);
        }
        
    },
    attributes : function() {
        var attributes = {};
        var cas = this.Class.attributes;
        for(var attr in cas){
            if(cas.hasOwnProperty(attr) ) attributes[attr] = this[attr];
        }
        //for (var i=0; i<this.attributes.length; i++) attributes[this._properties[i]] = this[this._properties[i]];
        return attributes;
    },
    is_new_record : function(){ return true;},
    save: function(callback){
        var result;
        this.errors = [];
        this.validate();
        if(!this.valid()) return false;
        
        if(this.is_new_record())
            result = this.Class.create(this.attributes(), callback);
        else
            result = this.Class.update(this[this.Class.id], this.attributes(), callback);
        this.is_new_record = this.Class.new_record_func;
        return true;
    },
    destroy : function(callback){
        this.Class.destroy(this[this.Class.id], callback);
    },
    add_errors : function(errors){
        if(errors) this.errors = this.errors.concat(errors);
    },
    _resetAttributes : function(attributes) {
        this._clear();
        /*for (var attr in attributes){
    		if(attributes.hasOwnProperty(attr)){
    			this._setAttribute(attr, attributes[attr]);
    		}
    	}*/
    },
    _clear : function() {
        var cas = this.Class.attributes;
        for(var attr in cas){
            if(cas.hasOwnProperty(attr) ) this[attr] = null;
        }
    }
});


MVC.Object.guess_type = function(object){
    if(typeof object != 'string'){
        if(object == null) return typeof object;
        if( object.constructor == Date ) return 'date';
        if(object.constructor == Array) return 'array';
        return typeof object;
    }
    //check if true or false
    if(object == 'true' || object == 'false') return 'boolean';
    if(!isNaN(object)) return 'number'
    return typeof object;
}