new $MVC.Test.Unit('testing',{
       test_asserts : function(){
           this.assert(true);
		   this.assert({});
		   this.assert([]);
		   this.assert(7);
		   this.assertNotNull('');
		   this.assertNotNull(false);
		   this.assertNotNull(0);
		   this.assertNull(null);
		   this.assertNull(undefined);
		   this.assertEqual(1,1);
		   this.assertEqual(null, null);
		   this.assertEqual('s', 's');
       },
	   test_assert_fails : function(){
	   		this.assert('', "OK");
			this.assert(false, "OK");
			this.assertNotNull(null, "OK");
			this.assertNotNull(undefined, "OK");
			this.assertNull('', "OK");
			this.assertNull(false, "OK");
			this.assertEqual([],[], "OK");
	   },
	   test_next : function(){
	   		this.assert(true);
			this.next();
	   },
	   next_function : function(){
	   		this.assert(true)
			this.assert(false, "OK")
			this.next('hello')
	   },
	   again : function(param){
	   		this.assert('hello', param)
			this.assert(false, "OK")
	   },
	   test_errors : function(){
	   		x.y.z();
	   },
	   test_error_in_next : function(){
	   		this.assert(true);
			this.next();
	   },
	   next_function_two: function(){
	   		x.y.z();
	   }
});