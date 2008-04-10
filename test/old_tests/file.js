JMVCTest = {
	APPLICATION_NAME : 'simple',
	TEST_DESCRIPTION : 'Test the file helpers.',
	perform_test : function() {
	  new Test.Unit.Runner({
	  	
		setup: function() {
		},
		teardown: function() {
		},
	    test_is_absolute : function() { with(this) {
			var file1 = new MVC.JFile('/holla')
			assert( file1.is_absolute() )
			var file2 = new MVC.JFile('holla')
			assertEqual(false, file2.is_absolute() )
			
			var file3 = new MVC.JFile('http://holla')
			assert( file3.is_absolute() )
			
			var file4 = new MVC.JFile('https://holla')
			assert( file4.is_absolute() )
			
			var file5 = new MVC.JFile('file://holla')
			assert( file5.is_absolute() )
	    }},
		test_extension : function() { with(this) {
			var file1 = new MVC.JFile('/holla.MVC.View')
			assertEqual('MVC.View', file1.extension() )
			
			var file2 = new MVC.JFile('/holla.addf.MVC.View')
			assertEqual('MVC.View', file2.extension() )
			
			
			var file3 = new MVC.JFile('/holla.addf.MVC.View#thisblah')
			assertEqual('MVC.View', file3.extension() )
			
			var file4 = new MVC.JFile('/holla.addf.MVC.View#thisblah')
			assertEqual('MVC.View', file4.extension() )
			
	    }},
		test_file_name : function() { with(this) {
			var file1 = new MVC.JFile('/holla.MVC.View')
			assertEqual('holla', file1.file_name() )
			
			var file2 = new MVC.JFile('/bad_holla.MVC.View#a;fda#asfdl;kj')
			assertEqual('bad_holla', file2.file_name() )
	    }},
		test_file_and_extension : function() { with(this) {
			var file1 = new MVC.JFile('/holla.MVC.View')
			assertEqual('holla.MVC.View', file1.file_and_extension() )
			
			var file2 = new MVC.JFile('/holla.addf.MVC.View')
			assertEqual('holla.addf.MVC.View', file2.file_and_extension() )
	    }},
		test_absolute : function() { with(this) {
			var file1 = new MVC.JFile('holla.MVC.View')
			assertEqual('file:///C:/Development/jmvc/test/holla.MVC.View', file1.absolute() )
			
			var file2 = new MVC.JFile('/holla.addf.MVC.View')
			assertEqual('/holla.addf.MVC.View', file2.absolute() )
			
			var cwd = MVC.JFile.get_cwd()
			MVC.JFile.set_cwd('http://something.com/here/')
			
			var file1 = new MVC.JFile('holla.MVC.View')
			assertEqual('http://something.com/here/holla.MVC.View', file1.absolute() )
			
			var file2 = new MVC.JFile('/holla.addf.MVC.View')
			assertEqual('/holla.addf.MVC.View', file2.absolute() )
			
			
			MVC.JFile.set_cwd('http://something.com/here')
			
			var file1 = new MVC.JFile('holla.MVC.View')
			assertEqual('http://something.com/here/holla.MVC.View', file1.absolute() )
			
			var file2 = new MVC.JFile('/holla.addf.MVC.View')
			assertEqual('/holla.addf.MVC.View', file2.absolute() )
			
			
			MVC.JFile.set_cwd(cwd)
			
	    }},
		test_join : function() { with(this) {
			
			assertEqual('test_apps/simple/holla.MVC.View', MVC.JFile.join('test_apps', 'simple', 'holla.MVC.View')  )
			assertEqual('test_apps/simple/holla.MVC.View', MVC.JFile.join('test_apps', '/simple', 'holla.MVC.View')  )
			
	    }}
	  }, "testlog");
	}
}