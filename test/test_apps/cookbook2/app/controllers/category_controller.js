CategoryController  = Class.create(Junction.Controller, {

    list : function(params) {
		this.categories = Category.find('all');
    },
    
    show : function(params) {
        this.category = Category.find(params.id);
    },
    
    edit : function(params) {
	this.recipe = Recipe.find(params.id);
        this.categories = Category.find(params.id);
    },
    
    create : function(params) {
        var category = Category.create(params['Category']);
        this.redirect_to({action: 'list'});
    },
    
    update : function(params) {
        var category = Category.update(params.id, params['Category']);
        this.redirect_to({action: 'show', id: params.id});
    },
    
    destroy : function(params) {
        var category = Category.destroy(params.id);
        this.redirect_to({action: 'list'});
    }

});