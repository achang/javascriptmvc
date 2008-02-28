/*  This file is where you include any javascripts or stylesheets you are using in your application.
 *  During development, you may want to set the second parameter of your template includes to false to turn off
 *  template caching.  This means the templates will reload in your browser rather than load from a local cache.
 */
JMVC.ENV.VERSION = 'trunk';
JMVC.ENV.ENVIRONMENT = 'development';
JMVC.OPTIONS = '';

include_library('active_record')

JMVC.Initializer(function(){
	include('app/controllers/recipe_controller.js')
	include('app/controllers/category_controller.js')
    JMVC.QueryController.RESOURCE = '/database/'+DATABASE_NAME+'/query';
    JMVC.ActiveRecord.load_from_schema('/database/'+DATABASE_NAME+'/get_schema');
    JMVC.Controller.STARTUP = {controller: 'recipe', action: 'list'};
    JMVC.RENDER_TO = 'main';
    JMVC.$MVC.View.DOCUMENT_TITLE = DATABASE_NAME;
	
    include('public/stylesheets/style.css');
});