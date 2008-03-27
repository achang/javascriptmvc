new $MVC.Test.Controller('todos',{
       test_mouseover : function(){
           var params = this.TodoMouseover();
           this.assert(params.element.style.backgroundColor == 'rgb(143, 186, 60)' ||
		   			params.element.style.backgroundColor == '#8fba3c');
		   this.next(null, null, 'blank');
       },
       test_mouseout : function(){
           var params = this.TodoMouseout();
           this.assertEqual(params.element.style.backgroundColor, '');
		   this.next(null, null, 'blank');
       },
       test_click_to_edit : function(){
           var params = this.TodoLabelClick();
           this.assertEqual(params.element.className, 'working');
           this.assertEqual(params.element.firstChild.nodeType, 1);
		   this.next(null, null, 'blank');
       },
       test_click_todo_type_and_blur : function(){
           var params = this.TodoLabelClick();
		   var input = $MVC.CSSQuery('.todo label input')[0];
		   this.Write(input, {text: 'hello world', callback: this.next_callback('click_todo_type_and_blur_part2')});
	   },
	   click_todo_type_and_blur_part2 : function() {
		   var input = $MVC.CSSQuery('.todo label input')[0];
		   this.assertEqual(input.value, "Learn JavaScriptMVChello world");
           var params = this.TodoLabelInputBlur();
		   this.assertEqual($MVC.CSSQuery('.todo label')[0].innerHTML, "Learn JavaScriptMVChello world");
		   this.next(null, null, 'blank');
       },
       test_todo_edit_and_hit_enter : function(){
           var params = this.TodoLabelClick();
           var params = this.TodoLabelInputKeypress({character: 'D'});
		   this.assertEqual($MVC.CSSQuery('.todo label input')[0].value, "Learn JavaScriptMVChello worldD");
           var params = this.TodoLabelInputKeypress({keyCode: 13});
		   this.assertEqual($MVC.CSSQuery('.todo label')[0].innerHTML, "Learn JavaScriptMVChello worldD");
		   this.next(null, null, 'blank');
       },
		test_todo_check_click : function() {
			if($MVC.CSSQuery('.todo .check')[0].checked == true)
				alert('The checkbox should start off unchecked, please uncheck this box and try the test again.')
			var params = this.TodoCheckClick();
			this.assert(params.element.parentNode.style.color == '#808080' || params.element.parentNode.style.color == 'gray');
		   this.next(null, null, 'blank');
		},
		test_todo_check_unclick : function() {
			var params = this.TodoCheckClick();
			this.assertEqual(params.element.parentNode.style.color, '');
		   this.next(null, null, 'blank');
		},
		test_click_input_box : function(){
			var params = this.TodosNewInputFocus();
			this.assertEqual('', params.element.value);
		   this.next(null, null, 'blank');
		},
		test_type_new_text : function(){
			var params = this.TodosNewInputFocus();
			this.Write(params.element, {text: 'Walk the dog!', callback: this.next_callback('test_type_new_text_part2')});
		},
		type_new_text_part2 : function() {
			var input = $MVC.CSSQuery('#todos .new input')[0];
			this.assertEqual('Walk the dog!', input.value);
		   this.next(null, null, 'blank');
		},
		test_focus_type_blur_input_box : function(){
			var params = this.TodosNewInputFocus();
			var params = this.TodosNewInputKeypress({character: '!'});
			var params = this.TodosNewInputBlur();
		    this.assertEqual($MVC.CSSQuery('.todo label')[0].innerHTML, "Walk the dog!!");
		   this.next(null, null, 'blank');
		},
		test_submit_new_todo : function() {
			var input_params = this.TodosNewInputFocus();
			this.Write(input_params.element, {text: 'Brian', callback: this.next_callback('submit_new_todo_part2')});
		},
		submit_new_todo_part2 : function() {
			var input_params = $MVC.CSSQuery('#todos .new input')[0];
			var form_params = this.TodosFormSubmit();
		    this.assertEqual($MVC.CSSQuery('.todo label')[0].innerHTML, "Brian");
		    this.assertEqual(input_params.value, "");
		    this.assertEqual(input_params.style.color, "");
		   this.next(null, null, 'blank');
		},
		test_delete_todo : function() {
			var params = this.TodoImgClick();
			this.assertEqual($MVC.CSSQuery('.todo').length, 2);
		},
		blank : function() {
			// do nothing
		}
});