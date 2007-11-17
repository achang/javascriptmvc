/*  This file is where you include any javascripts or stylesheets you are using in your application.
 *  During development, you may want to set the second parameter of your template includes to false to turn off
 *  template caching.  This means the templates will reload in your browser rather than load from a local cache.
 */
Junction.ENV.VERSION = 'trunk';
Junction.ENV.ENVIRONMENT = 'development';
Junction.OPTIONS = '';

include_library('active_record')

Junction.Initializer(function(){
	include('app/controllers/recipe_controller.js')
	include('app/controllers/category_controller.js')
    Junction.QueryController.RESOURCE = '/database/'+DATABASE_NAME+'/query';
    Junction.ActiveRecord.load_from_schema('/database/'+DATABASE_NAME+'/get_schema');
    Junction.Controller.STARTUP = {controller: 'recipe', action: 'list'};
    Junction.View.RENDER_TO = 'main';
    Junction.View.DOCUMENT_TITLE = DATABASE_NAME;
	
    include('public/stylesheets/style.css');
});