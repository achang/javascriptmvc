/*  This file is where you include any javascripts or stylesheets you are using in your application.
 */

JMVC.ENV.ENVIRONMENT = 'development';

TEST.environment_run = true

JMVC.Initializer(function(){
	
	TEST.initializer_run = true;
	
	JMVC.RENDER_TO = 'main'
	JMVC.Routes.draw(function(map) {
		//map.connect('/:app_name/#:controller/:action')
		map.connect('*', {controller: 'test', action: 'start'})
		
	})
	
});