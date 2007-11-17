JMVCTest = {
	APPLICATION_NAME : 'cookbook2',
	TEST_DESCRIPTION : 'This test loads up a JMVC application with associations, and makes sure the associations are created correctly.',
	perform_test : function() {
	  new Test.Unit.Runner({
	  	
		setup: function() {
		},
		teardown: function() {
		},
	    test_app_startup: function() { with(this) {
			assertNotNull(Recipe)
			assertNotNull(RecipeController)
			assertNull($('not_here'))
			assertNotNull($('main'))
			$('main').hide();
	    }},
	    test_render_text: function() { with(this) {
			var controller = new RecipeController('RecipeController');
			var render_text_output = controller.render({text: 'hello world'})
			assertEqual(render_text_output, 'hello world')
			RecipeController.prototype.render_text = function() {
				this.render({text: 'hello world'})
			}
			get({controller: 'recipe', action: 'render_text'});
			assert($('main').innerHTML == 'hello world')
	    }}
	    
	  }, "testlog");
	}
}