new $MVC.Test.Unit('helpers',{
	test_object_extend : function(){
	   var a = {one: 'two', two: 'three'}
	   var b = {three: 'four'};
	   $MVC.Object.extend(b,a)
	   this.assertEqual('two', b.one)
	   this.assertEqual('three', b.two)
	   this.assertEqual('four', b.three)
	},
	test_to_query_string : function(){
		   this.assertEqual('one=two&two=three', $MVC.Object.to_query_string({one: 'two', two: 'three'}))
	   this.assertEqual('two=three', $MVC.Object.to_query_string({two: 'three'}))
	   this.assertEqual(null, $MVC.Object.to_query_string());
	   this.assertEqual('one=two&two=three&object%5Bhello%5D=world', $MVC.Object.to_query_string({one: 'two', two: 'three', object: {hello: 'world'} }))
	},
	test_string_capitalize : function(){
		this.assertEqual('Yes', $MVC.String.capitalize('yes'));
		this.assertEqual('Y', $MVC.String.capitalize('Y'));
		this.assertEqual('Yes', $MVC.String.capitalize('YES'))
	},
	test_string_include : function(){
		this.assertNot($MVC.String.include('Yes','bear') )
		this.assert( $MVC.String.include('Justin','in') )
		this.assert( $MVC.String.include('Justin','Just') )
		this.assert( $MVC.String.include('Justin','Justin') )
		this.assertNot( $MVC.String.include('Justin','nJ') )
	},
	test_string_ends_with : function(){
		this.assert( $MVC.String.ends_with('Justin','in')   );
		this.assertNot( $MVC.String.ends_with('Justin','is awesome')   );
	},
	test_string_camelize : function(){
		this.assertEqual('oneTwo', $MVC.String.camelize('one_two'))
	},
	test_array_include : function(){
		this.assert($MVC.Array.include([1,2,3], 2) );
		this.assertNot($MVC.Array.include([1,2,3], 4) )
	},
	test_array_from : function(){
		var f = function( ){
			var arr = $MVC.Array.from(arguments);
			this.assert(arr.join)
			this.assertEqual(arr[0], 1)
			this.assertEqual(arr[1], 2)
		}
		f.call(this, 1, 2)
	},
	test_function_bind : function(){
		var b = $MVC.Function.bind(function(){
			this.assert(true);
		}, this)
		b();
	}
});




new $MVC.Test.Unit('conflict_helpers',{
	test_string_capitalize : function(){
		this.assertEqual('Yes', 'yes'.capitalize());
		this.assertEqual('Y', 'Y'.capitalize());
		this.assertEqual('Yes', 'YES'.capitalize())
	},
	test_string_include : function(){
		this.assertNot('Yes'.include('bear') )
		this.assert( 'Justin'.include('in') )
		this.assert( 'Justin'.include('Just') )
		this.assert( 'Justin'.include('Justin') )
		this.assertNot( 'Justin'.include('nJ') )
	},
	test_string_ends_with : function(){
		this.assert( 'Justin'.ends_with('in')   );
		this.assertNot( 'Justin'.ends_with('is awesome')   );
	},
	test_string_camelize : function(){
		this.assertEqual('oneTwo', 'one_two'.camelize(), "OK if Prototype"  )
	},
	test_array_include : function(){
		this.assert([1,2,3].include(2) );
		this.assertNot([1,2,3].include( 4) )
	},
	test_array_from : function(){
		var f = function( ){
			var arr = Array.from(arguments);
			this.assert(arr.join)
			this.assertEqual(arr[0], 1)
			this.assertEqual(arr[1], 2)
		}
		f.call(this, 1, 2)
	},
	test_function_bind : function(){
		var b = function(){
			this.assert(true);
		}.bind(this)
		b();
	}
});
