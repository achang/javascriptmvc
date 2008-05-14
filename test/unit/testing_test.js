new MVC.Test.Unit('testing',{
       test_asserts : function(){
           this.assert(true);
		   this.assert({});
		   this.assert([]);
		   this.assert(7);
		   this.assert_not_null('');
		   this.assert_not_null(false);
		   this.assert_not_null(0);
		   this.assert_null(null);
		   this.assert_null(undefined);
		   this.assert_equal(1,1);
		   this.assert_equal(5, '5');
		   this.assert_equal(0, false)
		   this.assert_equal(null, null);
		   this.assert_equal('s', 's');
		   this.assert_each([1,2,3],[1,2,3]  )
       },
	   // expected: 10 failures
	   test_assert_fails : function(){
	   		this.assert('', "OK");
			this.assert(false, "OK");
			this.assert(0, "OK");
			this.assert_not_null(null, "OK");
			this.assert_not_null(undefined, "OK");
			this.assert_null('', "OK");
			this.assert_null(false, "OK");
			this.assert_equal([],[], "OK");
			this.assert_each([1,2,3],[1,2,3,4], "OK"  );
			this.assert_each([1,2,3],[1,2,4], "OK"  );
	   },
	   // expected: 3 assertions pass, 2 failures
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
	   // expected: 1 error
	   test_errors : function(){
	   		x.y.z();
	   },
	   // expected: 1 assertion, 1 error
	   test_error_in_next : function(){
	   		this.assert(true);
			this.next();
	   },
	   next_function_two: function(){
	   		x.y.z();
	   },
	   test_console : function(){
	   		for(var i = 0; i < 50 ; i++){
				MVC.Console.log(i)
			}
			
	   }
});