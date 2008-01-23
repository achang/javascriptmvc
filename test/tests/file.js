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
			var file1 = new jFile('/holla')
			assert( file1.is_absolute() )
			var file2 = new jFile('holla')
			assertEqual(false, file2.is_absolute() )
			
			var file3 = new jFile('http://holla')
			assert( file3.is_absolute() )
			
			var file4 = new jFile('https://holla')
			assert( file4.is_absolute() )
			
			var file5 = new jFile('file://holla')
			assert( file5.is_absolute() )
	    }},
		test_extension : function() { with(this) {
			var file1 = new jFile('/holla.ejs')
			assertEqual('ejs', file1.extension() )
			
			var file2 = new jFile('/holla.addf.ejs')
			assertEqual('ejs', file2.extension() )
			
			
			var file3 = new jFile('/holla.addf.ejs#thisblah')
			assertEqual('ejs', file3.extension() )
			
			var file4 = new jFile('/holla.addf.ejs#thisblah')
			assertEqual('ejs', file4.extension() )
			
	    }},
		test_file_name : function() { with(this) {
			var file1 = new jFile('/holla.ejs')
			assertEqual('holla', file1.file_name() )
			
			var file2 = new jFile('/bad_holla.ejs#a;fda#asfdl;kj')
			assertEqual('bad_holla', file2.file_name() )
	    }},
		test_file_and_extension : function() { with(this) {
			var file1 = new jFile('/holla.ejs')
			assertEqual('holla.ejs', file1.file_and_extension() )
			
			var file2 = new jFile('/holla.addf.ejs')
			assertEqual('holla.addf.ejs', file2.file_and_extension() )
	    }},
		test_absolute : function() { with(this) {
			var file1 = new jFile('holla.ejs')
			assertEqual('file:///C:/Development/jmvc/test/holla.ejs', file1.absolute() )
			
			var file2 = new jFile('/holla.addf.ejs')
			assertEqual('/holla.addf.ejs', file2.absolute() )
			
			var cwd = jFile.get_cwd()
			jFile.set_cwd('http://something.com/here/')
			
			var file1 = new jFile('holla.ejs')
			assertEqual('http://something.com/here/holla.ejs', file1.absolute() )
			
			var file2 = new jFile('/holla.addf.ejs')
			assertEqual('/holla.addf.ejs', file2.absolute() )
			
			
			jFile.set_cwd('http://something.com/here')
			
			var file1 = new jFile('holla.ejs')
			assertEqual('http://something.com/here/holla.ejs', file1.absolute() )
			
			var file2 = new jFile('/holla.addf.ejs')
			assertEqual('/holla.addf.ejs', file2.absolute() )
			
			
			jFile.set_cwd(cwd)
			
	    }},
		test_join : function() { with(this) {
			
			assertEqual('test_apps/simple/holla.ejs', jFile.join('test_apps', 'simple', 'holla.ejs')  )
			assertEqual('test_apps/simple/holla.ejs', jFile.join('test_apps', '/simple', 'holla.ejs')  )
			
	    }}
	  }, "testlog");
	}
}