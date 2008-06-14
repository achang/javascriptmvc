AddDependencyController = MVC.Controller.extend({
    change: function(params){
		params.including_file_suffix = params.including_file_suffix || '';
		params.including_path = params.including_path || params.element.lastChild.nodeValue;
		this.application_name = MVC.current_application;
		
		// write the include back to the app file
		if(params.including_file_suffix == '_test')
			MVC.Path.add_path(this.Class.className, MVC.testfile_path, 
				params.including_path);
		else
			MVC.Path.add_path(this.Class.className, MVC.appfile_path, 
				params.including_path);
			
		// reload the app
		MVC.Appcreator.Iframe.load_iframe(this.application_name);
	}
});

ControllersController = AddDependencyController.extend('controllers');
ModelsController = AddDependencyController.extend('models');
ResourcesController = AddDependencyController.extend('resources');
PluginsController = AddDependencyController.extend('plugins',{
	change: function(params){
		if(params.element.childNodes.length > 2)
			params.including_path = params.element.childNodes[2].innerHTML;
		this._super(params);
	}
});

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