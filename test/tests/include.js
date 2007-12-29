JMVCTest = {
	APPLICATION_NAME : 'simple',
	TEST_DESCRIPTION : 'This tests loads the simple application and make sure it gets to calling the first action.',
	perform_test : function() {
	  new Test.Unit.Runner({
	  	
		setup: function() {
		},
		teardown: function() {
		},
	    test_include_css: function() { with(this) {
			JMVC.include('stylesheets/test.css')
			setTimeout(function(){
				if(200 != document.getElementById('box').clientWidth){
					alert('include_css failed!')
				}
			}, 1000)
			
			assert(true)
	    }},
	    test_css: function() { with(this) {
			JMVC.include.css('test2')
			setTimeout(function(){
				if(300 != document.getElementById('box2').clientWidth){
					alert('test_css failed!')
				}
			}, 1000)
			
			assert(true)
	    }}
	    
	  }, "testlog");
	}
}