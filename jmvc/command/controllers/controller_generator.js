ControllerGeneratorController = MVC.Controller.extend('controller_generator',{
    submit: function(params){
        params.event.kill();
        this.class_name = params.element.controller_name.value;
        this.name = MVC.String.classize(this.class_name)+'Controller';
		this.application_name = document.getElementById('application').innerHTML;
		
		// create the controller file
        var res = new MVC.View({absolute_url: 'command/generators/controller.ejs'}).render(this);
        mozillaSaveFile(MVC.file_base+"\\controllers\\"+this.class_name+"_controller.js", res  )
		
		// write the controller include back to the app file
		add_path('controllers', MVC.file_base+"\\apps\\"+this.application_name+".js", this.class_name);
		
		// create the functional test file
        var res = new MVC.View({absolute_url: 'command/generators/controller_test.ejs'}).render(this);
        mozillaSaveFile(MVC.file_base+"\\test\\functional\\"+this.class_name+"_controller_test.js", res  );
		
		// write the controller test include back to the test file
		add_path('functional_tests', MVC.file_base+"\\apps\\"+this.application_name+"_test.js", this.class_name);
		
		// create the view folder
		mozillaCreateDirectory(MVC.file_base+"\\views\\"+this.class_name);
		
		// reload the app
		load_frame(this.application_name);
    }
});

ModelGeneratorController = MVC.Controller.extend('model_generator',{
    submit: function(params){
        params.event.kill();
        this.class_name = params.element.model_name.value;
        this.name = MVC.String.classize(this.class_name);
		this.application_name = document.getElementById('application').innerHTML;
		this.type = params.element.model_type.value;
		
		// create the model file
        var res = new MVC.View({absolute_url: 'command/generators/model.ejs'}).render(this);
        mozillaSaveFile(MVC.file_base+"\\models\\"+this.class_name+".js", res)
		
		// write the model include back to the app file
		add_path('models', MVC.file_base+"\\apps\\"+this.application_name+".js", this.class_name);
		
		// reload the app
		load_frame(this.application_name);
    }
});

UnitTestGeneratorController = MVC.Controller.extend('unit_test_generator',{
    submit: function(params){
        params.event.kill();
        this.class_name = params.element.unit_test_name.value;
		this.application_name = document.getElementById('application').innerHTML;
		
		// create the test file
        var res = new MVC.View({absolute_url: 'command/generators/unit_test.ejs'}).render(this);
        mozillaSaveFile(MVC.file_base+"\\test\\unit\\"+this.class_name+"_test.js", res)
		
		// write the test include back to the app file
		add_path('unit_tests', MVC.file_base+"\\apps\\"+this.application_name+"_test.js", this.class_name);
		
		// reload the app
		load_frame(this.application_name);
    }
});

FunctionalTestGeneratorController = MVC.Controller.extend('functional_test_generator',{
    submit: function(params){
        params.event.kill();
        this.class_name = params.element.view_name.value;
		this.application_name = document.getElementById('application').innerHTML;
		
		// create the test file
        var res = new MVC.View({absolute_url: 'command/generators/functional_test.ejs'}).render(this);
        mozillaSaveFile(MVC.file_base+"\\test\\functional\\"+this.class_name+"_test.js", res)
		
		// write the test include back to the app file
		add_path('functional_tests', MVC.file_base+"\\apps\\"+this.application_name+"_test.js", this.class_name);
		
		// reload the app
		load_frame(this.application_name);
    }
});

ViewGeneratorController = MVC.Controller.extend('view_generator',{
    submit: function(params){
        params.event.kill();
        var view_name = params.element.view_name.value;
		this.application_name = document.getElementById('application').innerHTML;
		var folder_name = params.element.view_folder.value;
		var view_path = folder_name+'/'+view_name;
		
		// create the view
        var res = new MVC.View({absolute_url: 'command/generators/view.ejs'}).render(this);
        mozillaSaveFile(MVC.file_base+"\\views\\"+folder_name+"\\"+view_name+".ejs", res);
		
		// write the view include back to the app file
		add_path('views', MVC.file_base+"\\apps\\"+this.application_name+".js", view_path);
		
		// reload the app
		load_frame(this.application_name);
    }
});

