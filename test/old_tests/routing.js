JMVCTest = {
	APPLICATION_NAME : 'simple',
	TEST_DESCRIPTION : 'This tests loads the simple application and tests routing.',
	perform_test : function() {
	  new Test.Unit.Runner({
	  	
		setup: function() {
		},
		teardown: function() {
		},
	    test_match_everything: function() { with(this) {
			JMVC.Routes.draw(function(map) {
				map.connect('*', {controller: 'test', action: 'start'})
			})
			
			var params = JMVC.Routes.params('/something_crazy#&jmvc=cool')
			assertEqual('test',params.controller)
			assertEqual('start',params.action)
			assertEqual('cool',params.jmvc)
			
			var params = JMVC.Routes.params('/something_crazy#jmvc=cool')
			assertEqual('test',params.controller)
			assertEqual('start',params.action)
			assertEqual('cool',params.jmvc)
			
			
			
	    }},
		test_path: function() { with(this) {
			var path1 = new JMVC.Path('http://javascriptmvc.com/something_crazy#controller/action&jmvc=cool')
			assertEqual('jmvc=cool', path1.params())
			assertEqual( '/something_crazy',path1.domain())
			assertEqual( 'controller/action',path1.folder())
			
			var path2 = new JMVC.Path('http://javascriptmvc.com/another/something_crazy#jmvc=cool')
			assertEqual('jmvc=cool', path2.params())
			assertEqual( '/another/something_crazy',path2.domain())
			assertEqual( null,path2.folder())
			
			var path3 = new JMVC.Path('http://javascriptmvc.com/app/#test')
			assertEqual( '/app/',path3.domain())
			
			
			var path4 = new JMVC.Path('http://javascriptmvc.com/something_crazy#jmvc=cool&jupiter=dope')
			assertEqual('jmvc=cool&jupiter=dope', path4.params())
			assertEqual( '/something_crazy',path4.domain())
			
	    }},
		test_route: function() { with(this) {
			var route1 = new JMVC.Route('*', {controller: 'test', action: 'start'})
			var route2 = new JMVC.Route('/:app_name/#:controller/:action')
			
			var route3 = new JMVC.Route('/:app_name/index.html#:controller/:action/:id')
			var route4 = new JMVC.Route('/:app_name/#:controller', {action: 'index'})
			
			//domain
			assertEqual('*', route1.domain())
			assertEqual('/:app_name/', route2.domain())
			assertEqual('/:app_name/index.html', route3.domain())
			
			//folder
			assertEqual(null, route1.folder())
			assertEqual(':controller/:action', route2.folder())
			assertEqual(':controller/:action/:id', route3.folder())
			
			//folders
			assertEqual(':controller', route3.folders()[0])
			assertEqual(':action', route3.folders()[1])
			assertEqual(':id', route3.folders()[2])
			
			//needed_params
			assertEqual('controller', route2.needed_params()[0])
			assertEqual('action', route2.needed_params()[1])
			
			//has_params
			assertEqual(true, route2.has_params( {controller: 'test', action: 'test'} ), 'has_params has failed')
			
			//draw
			assertEqual('test/act', route2.draw( {controller: 'test', action: 'act'} ))
			assertEqual('test', route4.draw( {controller: 'test'} ))
			
			//matches
			assertEqual(true, route4.matches( new JMVC.Path('http://javascriptmvc.com/app/#test') ))
			assertEqual(true, route3.matches( new JMVC.Path('http://javascriptmvc.com/app/index.html#test/act/5') ))
			assertEqual(false, route3.matches( new JMVC.Path('http://javascriptmvc.com/app/index.html#test/act') ))
			
			//populate_params_with_path
			var params = route3.populate_params_with_path( new JMVC.Path('http://javascriptmvc.com/app/index.html#test/act/5'), {} )
			assertEqual('5', params.id )
			assertEqual('app', params.app_name )
			assertEqual('test', params.controller )
			assertEqual('act', params.action )
	    }},
		test_get_data: function() { with(this) {
			var path = new JMVC.Path('http://javascriptmvc.com/another/something_crazy#jmvc=cool')
			var params = JMVC.Routes.get_data(path)
			assertEqual('cool', params.jmvc )
			
			var path2 = new JMVC.Path('http://javascriptmvc.com/another/something_crazy#jmvc=cool&jupiter=dope')
			var params2 = JMVC.Routes.get_data(path2)
			assertEqual('dope', params2.jupiter )
			assertEqual('cool', params2.jmvc )
			
			var path3 = new JMVC.Path('http://javascriptmvc.com/another/something_crazy#jmvc[routing]=cool&jmvc[MVC.View]=dope')
			var params3 = JMVC.Routes.get_data(path3)
			assertEqual('dope', params3.jmvc.MVC.View )
			assertEqual('cool', params3.jmvc.routing )
			
			var path4 = new JMVC.Path('http://javascriptmvc.com/another/something_crazy#jmvc[routing][tests]=cool&jmvc[MVC.View]=dope')
			var params4 = JMVC.Routes.get_data(path4)
			assertEqual('cool', params4.jmvc.routing.tests )
			assertEqual('dope', params4.jmvc.MVC.View )
			
	    }}
	    
	  }, "testlog");
	}
}