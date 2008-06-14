AbstractProjectsController = MVC.Controller.extend({
    click: function(params){
		MVC.Appcreator.select(params.element.innerHTML);
    },
	mouseover: function(params){
		params.element.className += ' over';
	},
	mouseout: function(params){
		params.element.className = params.element.className.replace(/over/, '');
	}
});

ProjectsController = AbstractProjectsController.extend('projects');

NewAppController = AbstractProjectsController.extend('new_app',{
	click: function(params) {
		//this._super(params);
		document.getElementById('content').innerHTML = 
			new MVC.View({absolute_url: 'command/views/new_app.ejs'}).render(this);
		location.hash='#';
	}
});