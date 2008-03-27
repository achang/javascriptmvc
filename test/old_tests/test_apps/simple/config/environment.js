/*  This file is where you include any javascripts or stylesheets you are using in your application.
 */

JMVC.Test.environment_run = true
//include.plugins('local_storage','jester')
JMVC.Initializer(function(){
	
	JMVC.Test.initializer_run = true;
	include.controllers('main')
	
});