var add_include = function(include_type, file, file_to_add) {
	return modify_includes(include_type, file, file_to_add, true);
}

var remove_include = function(include_type, file, file_to_remove) {
	return modify_includes(include_type, file, file_to_remove, false);
}

var modify_includes = function(include_type, file, file_to_check, add) {
	var regexp_include = new RegExp("include\\."+include_type+"\\((.*)\\)");
	var str = "include."+include_type+"(";
	var items = list_of_items(include_type, file);
	var name_arr = [];
	for(var i=0; i<items.length; i++){
		if(items[i] != file_to_check)
			name_arr.push("'"+items[i]+"'");
	}
	if(add)
		name_arr.push("'"+file_to_check+"'");
	
	str += name_arr.join(',');
	str += ')';
	return file.replace(regexp_include,str);
}

var add_path = function(include_type, file_path, file_to_add) {
    var file = mozillaReadFile(file_path);
	var str = add_include(include_type, file, file_to_add);
	mozillaSaveFile(file_path, str  );
}

var remove_path = function(include_type, file_path, file_to_remove) {
    var file = mozillaReadFile(file_path);
	var str = remove_include(include_type, file, file_to_remove);
	mozillaSaveFile(file_path, str);
}

var list_of_items = function(include_type, file) {
	var name_arr = [];
	var regexp_include = new RegExp("include\\."+include_type+"\\((.*)\\)");
	var regexp_items = /\'([\w|\/]+)\'/g;
	var match_arr = [];
	var match = file.match(regexp_include);
	while(match_arr = regexp_items.exec(match[1])) {
		if(match_arr[1])
				name_arr.push(match_arr[1]);
	}
	return name_arr;
}

ProjectsController = MVC.Controller.extend('projects',{
    click: function(params){
		load_frame(params.element.innerHTML);
    },
	mouseover: function(params){
		params.element.style.backgroundColor = 'gray';
	},
	mouseout: function(params){
		params.element.style.backgroundColor = '';
	}
});

NewAppController = MVC.Controller.extend('new_app',{
	click: function(params) {
		document.getElementById('render_to').innerHTML = 
			new MVC.View({absolute_url: 'command/views/new_app.ejs'}).render(this);
	},
	mouseover: function(params) {
		params.element.style.backgroundColor = 'green';
	},
	mouseout: function(params) {
		params.element.style.backgroundColor = '';
	}
});

ControllersController = MVC.Controller.extend('controllers',{
    change: function(params){
		this.application_name = document.getElementById('application').innerHTML;
		this.checked = params.element.firstChild.checked;
		if(this.checked)
			add_path('controllers', MVC.file_base+"\\apps\\"+this.application_name+".js", params.element.lastChild.nodeValue);
		else
			remove_path('controllers', MVC.file_base+"\\apps\\"+this.application_name+".js", params.element.lastChild.nodeValue);
	}
});

ModelsController = MVC.Controller.extend('models',{
    change: function(params){
		this.application_name = document.getElementById('application').innerHTML;
		this.checked = params.element.firstChild.checked;
		if(this.checked)
			add_path('models', MVC.file_base+"\\apps\\"+this.application_name+".js", params.element.lastChild.nodeValue);
		else
			remove_path('models', MVC.file_base+"\\apps\\"+this.application_name+".js", params.element.lastChild.nodeValue);
	}
});

ResourcesController = MVC.Controller.extend('resources',{
    change: function(params){
		this.application_name = document.getElementById('application').innerHTML;
		this.checked = params.element.firstChild.checked;
		if(this.checked)
			add_path('resources', MVC.file_base+"\\apps\\"+this.application_name+".js", params.element.lastChild.nodeValue);
		else
			remove_path('resources', MVC.file_base+"\\apps\\"+this.application_name+".js", params.element.lastChild.nodeValue);
	}
});

ViewsController = MVC.Controller.extend('views',{
    change: function(params){
		this.application_name = document.getElementById('application').innerHTML;
		this.checked = params.element.firstChild.checked;
		var dir_name = params.element.parentNode.previousSibling.previousSibling.innerHTML;
		var template_name = params.element.lastChild.nodeValue;
		var full_path = dir_name+'/'+template_name;
		if(this.checked)
			add_path('views', MVC.file_base+"\\apps\\"+this.application_name+".js", full_path);
		else
			remove_path('views', MVC.file_base+"\\apps\\"+this.application_name+".js", full_path);
	}
});

