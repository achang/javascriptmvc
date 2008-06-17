// kills the event
// generates the file
// includes the generated file
// reloads the application
AbstractGeneratorController = MVC.Controller.extend({
    submit: function(params){
        params.event.kill();
		params.including_file_suffix = params.including_file_suffix || '';
		this.application_name = MVC.current_application;
		if(!params.including_file) params.including_file = this.class_name;
		
		// generates the file
        var res = new MVC.View({absolute_url: 'command/generators/'+params.generating_file+'.ejs'}).render(this);
        Mozilla.saveFile(MVC.Path.join(MVC.file_base,params.generated_file_path), res)
		
		// write the include back to the app file
		if(params.including_file_suffix == '_test')
			MVC.Path.add_path(params.generating_file.pluralize(), MVC.testfile_path, 
				params.including_file);
		else
			MVC.Path.add_path(params.generating_file.pluralize(), MVC.appfile_path, 
				params.including_file);
		
		// reload the app
		MVC.Appcreator.Iframe.load_iframe(this.application_name);
    }
});

ControllerGeneratorController = AbstractGeneratorController.extend('controller_generator',{
    submit: function(params){
        this.class_name = params.element.controller_name.value;
        this.name = MVC.String.classize(this.class_name)+'Controller';
		this.application_name = MVC.current_application;
		params.generating_file = 'controller';
		params.generated_file_path = MVC.Path.join("controllers",this.class_name+"_controller.js");
		
		// create the functional test file
        var res = new MVC.View({absolute_url: 'command/generators/controller_test.ejs'}).render(this);
        Mozilla.saveFile(MVC.Path.join(MVC.file_base,"test","functional",this.class_name+"_controller_test.js"), res  );
		
		// write the controller test include back to the test file
		MVC.Path.add_path('functional_tests', MVC.testfile_path, this.class_name+'_controller');
		
		// create the view folder
		Mozilla.createDirectory(MVC.Path.join(MVC.file_base,"views",this.class_name));
		
		this._super(params);
    }
});

UnitTestGeneratorController = AbstractGeneratorController.extend('unit_test_generator',{
    submit: function(params){
        this.class_name = params.element.unit_test_name.value;
		params.generating_file = 'unit_test';
		params.generated_file_path = MVC.Path.join("test","unit",this.class_name+"_test.js");
		params.including_file_suffix = '_test';
		this._super(params);
    }
});

ModelGeneratorController = AbstractGeneratorController.extend('model_generator',{
    submit: function(params){
        this.class_name = params.element.model_name.value;
        this.name = MVC.String.classize(this.class_name);
		this.type = params.element.model_type.value;
		params.generating_file = 'model';
		params.generated_file_path = MVC.Path.join("models",this.class_name+".js");
		this._super(params);
    }
});

FunctionalTestGeneratorController = AbstractGeneratorController.extend('functional_test_generator',{
    submit: function(params){
        this.class_name = params.element.functional_test_name.value;
		params.generating_file = 'functional_test';
		params.generated_file_path = MVC.Path.join("test","functional",this.class_name+"_test.js");
		params.including_file_suffix = '_test';
		this._super(params);
    }
});

PageGeneratorController = MVC.Controller.extend('page_generator',{
    submit: function(params){
        params.event.kill();
		this.application_name = this.application_name || MVC.current_application;
		
		// calculate the path to jmvc/include.js from the html file
		var html_location = Mozilla.chooseFile(this.application_name+".html");
		
		// if no file is chosen, skip creating the html file
		if (html_location) {
			var absolute_path_to_include = MVC.Path.join(MVC.file_base,"jmvc","include.js");
			this.path_to_jmvc = new MVC.File(html_location).path_to_file(MVC.Path.join(MVC.file_base,"jmvc","include.js"));
			
			// save the html file
			var res = new MVC.View({
				absolute_url: 'command/generators/page.ejs'
			}).render(this);
			Mozilla.saveFile(html_location, res);
            var pages = MVC.Path.join(MVC.file_base,"apps",this.application_name,"pages.html");
            var old =  Mozilla.readFile(pages)
            
            Mozilla.saveFile(pages, old+"<a href='"+html_location+"'>"+html_location.substr(-20)+"</a>\n" , true );
            
		}
    }
});

ApplicationGeneratorController = PageGeneratorController.extend('application_generator',{
    submit: function(params){
		this.application_name = params.element.application_name.value;
		
		
		// save the application file
		var res = new MVC.View({absolute_url: 'command/generators/application.ejs'}).render(this);
        Mozilla.saveFile(MVC.Path.join(MVC.file_base,"apps",this.application_name+".js"), res  );
		
		// save the main controller
		var res = new MVC.View({absolute_url: 'command/generators/main_controller.ejs'}).render(this);
        Mozilla.saveFile(MVC.Path.join(MVC.file_base,"controllers",this.application_name+"_controller.js"), res  );
		
		// create the compression folder
		Mozilla.createDirectory(MVC.Path.join(MVC.file_base,"apps",this.application_name));
		
		// save the compression script
		var res = new MVC.View({absolute_url: 'command/generators/compress_script.ejs'}).render(this);
        Mozilla.saveFile(MVC.Path.join(MVC.file_base,"apps",this.application_name,"compress.js"), res  );
		
		// save the compression page
		var res = new MVC.View({absolute_url: 'command/generators/compress_page.ejs'}).render(this);
        var loc = MVC.Path.join(MVC.file_base,"apps",this.application_name,"index.html")
        Mozilla.saveFile(loc, res  );
		
        Mozilla.saveFile(MVC.Path.join(MVC.file_base,"apps",this.application_name,"pages.html"), "<a href='"+loc+"'>"+loc.substr(-20)+"</a>\n"  );
        
		// save the test file
		var res = new MVC.View({absolute_url: 'command/generators/test.ejs'}).render(this);
        Mozilla.saveFile(MVC.Path.join(MVC.file_base,"apps",this.application_name,"test.js"), res  );
		
        
        this._super(params);
		// reload the project tabs
		MVC.Controller.dispatch('main','load',{});
		
		MVC.Appcreator.select(this.application_name);
		
		// select the new project
		var uls = document.getElementsByTagName('li');
		for(var i=0; i<uls.length; i++){
			if(uls[i].innerHTML == this.application_name)
				uls[i].className = 'selected';
		}
		MVC.current_application = 
		
		// load the app
		MVC.Appcreator.Iframe.load_iframe(this.application_name);
    }
});
