JMVCTest = {
	PLUGINS : ['ajax'],
	TEST_DESCRIPTION : 'Test the controller.',
	perform_test : function() {
	  new Test.Unit.Runner({
	  	
		setup: function() {
		},
		teardown: function() {
		},
	    test_get_synch_no_params : function() { with(this) {
			var request = new MVC.Ajax.Request('files/ajax.html', {asynchronous: false, method: 'get'});
			assert("<p>Content</p>",request.transport.responseText)
	    }},
		test_get_synch_params : function() { with(this) {
			var request = new MVC.Ajax.Request('files/ajax.html', {asynchronous: false, method: 'get', parameters: {hello: 'world'}} );
			assert("<p>Content</p>",request.transport.responseText)
			assert('files/ajax.html?hello=world', request.url)
	    }}
	  }, "testlog");
	}
}