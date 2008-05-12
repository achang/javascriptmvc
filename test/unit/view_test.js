new MVC.Test.Unit('view',{
	test_simple : function(){
		this.assert_equal('<h1>HelloWorld</h1>', new MVC.View({url: 'simple'}).render( )  );
	},
	test_render : function(){
		this.assert_equal("<h1>yes</h1>\n\n<p>1</p>\n\n<p>2</p>\n\n<p>3</p>\n", new MVC.View({url: 'no_helpers'}).render( {data: {title: 'yes', info: [1,2,3]}}) );
	},
    test_nested : function(){
        secondTemplate = new MVC.View({url: 'second'});
        this.assert_equal('<div><p>1</p>2</div>', new MVC.View({url: 'first'}).render({x: 1, y: 2})  )
    }
})