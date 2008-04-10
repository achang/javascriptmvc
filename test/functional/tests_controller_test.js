new MVC.Test.Controller('tests',{
	test_click: function(){
		this.TestClick();
		this.assert_equal('success', $GET('click').className )
	},
	test_focus: function(){
		this.TestFocus();
		this.assert_equal('success', $GET('focus').className )
	},
	test_blur: function(){
		this.TestBlur();
		this.assert_equal('success', $GET('blur').className )
	},
	test_mouseover: function(){
		this.TestMouseover();
		this.assert_equal('success', $GET('mouseover').className )
	},
	test_mouseout: function(){
		this.TestMouseout();
		this.assert_equal('success', $GET('mouseout').className )
	},
	test_mouseup: function(){
		this.TestMouseup();
		this.assert_equal('success', $GET('mouseup').className )
	},
	test_mousedown: function(){
		this.TestMousedown();
		this.assert_equal('success', $GET('mousedown').className )
	},
	test_mousemove: function(){
		this.TestMousemove();
		this.assert_equal('success', $GET('mousemove').className )
	},
	test_submit: function(){
		this.TestsSubmit();
		this.assert_equal('success', $GET('submit').className )
	},
	test_contextmenu : function(){
		this.TestContextmenu();
		this.assert_equal('success', $GET('contextmenu').className )
	}
	
})


$GET = function(id){
		return document.getElementById(id)
	}