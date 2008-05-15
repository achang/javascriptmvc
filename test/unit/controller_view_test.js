new MVC.Test.Unit('controller_view',{
	test_render_to : function(){
		MVC.Controller.dispatch('tests', 'to',{} );
		var el = document.getElementById('render_here');
		this.assert_equal("H1", el.firstChild.nodeName);
		this.assert_equal("HelloWorld", el.firstChild.innerHTML);
	},
	test_render_to_with_element : function(){
		MVC.Controller.dispatch('tests', 'to_element',{} );
		var el = document.getElementById('render_here');
		this.assert_equal("H1", el.firstChild.nodeName);
		this.assert_equal("HelloWorld", el.firstChild.innerHTML);
	},
	// fails with no_element
	test_render_after: function(){
		MVC.Controller.dispatch('tests', 'after',{} );
		this.assert_equal("HelloWorld", document.getElementById('after').innerHTML  );
		var part = document.getElementById('render_here');
		this.assert_equal("after",  part.nextSibling.id);
	}
})