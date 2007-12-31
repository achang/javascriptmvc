JMVCTest = {
	APPLICATION_NAME : 'simple',
	TEST_DESCRIPTION : 'Test the controller.',
	perform_test : function() {
	  new Test.Unit.Runner({
	  	
		setup: function() {
		},
		teardown: function() {
		},
	    test_initialize : function() { with(this) {
			var controller_instance = new TestController('TestController');
			controller_instance.start()
			assertEqual('instance variable', controller_instance.render({action: 'start'}) )
	    }},
		test_prepare_template_data : function() { with(this) {
			var controller_instance = new TestController('TestController');
			controller_instance.start()
			var data = controller_instance.prepare_template_data()
			
			assertEqual('instance variable',  data.instance_variable);
			assertEqual(null,  data.start);
			assertEqual(null,  data.another_function);
			assert(data.klass)
			assert(data.klass_name)
			assertEqual(null, data.redirect_to)
			assertEqual(null, data.redirect_to_external)
			assertEqual( 'function', typeof data.render)
	    }},
		test_redirect_to : function() { with(this) {
			
	    }},
		test_render : function() { with(this) {
			
	    }},
		test_continue_to : function() { with(this) {
			
			
	    }},
		test_render_templates : function() { with(this) {
			
	    }}
	  }, "testlog");
	}
}