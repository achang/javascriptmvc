JMVCTest = {
	TEST_DESCRIPTION : 'This tests include by itself.',
	TEST_MODE : 'compress',
	perform_test : function() {
	  new Test.Unit.Runner({
	  	
		setup: function() {
			this.local_absolute = new MVC.File('/this/was/great');
			this.relative_1 = new MVC.File('so/was/this');
			this.empty = new MVC.File('');
			this.relative_2 = new MVC.File('../something/else')
		},
		teardown: function() {
		},
	    test_file_domain: function() { with(this) {
			assertEqual(null,new MVC.File(location.href).domain() )
	    }},
	    test_http_domain: function() { with(this) {
			assertEqual('something.com',new MVC.File('http://something.com/asfdkl;a').domain() )
	    }},
	    test_https_domain: function() { with(this) {
			assertEqual('127.0.0.1:3006',new MVC.File('https://127.0.0.1:3006/asdf').domain() )
	    }},
	    test_http_domain_and_protocol: function() { with(this) {
			assertEqual('http://something.com',new MVC.File('http://something.com/asfdkl;a').domain_and_protocol() )
	    }},
	    test_https_domain_and_protocol: function() { with(this) {
			assertEqual('https://127.0.0.1:3006',new MVC.File('https://127.0.0.1:3006/asdf').domain_and_protocol() )
	    }},
		test_get_local_absolute: function() { with(this) {
			assertEqual('/asdf',new MVC.File('https://127.0.0.1:3006/asdf').get_local_absolute() )
	    }},
	    test_path_from: function() { with(this) {
			
			assertEqual('/asdf',new MVC.File('https://127.0.0.1:3006/asdf').get_local_absolute() )
	    }}
	  }, "testlog");
	}
}