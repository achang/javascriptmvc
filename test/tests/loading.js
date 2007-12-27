JMVCTest = {
	APPLICATION_NAME : 'simple',
	TEST_DESCRIPTION : 'This tests loads the simple application and make sure it gets to calling the first action.',
	perform_test : function() {
	  new Test.Unit.Runner({
	  	
		setup: function() {
		},
		teardown: function() {
		},
	    test_app_startup: function() { with(this) {
			assert(TEST.environment_run, 'The environment file was not loaded')
			assert(TEST.initializer_run, 'The initializer function was not called') 
			assert(TEST.action_run, 'The first action wasnt run')
			assertEqual("instance variable", $('main').innerHTML   )
	    }}
	    
	  }, "testlog");
	}
}