FunctionalTestsController = MVC.Controller.extend('functional_tests',{
    change: function(params){
		this.application_name = document.getElementById('application').innerHTML;
		this.checked = params.element.firstChild.checked;
		if(this.checked)
			add_path('functional_tests', MVC.file_base+"\\apps\\"+this.application_name+"_test.js", params.element.lastChild.nodeValue);
		else
			remove_path('functional_tests', MVC.file_base+"\\apps\\"+this.application_name+"_test.js", params.element.lastChild.nodeValue);
	}
});

UnitTestsController = MVC.Controller.extend('unit_tests',{
    change: function(params){
		this.application_name = document.getElementById('application').innerHTML;
		this.checked = params.element.firstChild.checked;
		if(this.checked)
			add_path('unit_tests', MVC.file_base+"\\apps\\"+this.application_name+"_test.js", params.element.lastChild.nodeValue);
		else
			remove_path('unit_tests', MVC.file_base+"\\apps\\"+this.application_name+"_test.js", params.element.lastChild.nodeValue);
	}
});

PluginsController = MVC.Controller.extend('plugins',{
    change: function(params){
		this.application_name = document.getElementById('application').innerHTML;
		this.checked = params.element.firstChild.checked;
		if(this.checked)
			add_path('plugins', MVC.file_base+"\\apps\\"+this.application_name+".js", params.element.lastChild.nodeValue);
		else
			remove_path('plugins', MVC.file_base+"\\apps\\"+this.application_name+".js", params.element.lastChild.nodeValue);
		// reload the app
		load_frame(this.application_name);
	}
});

PageGeneratorController = MVC.Controller.extend('page_generator',{
    submit: function(params){
        params.event.kill();
		this.application_name = document.getElementById('application').innerHTML;
		
		// calculate the path to jmvc/include.js from the html file
		var html_location = mozillaChooseFile();
		var absolute_path_to_include = MVC.file_base+"\\jmvc\\include.js";
		this.path_to_jmvc = path_between_files(html_location, MVC.file_base+"\\jmvc\\include.js");
		
		// save the html file
		var res = new MVC.View({absolute_url: 'command/generators/page.ejs'}).render(this);
        mozillaSaveFile(html_location, res);
    }
});

var path_between_files = function(path_from, path_to){
	var file2 = new MVC.File(path_to.replace(/\\/g, "/"));
	var file1_path = path_from.replace(/\\/g, "/");
	var file1_path_arr = file1_path.split("/");
	var file1 = file1_path_arr.slice(0,file1_path_arr.length-1).join("/");
	var final_path = file2.to_reference_from_same_domain(file1);
	return final_path;
}

ApplicationGeneratorController = MVC.Controller.extend('application_generator',{
    submit: function(params){
		params.event.kill();
        this.application_name = params.element.application_name.value;
		
		// calculate the path to jmvc/include.js from the html file
		var html_location = mozillaChooseFile();
		var absolute_path_to_include = MVC.file_base+"\\jmvc\\include.js";
		this.path_to_jmvc = path_between_files(html_location, MVC.file_base+"\\jmvc\\include.js");
		
		// save the html file
		var res = new MVC.View({absolute_url: 'command/generators/page.ejs'}).render(this);
        mozillaSaveFile(html_location, res);
		
		// save the application file
		var res = new MVC.View({absolute_url: 'command/generators/application.ejs'}).render(this);
        mozillaSaveFile(MVC.file_base+"\\apps\\"+this.application_name+".js", res  );
		
		// save the main controller
		var res = new MVC.View({absolute_url: 'command/generators/main_controller.ejs'}).render(this);
        mozillaSaveFile(MVC.file_base+"\\controllers\\main_controller.js", res  );
		
		// save the test file
		var res = new MVC.View({absolute_url: 'command/generators/test.ejs'}).render(this);
        mozillaSaveFile(MVC.file_base+"\\apps\\"+this.application_name+"_test.js", res  );
		
		// load the app
		load_frame(this.application_name);
    }
});