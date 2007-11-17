JunctionTest = {
	APPLICATION_NAME : 'cookbook2',
	TEST_DESCRIPTION : 'This test loads up a Junction application with associations, and makes sure the associations are created correctly.',
	perform_test : function() {
	  new Test.Unit.Runner({
	  	
		setup: function() {
		},
		teardown: function() {
		},
	    test_app_startup: function() { with(this) {
			assertNotNull(Recipe)
			assertNotNull(RecipeController)
			assertNotNull(Category)
			assertNotNull(CategoryController)
			assertNull($('not_here'))
			assertNotNull($('main'))
			$('main').hide();
	    }},
	    test_associations: function() { with(this) {
			var category = Category.create({name: 'dessert'});
			var recipe = Recipe.create({title: 'fudge', category_id: category.id});
			assertNotNull(recipe.category());
			var category_recipes = category.recipes();
			assertNotNull(category_recipes);
			assertEqual(category_recipes.length, 1);
			assertEqual(category_recipes[0].title, 'fudge');
			category.destroy();
			recipe.destroy();
	    }}
	    
	  }, "testlog");
  }
}