AbstractIncludesController = MVC.Controller.extend('abstract_includes',{
	mouseover: function(params){
		params.element.childNodes[1].style.visibility='visible';
	},
	mouseout: function(params){
		params.element.childNodes[1].style.visibility='hidden';
	},
	'# img click': function(params){
		var application_name = document.getElementById('application').innerHTML;
		var file_name = params.element.nextSibling.nodeValue.replace(/\'/g,'');
		var including_file_suffix = (params.controller.match(/test/)? '_test' : '');
		var class_name = params.controller.replace(/_includes/,'');
		MVC.Path.remove_path(class_name+'s', 
			MVC.file_base+Mozilla.slash+"apps"+Mozilla.slash+application_name+including_file_suffix+".js", 
			file_name);
		MVC.Appcreator.Iframe.load_iframe(application_name);
	}
});

ControllerIncludesController = AbstractIncludesController.extend('controller_includes');
ModelIncludesController = AbstractIncludesController.extend('model_includes');
ResourceIncludesController = AbstractIncludesController.extend('resource_includes');
ViewIncludesController = AbstractIncludesController.extend('view_includes');
FunctionalTestIncludesController = AbstractIncludesController.extend('functional_test_includes');
UnitTestIncludesController = AbstractIncludesController.extend('unit_test_includes');
PluginIncludesController = AbstractIncludesController.extend('plugin_includes');

AddDependencyController = MVC.Controller.extend('add_dependency',{
    change: function(params){
		params.including_file_suffix = params.including_file_suffix || '';
		params.including_path = params.including_path || params.element.lastChild.nodeValue;
		this.application_name = document.getElementById('application').innerHTML;
		this.checked = params.element.firstChild.checked;
		if(this.checked)
			MVC.Path.add_path(this.Class.className, MVC.file_base+Mozilla.slash+"apps"+Mozilla.slash+this.application_name+params.including_file_suffix+".js", 
				params.including_path);
		else
			MVC.Path.remove_path(this.Class.className, MVC.file_base+Mozilla.slash+"apps"+Mozilla.slash+this.application_name+params.including_file_suffix+".js", 
				params.including_path);
		// reload the app
		MVC.Appcreator.Iframe.load_iframe(this.application_name);
	}
});

ControllersController = AddDependencyController.extend('controllers');
ModelsController = AddDependencyController.extend('models');
ResourcesController = AddDependencyController.extend('resources');
PluginsController = AddDependencyController.extend('plugins');

ViewsController = AddDependencyController.extend('views',{
    change: function(params){
		var view = params.element.lastChild.nodeValue.replace(/\s+/g,'');
		params.including_path = view;
		this._super(params);
	}
});

FunctionalTestsController = AddDependencyController.extend('functional_tests',{
    change: function(params){
		params.including_file_suffix = '_test';
		this._super(params);
	}
});

UnitTestsController = AddDependencyController.extend('unit_tests',{
    change: function(params){
		params.including_file_suffix = '_test';
		this._super(params);
	}
});