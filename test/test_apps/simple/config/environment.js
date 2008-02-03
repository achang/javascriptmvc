/*  This file is where you include any javascripts or stylesheets you are using in your application.
 */

JMVC.Test.environment_run = true
include_plugins('local_storage','jester')
JMVC.Initializer(function(){
	
	JMVC.Test.initializer_run = true;
	include('app/controllers/main_controller')
	
});