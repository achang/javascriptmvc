AbstractProjectsController = MVC.Controller.extend('abstract_projects',{
    click: function(params){
		var uls = document.getElementsByTagName('li');
		for(var i=0; i<uls.length; i++){
			if(uls[i].className.match(/project/) || uls[i].id == 'new_app'){
				uls[i].className = uls[i].className.replace(/selected/, '')
			}
		}
		params.element.className += ' selected';
    },
	mouseover: function(params){
		params.element.className += ' over';
	},
	mouseout: function(params){
		params.element.className = params.element.className.replace(/over/, '');
	}
});

ProjectsController = AbstractProjectsController.extend('projects',{
    click: function(params){
		this._super(params);
		MVC.Appcreator.Iframe.load_iframe(params.element.innerHTML);
    }
});

NewAppController = AbstractProjectsController.extend('new_app',{
	click: function(params) {
		this._super(params);
		document.getElementById('content').innerHTML = 
			new MVC.View({absolute_url: 'command/views/new_app.ejs'}).render(this);
	}
});