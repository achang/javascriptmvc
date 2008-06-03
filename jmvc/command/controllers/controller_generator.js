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
    }
});


ApplicationGeneratorController = MVC.Controller.extend('application_generator',{
    submit: function(params){
        //params.event.kill();
        this.application_name = params.element.application_name.value;
        var res = new MVC.View({absolute_url: 'command/generators/application.ejs'}).render(this);
        
        //save to ../controllers/ this.class_name
        
        mozillaSaveFile(MVC.file_base+"\\apps\\"+this.class_name+"_controller.js", res  );
    }
});