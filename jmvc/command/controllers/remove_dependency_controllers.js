RemoveDependencyController = MVC.Controller.extend({
	mouseover: function(params){
		params.element.childNodes[1].style.visibility='visible';
	},
	mouseout: function(params){
		params.element.childNodes[1].style.visibility='hidden';
	},
	'# img click': function(params){
		var application_name = MVC.current_application;
		var file_name = params.element.nextSibling.nodeValue.replace(/\'/g,'');
		var including_file_suffix = (params.controller.match(/test/)? '_test' : '');
		var class_name = params.controller.replace(/_includes/,'');
		
		// write the include back to the app file
		if(including_file_suffix == '_test')
			MVC.Path.remove_path(class_name+'s', MVC.testfile_path, 
				file_name);
		else
			MVC.Path.remove_path(class_name+'s', MVC.appfile_path, 
				file_name);
		
		MVC.Appcreator.Iframe.load_iframe(application_name);
	}
});

ControllerIncludesController = RemoveDependencyController.extend('controller_includes');
ModelIncludesController = RemoveDependencyController.extend('model_includes');
ResourceIncludesController = RemoveDependencyController.extend('resource_includes');
ViewIncludesController = RemoveDependencyController.extend('view_includes');
FunctionalTestIncludesController = RemoveDependencyController.extend('functional_test_includes');
UnitTestIncludesController = RemoveDependencyController.extend('unit_test_includes');
PluginIncludesController = RemoveDependencyController.extend('plugin_includes');