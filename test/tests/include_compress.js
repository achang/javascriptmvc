JMVCTest = {
	TEST_DESCRIPTION : 'This tests include by itself.',
	TEST_MODE : 'compress',
	perform_test : function() {
	  new Test.Unit.Runner({
	  	
		setup: function() {
			//include('test_apps/include/load1')
		},
		teardown: function() {
		},
	    test_start_path: function() { with(this) {
			assertEqual("test_apps/include/",include.get_path())

	    }}
	    
	  }, "testlog");
	}
}