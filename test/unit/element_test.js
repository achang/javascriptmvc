// fails with no_element
new MVC.Test.Unit('element_test',{
	test_insert_bottom: function(){
		var b = MVC.$E('insertion_test')
		b.insert({bottom: '<p id="append_bottom">Bottom</p>'})
		this.assert_equal('<p id="append_bottom">Bottom</p>', b.innerHTML)
	},
	test_insert_after: function(){
		var b = MVC.$E('append_bottom');
		b.insert({after: '<p id="insert_after">After</p>'});
		this.assert_equal('<p id="append_bottom">Bottom</p><p id="insert_after">After</p>', MVC.$E('insertion_test').innerHTML)
	},
	test_insert_before: function(){
		var b = MVC.$E('append_bottom');
		b.insert({before: '<p id="insert_before">Before</p>'});
		this.assert_equal(
			'<p id="insert_before">Before</p><p id="append_bottom">Bottom</p><p id="insert_after">After</p>', 
			MVC.$E('insertion_test').innerHTML
		)
	},
	test_insert_top: function(){
		var b = MVC.$E('insertion_test');
		b.insert({top: '<p id="insert_top">Top</p>'});
		this.assert_equal(
			'<p id="insert_top">Top</p><p id="insert_before">Before</p><p id="append_bottom">Bottom</p><p id="insert_after">After</p>', 
			MVC.$E('insertion_test').innerHTML
		)
	}
})