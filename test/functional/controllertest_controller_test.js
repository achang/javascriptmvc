new $MVC.Test.Controller('tests',{
	test_click: function(){
		this.TestClick();
		this.assertEqual('success', $GET('click').className )
	},
	test_focus: function(){
		this.TestFocus();
		this.assertEqual('success', $GET('focus').className )
	},
	test_blur: function(){
		this.TestBlur();
		this.assertEqual('success', $GET('blur').className )
	},
	test_mouseover: function(){
		this.TestMouseover();
		this.assertEqual('success', $GET('mouseover').className )
	},
	test_mouseout: function(){
		this.TestMouseout();
		this.assertEqual('success', $GET('mouseout').className )
	},
	test_mouseup: function(){
		this.TestMouseup();
		this.assertEqual('success', $GET('mouseup').className )
	},
	test_mousedown: function(){
		this.TestMousedown();
		this.assertEqual('success', $GET('mousedown').className )
	},
	test_mousemove: function(){
		this.TestMousemove();
		this.assertEqual('success', $GET('mousemove').className )
	},
	test_submit: function(){
		this.TestsSubmit();
		this.assertEqual('success', $GET('submit').className )
	},
	test_contextmenu : function(){
		this.TestContextmenu();
		this.assertEqual('success', $GET('contextmenu').className )
	}
	
})


$GET = function(id){
		return document.getElementById(id)
	}