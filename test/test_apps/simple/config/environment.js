/*  This file is where you include any javascripts or stylesheets you are using in your application.
 */
//alert('loaded')
JMVC.ENV.ENVIRONMENT = 'development';

JMVC.Test.environment_run = true

JMVC.Initializer(function(){
	
	JMVC.Test.initializer_run = true;
	
	JMVC.RENDER_TO = 'main'
	include('app/controllers/main_controller')
	
});