JMVC.include_order = ["/dependencies/prototype.js",
						  "/dependencies/Inflector.js",
						  "/dependencies/file.js",
						  "/dependencies/Helpers.js",
						  "/dependencies/ejs.js",
						  "/core/Controller.js",
						  "/core/Dispatcher.js",
						  "/core/Template.js",
						  "/core/Include.js",
						  "/core/View.js", 
						  "/core/Routes.js"]
//-----END

for(var i = 0; i < JMVC.include_order.length; i++)
{
	JMVC.require(JMVC.ENV.BASE_PATH+JMVC.include_order[i]);
}

JMVC.require(JMVC.ENV.BASE_PATH+"/core/Framework.js");