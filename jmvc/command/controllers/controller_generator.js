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

var add_path = function(include_type, file_path, file_to_add) {
    var file = mozillaReadFile(file_path);
	var str = add_include(include_type, file, file_to_add);
	mozillaSaveFile(file_path, str  );
}

var add_include = function(include_type, file, file_to_add) {
	var str = "include."+include_type+"(";
	var name_arr = [];
	var regexp_include = new RegExp("include\\."+include_type+"\\((.*)\\)");
	var regexp_items = /\'([\w|\/]+)\'/g;
	var match_arr = [];
	var match = file.match(regexp_include);
	while(match_arr = regexp_items.exec(match[1])) {
		if(match_arr[1] && match_arr[1] != file_to_add)
				name_arr.push("'"+match_arr[1]+"'");
	}
	name_arr.push("'"+file_to_add+"'");
	str += name_arr.join(',');
	str += ')';
	return file.replace(regexp_include,str);
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

var remove_include = function(include_type, file, file_to_remove) {
	var str = "include."+include_type+"(";
	var name_arr = [];
	var regexp_include = new RegExp("include\\."+include_type+"\\((.*)\\)");
	var regexp_items = /\'([\w|\/]+)\'/g;
	var match_arr = [];
	var match = file.match(regexp_include);
	while(match_arr = regexp_items.exec(match[1])) {
		if(match_arr[1] && match_arr[1] != file_to_remove)
				name_arr.push("'"+match_arr[1]+"'");
	}
	str += name_arr.join(',');
	str += ')';
	return file.replace(regexp_include,str);
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
		var full_path = dir_name+'/'+template_name
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


ApplicationGeneratorController = MVC.Controller.extend('application_generator',{
    submit: function(params){
		params.event.kill();
        this.application_name = params.element.application_name.value;
		
		// calculate the path to jmvc/include.js from the html file
		this.html_location = mozillaChooseFile();
		var absolute_path_to_include = MVC.file_base+"\\jmvc\\include.js";
		
		var file2 = new MVC.File(absolute_path_to_include.replace(/\\/g, "/"));
		var file1_path = this.html_location.replace(/\\/g, "/");
		var file1_path_arr = file1_path.split("/");
		var file1 = file1_path_arr.slice(0,file1_path_arr.length-1).join("/");
		this.path_to_jmvc = file2.to_reference_from_same_domain(file1);
		
		// save the html file
		var res = new MVC.View({absolute_url: 'command/generators/page.ejs'}).render(this);
        mozillaSaveFile(this.html_location, res);
		
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