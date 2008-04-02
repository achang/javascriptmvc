new $MVC.Test.Unit('ajax',{
	test_normal_request : function(){
		new $MVC.Ajax.Request('ajax/request.xml', {onComplete: this.next_callback(), use_fixture: false } )
	},
	normal : function(response){
		this.assert_equal("<data>one</data>", response.responseText);
	},
	test_fixture_request : function(){
		new $MVC.Ajax.Request('ajax/request.xml', {onComplete: this.next_callback() } )
	},
	fixture : function(response){
		this.assert_equal("<data>two</data>", response.responseText)
	},
	test_success_request : function(){
		new $MVC.Ajax.Request('ajax/request.xml', {onSuccess: this.next_callback(), use_fixture: false } );
	},
	success : function(response){
		this.assert_equal("<data>one</data>", response.responseText);
	},
	test_fail_request : function(){
		if(!location.href.match(/file:|c:\\/) )
			new $MVC.Ajax.Request('ajax/reuest.xml', {onFailure: this.next_callback(), use_fixture: false } );
	},
	failure : function(){
		this.assert(true)
	}
});

new $MVC.Test.Unit('conflict_ajax',{
	test_normal_request : function(){
		new Ajax.Request('ajax/request.xml', {onComplete: this.next_callback(), use_fixture: false } )
	},
	normal : function(response){
		this.assert_equal("<data>one</data>", response.responseText);
	}
})