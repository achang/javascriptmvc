Junction.include_order = ["/dependencies/prototype.js",
						  "/dependencies/Inflector.js",
						  "/dependencies/Helpers.js",
						  "/dependencies/ejs.js",
						  "/dependencies/dhtmlHistory.js",
						  "/core/Controller.js",
						  "/core/Dispatcher.js",
						  "/core/Template.js",
						  "/core/Include.js",
						  "/core/View.js", 
						  "/core/Routes.js"]
//-----END

for(var i = 0; i < Junction.include_order.length; i++)
{
	Junction.require(Junction.ENV.BASE_PATH+Junction.include_order[i]);
}

Junction.require(Junction.ENV.BASE_PATH+"/core/Framework.js");