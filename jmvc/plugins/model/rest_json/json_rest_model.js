/**
 * Model for accessing JSON rest resources.
 * 
 * Examples: recipes.json
 *    [ 
 *       {attributes: 
 *           {title: "Chicken Soup", id: "48", 
 *            instructions: "Call Mom!\nBring chicken"}  }, 
 *       {attributes: 
 *           {title: "Toast", id: "49", 
 *            instructions: "Heat Bread"}  } ]
 * 
 */
MVC.JSONRestModel = MVC.AjaxModel.extend(
{
    init: function(){
        if(!this.className) return;
        this.plural_name = MVC.String.pluralize(this.className);
        this.singular_name =  this.className;
        this._super();
    },
    json_from_string : function(json_string){
        return eval(json_string); //overwrite this function if you don't want to eval js
    },
    find_all_get_url : function(){ return '/'+this.plural_name+'.json'},
    find_all_get_success : function(transport){  //error is either success, complete or error
        var data = this.json_from_string(transport.responseText);
        var collection = [];
    	for(var i = 0; i < data.length; i++){
    		var unit = data[i];
            var inst = this.create_as_existing( unit.attributes  );
            if(unit.errors) inst.add_errors(unit.errors);
            collection.push(inst);
    	}
        return collection;
    },
    create_request: function(attributes){
        var instance = new this(attributes);
        instance.validate()
        if( !instance.valid() ) return instance;
        var params = {};
        params[this.singular_name] = attributes;
        this.request('/'+this.plural_name+'.json', params, {method: 'post'}, instance );
        return instance;
    },
    create_success: function(transport, callback, instance){
          if (/\w+/.test(transport.responseText)) {
            var errors = this.json_from_string(transport.responseText);
            if (errors) instance.add_errors(errors);
          }
    
          // Get ID from the location header if it's there
          if (instance.is_new_record() && transport.status == 201) {
    	  	var id = this.get_id(transport);
            if (!isNaN(id)) instance._setProperty("id", id );
          }
    	  return instance;
    },
    update_request: function(id, attributes){
        delete attributes.id
        var params = {};
        params[this.singular_name] = attributes;
        var instance = this.create_as_existing(attributes);
        instance.id = id;
        
        instance.validate()
        if( !instance.valid() ) return instance;
        
        this.request('/'+this.plural_name+'/'+id+'.json', params, {method: 'put'}, instance );
    },
    update_success: function(transport, callback, instance){
        if(/\w+/.test(transport.responseText)) {
            var errors = this.json_from_string(transport.responseText);
            if (errors) instance.add_errors(errors);
        }
        return instance;
    },
    destroy_request: function(id){
        this.request('/'+this.plural_name+'/'+id+'.json', {}, {method: 'delete'} );
    },
    destroy_error: function(){ return false;},
    destroy_success: function(transport){ return transport.status == 200}
},
{
    
})