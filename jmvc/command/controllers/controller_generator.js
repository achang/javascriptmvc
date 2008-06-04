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
	var regexp = new RegExp("include\\."+include_type+"\\((?:\\'(.*)\\')*\\)");
	var regexp2 = new RegExp("include\\."+include_type+"\\((\\'.*\\')*\\)");
	var match = file.match(regexp);
	if(match)
		for (var i=1; i<match.length; i++) {
			if(match[i] != file_to_add)
				name_arr.push("'"+match[i]+"'");
		}
	name_arr.push("'"+file_to_add+"'");
	str += name_arr.join(',');
	str += ')';
	return file.replace(regexp2,str);
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
		add_path('controllers', MVC.file_base+"\\apps\\"+this.application_name+".js", params.element.lastChild.nodeValue);
	}
});

ModelsController = MVC.Controller.extend('models',{
    change: function(params){
		this.application_name = document.getElementById('application').innerHTML;
		add_path('models', MVC.file_base+"\\apps\\"+this.application_name+".js", params.element.lastChild.nodeValue);
	}
});

ResourcesController = MVC.Controller.extend('resources',{
    change: function(params){
		this.application_name = document.getElementById('application').innerHTML;
		add_path('resources', MVC.file_base+"\\apps\\"+this.application_name+".js", params.element.lastChild.nodeValue);
	}
});

ViewsController = MVC.Controller.extend('views',{
    change: function(params){
		this.application_name = document.getElementById('application').innerHTML;
		add_path('views', MVC.file_base+"\\apps\\"+this.application_name+".js", params.element.lastChild.nodeValue);
	}
});

FunctionalTestsController = MVC.Controller.extend('functional_tests',{
    change: function(params){
		this.application_name = document.getElementById('application').innerHTML;
		add_path('functional_tests', MVC.file_base+"\\app\\"+this.application_name+"_test.js", params.element.lastChild.nodeValue);
	}
});

UnitTestsController = MVC.Controller.extend('unit_tests',{
    change: function(params){
		this.application_name = document.getElementById('application').innerHTML;
		add_path('unit_tests', MVC.file_base+"\\app\\"+this.application_name+"_test.js", params.element.lastChild.nodeValue);
	}
});

PluginsController = MVC.Controller.extend('plugins',{
    change: function(params){
		this.application_name = document.getElementById('application').innerHTML;
		add_path('plugins', MVC.file_base+"\\apps\\"+this.application_name+".js", params.element.lastChild.nodeValue);
	}
});


ApplicationGeneratorController = MVC.Controller.extend('application_generator',{
    submit: function(params){
		params.event.kill();
        this.application_name = params.element.application_name.value;
		var res = new MVC.View({absolute_url: 'command/generators/application.ejs'}).render(this);
        mozillaSaveFile(MVC.file_base+"\\apps\\"+this.application_name+".js", res  );
		var res = new MVC.View({absolute_url: 'command/generators/test.ejs'}).render(this);
        mozillaSaveFile(MVC.file_base+"\\apps\\"+this.application_name+"_test.js", res  );
		load_frame(this.application_name);
    }
});