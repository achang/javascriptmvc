RecipeController  = Class.create(JMVC.Controller, {

    list : function(params) {
		this.recipes = Recipe.find('all');
    },
    
    show : function(params) {
        this.recipe = Recipe.find(params.id);
    },
	
	new_instance : function(params) {
        this.categories = Category.find('all')
	},
    
    edit : function(params) {
        this.recipe = Recipe.find(params.id);
        this.categories = Category.find('all')
    },
    
    create : function(params) {
        var recipe = Recipe.create(params['Recipe']);
        this.redirect_to({action: 'list'});
    },
    
    update : function(params) {
        var recipe = Recipe.update(params.id, params['Recipe']);
        this.redirect_to({action: 'show', id: params.id});
    },
    
    destroy : function(params) {
        var recipe = Recipe.destroy(params.id);
        this.redirect_to({action: 'list'});
    }

});