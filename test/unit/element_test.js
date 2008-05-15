// fails with no_element
// work in Firefox with Prototype/no-element, but fails in IE because IE doesn't allow you to attach 
// methods to the HTMLElement prototype
new MVC.Test.Unit('element_test',{
	test_insert_bottom: function(){
		var b = MVC.$E('insertion_test');
		b.insert({bottom: '<p id="append_bottom">Bottom</p>'})
		this.assert_equal(b.firstChild.nodeName, 'P')
		this.assert_equal(b.firstChild.id, 'append_bottom')
		this.assert_equal(b.firstChild.innerHTML, 'Bottom')
	},
	test_insert_after: function(){
		var b = MVC.$E('append_bottom');
		b.insert({after: '<p id="insert_after">After</p>'});
		this.assert_equal(b.nextSibling.nodeName, 'P')
		this.assert_equal(b.nextSibling.id, 'insert_after')
		this.assert_equal(b.nextSibling.innerHTML, 'After')
	},
	test_insert_before: function(){
		var b = MVC.$E('append_bottom');
		b.insert({before: '<p id="insert_before">Before</p>'});
		this.assert_equal(b.previousSibling.nodeName, 'P')
		this.assert_equal(b.previousSibling.id, 'insert_before')
		this.assert_equal(b.previousSibling.innerHTML, 'Before')
	},
	test_insert_top: function(){
		var b = MVC.$E('insertion_test');
		b.insert({top: '<p id="insert_top">Top</p>'});
		this.assert_equal(b.childNodes[0].id, 'insert_top')
		this.assert_equal(b.childNodes[1].id, 'insert_before')
		this.assert_equal(b.childNodes[2].id, 'append_bottom')
		this.assert_equal(b.childNodes[3].id, 'insert_after')
	}
})