new $MVC.Test.Unit('controller_view',{
	test_render_to : function(){
		$MVC.Controller.dispatch('tests', 'to',{} )
		this.assert_equal("<h1>HelloWorld</h1>", document.getElementById('render_here').innerHTML  )
	}
})