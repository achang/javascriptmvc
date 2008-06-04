ControllerGeneratorController = MVC.Controller.extend('controller_generator',{
    submit: function(params){
        params.event.kill();
        this.class_name = params.element.controller_name.value;
        this.name = MVC.String.classize(this.class_name)+'Controller';
        var res = new MVC.View({absolute_url: 'command/generators/controller.ejs'}).render(this);
        
        //save to ../controllers/ this.class_name
        
        mozillaSaveFile(MVC.file_base+"\\controllers\\"+this.class_name+"_controller.js", res  )
    }
});

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