JMVCTest = {
	TEST_DESCRIPTION : 'This tests include by itself.',
	TEST_MODE : 'development',
	perform_test : function() {
	  new Test.Unit.Runner({
	  	
		setup: function() {
			include.opera();
		},
		teardown: function() {
		},
		test_redundant : function(){with(this){
			assertEqual(1, TEST.load2);
		}},
	    test_start_path: function() { with(this) {
			assertEqual("test_apps/include",include.get_path());
	    }},
	    test_include_relative: function() { with(this) {
			assert(TEST.Local)
			assert(TEST.Local2)
	    }},
		test_include_remote: function() { with(this) {
			assert(TEST.Remote1)
			assert(TEST.Remote2)
	    }},
		test_absolute_cwd : function(){with(this) {
			
			include.set_path('folder/another')
			assertEqual( "file:///C:/Development/jmvc/test/folder/another", include.get_absolute_path() )
			include.set_path('../another')
			assertEqual( "file:///C:/Development/jmvc/another", include.get_absolute_path() )
			
		}},
		test_get_path : function(){with(this) {
			assertEqual( "http://javascriptmvc.com/test", TEST.Remote2cwd )
			assertEqual( "http://javascriptmvc.com/test", TEST.Remote2abs )
			assertEqual( "file:///C:/Development/jmvc/test/test_apps/include", TEST.Local2abs )
		}},
	    test_normalize : function(){with(this) {
			include.set_path('folder/another');
			assertEqual('folder/another/style.css', include.normalize('style.css') )
			assertEqual('folder/style.css', include.normalize('../style.css') )
			assertEqual('http://jupiterit.com/style.css', include.normalize('http://jupiterit.com/style.css') )
			assertEqual('https://jupiterit.com/style.css', include.normalize('https://jupiterit.com/style.css') )
			assertEqual('file:///C:/Development/jmvc/test/index.html', include.normalize('file:///C:/Development/jmvc/test/index.html') )
			//not really able to test / here, with a file
			
			
			include.set_path('http://jupiterit.com/resources');
			assertEqual('http://jupiterit.com/resources/style.css', include.normalize('style.css') )
			assertEqual('http://jupiterit.com/style.css', include.normalize('../style.css') )
			assertEqual('file:///C:/Development/jmvc/test/index.html', include.normalize('file:///C:/Development/jmvc/test/index.html') )
			assertEqual('http://jupiterit.com/style.css', include.normalize('/style.css') )
			assertEqual('http://jupiterit.com/resource/style.css', include.normalize('/resource/style.css') )
		}}
	  }, "testlog");
	}
}