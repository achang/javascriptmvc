function RGB2HEX(value){
    var match = value.match(/\w*\(\s*(\d*),\s*(\d*),\s*(\d*)\)/);
	if(!match) return value;
	var txt = '#'
	for(var i=1; i< 4; i++){
		var value = parseInt(match[i]);
		txt+= (value< 16 ? '0' : '')+value.toString(16)
	}
	return txt;
}

new Test.Controller('todos',{
    test_mouseover : function(){
        var params = this.TodoMouseover();
        this.assert_equal("#8fba3c", RGB2HEX(params.element.style.backgroundColor));
	    this.next(null, 1, 'blank');
    },
    test_mouseout : function(){
        var params = this.TodoMouseout();
        this.assert_equal('', params.element.style.backgroundColor);
	    this.next(null, 1, 'blank');
    },
    test_edit : function(){
        var params = this.TodoLabelClick();
        this.assert_equal('working', params.element.className);
        this.assert_equal(1, params.element.firstChild.nodeType);
        var input = Query('.todo label input')[0];
        this.Write(input, {text: '\b\b\b\b\b\b\b\b\b\b\b\b\bto fly', 
            callback: this.next_callback(null, 1)});
    },
    edit_after_write : function() {
        var input = Query('.todo label input')[0];
        this.assert_equal("Learn to fly", input.value);
        var params = this.TodoLabelInputBlur();
        this.assert_equal("Learn to fly", Query('.todo label')[0].innerHTML);
	    this.next(null, 1, 'blank');
    },
    test_check : function() {
        var params = this.TodoCheckClick();
        this.assert(RGB2HEX(params.element.parentNode.style.color) == "#808080" || 
			RGB2HEX(params.element.parentNode.style.color) == 'gray');
	    this.next(null, 1, 'blank');
    },
    test_uncheck : function() {
        params = this.TodoCheckClick();
        this.assert_equal('', params.element.parentNode.style.color);
	    this.next(null, 1, 'blank');
    },
    test_new : function(){
        var params = this.TodosNewInputFocus();
        this.assert_equal('', params.element.value);
        var params = this.TodosNewInputFocus();
        this.Write(params.element, {text: 'Walk the dog', callback: this.next_callback(null, 1)});
    },
    new_after_write : function() {
        var input = Query('#todos .new input')[0];
        this.assert_equal('Walk the dog', input.value);
        var params = this.TodosNewInputBlur();
        this.assert_equal("Walk the dog", Query('.todo label')[0].innerHTML);
	    this.next(null, 1, 'blank');
    },
    test_delete : function() {
        var params = this.TodoImgClick();
        this.assert_equal(1, Query('.todo').length);
    },
	blank : function() {}
});