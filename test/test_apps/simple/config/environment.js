/*  This file is where you include any javascripts or stylesheets you are using in your application.
 */
JMVC.ENV.VERSION = 'trunk';
JMVC.ENV.ENVIRONMENT = 'development';

JMVC.Initializer(function(){

	JMVC.Routes.draw(function(map) {
		map.connect('/:app_name/#:controller/:action')
		map.connect('*', {controller: 'comment', action: 'prepare_list'})
	})
	
});