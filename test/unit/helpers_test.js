new MVC.Test.Unit('helpers',{
	test_object_extend : function(){
	   var a = {one: 'two', two: 'three'}
	   var b = {three: 'four'};
	   MVC.Object.extend(b,a)
	   this.assert_equal('two', b.one)
	   this.assert_equal('three', b.two)
	   this.assert_equal('four', b.three)
	},
	test_to_query_string : function(){
		   this.assert_equal('one=two&two=three', MVC.Object.to_query_string({one: 'two', two: 'three'}))
	   this.assert_equal('two=three', MVC.Object.to_query_string({two: 'three'}))
	   this.assert_equal(null, MVC.Object.to_query_string());
	   this.assert_equal('one=two&two=three&object%5Bhello%5D=world', MVC.Object.to_query_string({one: 'two', two: 'three', object: {hello: 'world'} }))
	},
	test_string_capitalize : function(){
		this.assert_equal('Yes', MVC.String.capitalize('yes'));
		this.assert_equal('Y', MVC.String.capitalize('Y'));
		this.assert_equal('Yes', MVC.String.capitalize('YES'))
	},
	test_string_include : function(){
		this.assert_not(MVC.String.include('Yes','bear') )
		this.assert( MVC.String.include('Justin','in') )
		this.assert( MVC.String.include('Justin','Just') )
		this.assert( MVC.String.include('Justin','Justin') )
		this.assert_not( MVC.String.include('Justin','nJ') )
	},
	test_string_ends_with : function(){
		this.assert( MVC.String.ends_with('Justin','in')   );
		this.assert_not( MVC.String.ends_with('Justin','is awesome')   );
	},
	test_string_camelize : function(){
		this.assert_equal('oneTwo', MVC.String.camelize('one_two'))
	},
	test_string_classize : function(){
		this.assert_equal('OneTwo', MVC.String.classize('one_two'))
	},
	test_string_strip : function(){
		this.assert_equal('word', MVC.String.strip(' word  '))
	},
	test_array_include : function(){
		this.assert(MVC.Array.include([1,2,3], 2) );
		this.assert_not(MVC.Array.include([1,2,3], 4) )
	},
	test_array_from : function(){
		var f = function( ){
			var arr = MVC.Array.from(arguments);
			this.assert(arr.join)
			this.assert_equal(arr[0], 1)
			this.assert_equal(arr[1], 2)
		}
		f.call(this, 1, 2)
	},
	test_function_bind : function(){
		var b = MVC.Function.bind(function(){
			this.assert(true);
		}, this)
		b();
	},
	test_function_params : function(){
		this.assert_each(['one','two','three'], MVC.Function.params(function( one, two ,three){ return 'yes'})  )
	}
});




// should all fail in no_conflict
// camelize will fail with Prototype
new MVC.Test.Unit('conflict_helpers',{
	test_string_capitalize : function(){
		this.assert_equal('Yes', 'yes'.capitalize());
		this.assert_equal('Y', 'Y'.capitalize());
		this.assert_equal('Yes', 'YES'.capitalize())
	},
	test_string_include : function(){
		this.assert_not('Yes'.include('bear') )
		this.assert( 'Justin'.include('in') )
		this.assert( 'Justin'.include('Just') )
		this.assert( 'Justin'.include('Justin') )
		this.assert_not( 'Justin'.include('nJ') )
	},
	test_string_ends_with : function(){
		this.assert( 'Justin'.ends_with('in')   );
		this.assert_not( 'Justin'.ends_with('is awesome')   );
	},
	test_string_camelize : function(){
		this.assert_equal('oneTwo', 'one_two'.camelize(), "OK if Prototype"  )
	},
	test_string_classize : function(){
		this.assert_equal('OneTwo', 'one_two'.classize() )
	},
	test_string_strip : function(){
		this.assert_equal('word', ' word  '.strip())
	},
	test_array_include : function(){
		this.assert([1,2,3].include(2) );
		this.assert_not([1,2,3].include( 4) )
	},
	test_array_from : function(){
		var f = function( ){
			var arr = Array.from(arguments);
			this.assert(arr.join)
			this.assert_equal(arr[0], 1)
			this.assert_equal(arr[1], 2)
		}
		f.call(this, 1, 2)
	},
	test_function_bind : function(){
		var b = function(){
			this.assert(true);
		}.bind(this)
		b();
	},
	test_function_params : function(){
		this.assert_each(['one','two','three'], function( one, two ,three){ return 'yes'}.params()  )
	}
});
