AddDependencyController = MVC.Controller.extend('add_dependency',{
    change: function(params){
		params.including_file_suffix = params.including_file_suffix || '';
		params.including_path = params.including_path || params.element.lastChild.nodeValue;
		this.application_name = document.getElementById('application').innerHTML;
		this.checked = params.element.firstChild.checked;
		if(this.checked)
			MVC.Path.add_path(this.Class.className, MVC.file_base+"\\apps\\"+this.application_name+params.including_file_suffix+".js", 
				params.including_path);
		else
			MVC.Path.remove_path(this.Class.className, MVC.file_base+"\\apps\\"+this.application_name+params.including_file_suffix+".js", 
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
		var dir_name = params.element.parentNode.previousSibling.previousSibling.innerHTML;
		var template_name = params.element.lastChild.nodeValue;
		params.including_path = dir_name+'/'+template_name;
		this._super(params);
	}
});

FunctionalTestsController = AddDependencyController.extend('functional_tests',{
    change: function(params){
		params.including_file_suffix = '_test.js';
		this._super(params);
	}
});

UnitTestsController = AddDependencyController.extend('unit_tests',{
    change: function(params){
		params.including_file_suffix = '_test.js';
		this._super(params);
	}
});