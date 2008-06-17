MVC.Controller.scaffold = function(){
    //go through list of prototype functions, if one doesn't exist copy
    if(!this.className) return;
    
    var class_name = MVC.String.singularize( MVC.String.classize(this.className)  );
    this.scaffold_model = window[class_name];
    this.singular_name = MVC.String.singularize(this.className);
    for(var action_name in MVC.Controller.scaffold.functions){
        if(this.prototype[action_name]) continue;
        this.prototype[action_name] = MVC.Controller.scaffold.functions[action_name]
    }
    if(! window[class_name+'ViewHelper']   )
        this.scaffold_view_helper = window[class_name+'ViewHelper'] = MVC.ModelViewHelper.extend(this.singular_name);
    else{
        this.scaffold_view_helper = window[class_name+'ViewHelper']
    }
};


MVC.Controller.scaffold.functions = {
    load: function(params){
        //we should make sure the element exists
        if(!MVC.$E(this.controller_name)){
            var div = document.createElement('div')
            div.id = this.controller_name;
            document.body.appendChild(div);
        }
        this.Class.scaffold_model.find('all', {} , this.continue_to('list'))
    },
    list: function(objects){
        this.singular_name = this.Class.singular_name;
        this[this.controller_name] = objects;
        this.objects = objects;
        this.render({to: this.controller_name, plugin: 'controller_scaffold/display', action: this.controller_name});
    },
    '# form submit' : function(params){
        params.event.kill();
        this.Class.scaffold_model.create( params.form_params()[this.Class.singular_name], this.continue_to('created') );
    },
    created: function(object){
		if(object.errors.length > 0){
            
            object.View().show_errors();
            
		}else{
            
            this.Class.scaffold_model.View().clear();
            object.View().clear_errors();
            this[this.controller_name] = [object];
            this.objects = [object];
            this.singular_name = this.Class.singular_name;
            this.render({bottom: 'recipe_list', plugin: 'controller_scaffold/list', action: 'list'});//?
            
		}
    },
    '.delete click' : function(params){
        this[this.Class.singular_name] = params.object_data();
        if(confirm("Are you sure you want to delete"))
            this[this.Class.singular_name].destroy(this.continue_to('destroyed'));
    },
    '.edit click' : function(params){
        this[this.Class.singular_name] = params.object_data();
        this.singular_name = this.Class.singular_name;
        this.render({to: this[this.Class.singular_name].View().element_id(), action: 'edit', plugin: 'controller_scaffold/edit'}); //!
    },
    '.cancel click': function(params){
        this.show(params.object_data());
    },
    '.save click': function(params){
        this[this.Class.singular_name] = params.object_data();
        var attrs = this[this.Class.singular_name].View().edit_values(); 
        this[this.Class.singular_name].update_attributes( attrs, this.continue_to('show') );
    },
    show: function(object){
        this[this.Class.singular_name] = object;
        this.singular_name = this.Class.singular_name;
        this.render({to: this[this.Class.singular_name].View().element_id(), action: 'show', plugin: 'controller_scaffold/show'} );
    },
    destroyed: function(destroyed){
        if(destroyed)
            this[this.Class.singular_name].View().destroy();   
    }
}