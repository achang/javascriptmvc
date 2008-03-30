new $MVC.Test.Controller('tests',{
	test_click: function(){
		this.TestClick();
		this.assertEqual('success', $('click').className )
	},
	test_focus: function(){
		this.TestFocus();
		this.assertEqual('success', $('focus').className )
	},
	test_blur: function(){
		this.TestBlur();
		this.assertEqual('success', $('blur').className )
	},
	test_mouseover: function(){
		this.TestMouseover();
		this.assertEqual('success', $('mouseover').className )
	},
	test_mouseout: function(){
		this.TestMouseout();
		this.assertEqual('success', $('mouseout').className )
	},
	test_mouseup: function(){
		this.TestMouseup();
		this.assertEqual('success', $('mouseup').className )
	},
	test_mousedown: function(){
		this.TestMousedown();
		this.assertEqual('success', $('mousedown').className )
	},
	test_mousemove: function(){
		this.TestMousemove();
		this.assertEqual('success', $('mousemove').className )
	},
	test_submit: function(){
		this.TestsSubmit();
		this.assertEqual('success', $('submit').className )
	}
	
})


$ = function(id){
		return document.getElementById(id)
	}