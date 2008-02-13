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
			var file1 = new JFile('/holla')
			assert( file1.is_absolute() )
			var file2 = new JFile('holla')
			assertEqual(false, file2.is_absolute() )
			
			var file3 = new JFile('http://holla')
			assert( file3.is_absolute() )
			
			var file4 = new JFile('https://holla')
			assert( file4.is_absolute() )
			
			var file5 = new JFile('file://holla')
			assert( file5.is_absolute() )
	    }},
		test_extension : function() { with(this) {
			var file1 = new JFile('/holla.View')
			assertEqual('View', file1.extension() )
			
			var file2 = new JFile('/holla.addf.View')
			assertEqual('View', file2.extension() )
			
			
			var file3 = new JFile('/holla.addf.View#thisblah')
			assertEqual('View', file3.extension() )
			
			var file4 = new JFile('/holla.addf.View#thisblah')
			assertEqual('View', file4.extension() )
			
	    }},
		test_file_name : function() { with(this) {
			var file1 = new JFile('/holla.View')
			assertEqual('holla', file1.file_name() )
			
			var file2 = new JFile('/bad_holla.View#a;fda#asfdl;kj')
			assertEqual('bad_holla', file2.file_name() )
	    }},
		test_file_and_extension : function() { with(this) {
			var file1 = new JFile('/holla.View')
			assertEqual('holla.View', file1.file_and_extension() )
			
			var file2 = new JFile('/holla.addf.View')
			assertEqual('holla.addf.View', file2.file_and_extension() )
	    }},
		test_absolute : function() { with(this) {
			var file1 = new JFile('holla.View')
			assertEqual('file:///C:/Development/jmvc/test/holla.View', file1.absolute() )
			
			var file2 = new JFile('/holla.addf.View')
			assertEqual('/holla.addf.View', file2.absolute() )
			
			var cwd = JFile.get_cwd()
			JFile.set_cwd('http://something.com/here/')
			
			var file1 = new JFile('holla.View')
			assertEqual('http://something.com/here/holla.View', file1.absolute() )
			
			var file2 = new JFile('/holla.addf.View')
			assertEqual('/holla.addf.View', file2.absolute() )
			
			
			JFile.set_cwd('http://something.com/here')
			
			var file1 = new JFile('holla.View')
			assertEqual('http://something.com/here/holla.View', file1.absolute() )
			
			var file2 = new JFile('/holla.addf.View')
			assertEqual('/holla.addf.View', file2.absolute() )
			
			
			JFile.set_cwd(cwd)
			
	    }},
		test_join : function() { with(this) {
			
			assertEqual('test_apps/simple/holla.View', JFile.join('test_apps', 'simple', 'holla.View')  )
			assertEqual('test_apps/simple/holla.View', JFile.join('test_apps', '/simple', 'holla.View')  )
			
	    }}
	  }, "testlog");
	}
}