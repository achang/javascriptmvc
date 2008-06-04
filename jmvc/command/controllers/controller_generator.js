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
        var file = mozillaReadFile(MVC.file_base+"\\apps\\"+this.application_name+".js"  );
		var str = add_include('controllers', file, this.class_name);
		mozillaSaveFile(MVC.file_base+"\\apps\\"+this.application_name+".js", str  );
		
		// create the functional test file
        var res = new MVC.View({absolute_url: 'command/generators/controller_test.ejs'}).render(this);
        mozillaSaveFile(MVC.file_base+"\\test\\functional\\"+this.class_name+"_controller_test.js", res  );
    }
});

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