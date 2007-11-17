JunctionTest = {
	APPLICATION_NAME : 'cookbook2',
	TEST_DESCRIPTION : 'This test loads up a Junction application and tests that everything loaded correctly.  It also runs a test action and tests if the page was correctly rendered.',
	perform_test : function() {
	  new Test.Unit.Runner({
	  	
		setup: function() {
		},
		teardown: function() {
			Recipe.destroy_all();
		},
	    test_create: function() { with(this) {
			Recipe.create({title: 'Hot Dogs'})
			Recipe.create({title: 'Sushi'})
			var recipes = Recipe.find('all')
			assertEqual(recipes.length, 2)
	    }},
	    test_destroy: function() { with(this) {
			var recipe = Recipe.create({title: 'Hot Dogs'})
			var recipes = Recipe.find('all')
			assertEqual(recipes.length, 1)
			recipe.destroy();
			var recipes = Recipe.find('all')
			assertEqual(recipes.length, 0)
	    }},
	    test_new: function() { with(this) {
			var recipe = new Recipe({title: 'Sushi'})
			var recipes = Recipe.find('all')
			assertEqual(recipes.length, 0)
			assert(recipe.is_new_record())
			var another_recipe = new Recipe(function(recipe) {
				recipe.title = 'Cheese Fries';
				recipe.description = 'I am a recipe';
			});
			assertEqual(another_recipe.title, 'Cheese Fries')
			assertEqual(another_recipe.description, 'I am a recipe')
			assert(another_recipe.is_new_record())
	    }},
	    test_save_insert: function() { with(this) {
			var recipe = new Recipe({title: 'Sushi'})
			var new_id = recipe.save();
			assert(new_id > 0);
			var recipes = Recipe.find('all');
			assertEqual(recipes.length, 1);
	    }},
	    test_save_update: function() { with(this) {
			var recipe = Recipe.create({title: 'Hot Dogs'});
			recipe.title = 'Turkey';
			recipe.save();
			assertEqual(recipe.title, 'Turkey');
			var same_recipe = Recipe.find(recipe.id);
			assertEqual(recipe.title, 'Turkey');
	    }},
	    test_attributes: function() { with(this) {
			var recipe = Recipe.create({title: 'Hot Dogs'});
			var attributes = recipe.attributes();
			assertEqual(attributes.title, 'Hot Dogs');
			assertNull(attributes.description);
	    }},
	    test_update_attributes: function() { with(this) {
			var recipe = Recipe.create({title: 'Hot Dogs'});
			var attributes = recipe.update_attributes({title: 'Chilli', description: 'Very hot'});
			assertEqual(attributes.title, 'Chilli');
			var same_recipe = Recipe.find(recipe.id);
			assertEqual(same_recipe.description, 'Very hot');
	    }},
	    test_to_string: function() { with(this) {
			var test = new Recipe({title: 'test'})
			assertEqual(test.toString(),'#<Recipe:No ID>')
	    }}
	    
	  }, "testlog");
	}
}