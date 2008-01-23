(function(){
	if(typeof include != 'undefined'){
		include.end();
		return;
	}
	var INCLUDE_ROOT = '';
	var INCLUDE_PATH = '';
	var INCLUDE_regex = /include\.js$/;
	for(var i=0; i<document.getElementsByTagName("script").length; i++) {
		var src = document.getElementsByTagName("script")[i].src;
		if(src.match(INCLUDE_regex))
			INCLUDE_PATH = src;
			INCLUDE_ROOT = src.replace(INCLUDE_regex,'');
	}
	include = function(){
		if(include.get_env()=='development' || include.get_env()=='compress'){
			for(var i=0; i < arguments.length; i++){
				include.add(arguments[i]);
			}
		}
		else{
			if(!include.first) return;
			document.write('<script type="text/javascript" src="'+include.get_path()+include.get_production_name()+'"></script>');
			include.first = false;
			return;
		}
		if(include.first && !navigator.userAgent.match(/Opera/)){
			include.first = false;
			insert();
			
		}
	};
	include.absolute = function(){
		if(include.get_env()=='development' || include.get_env()=='compress'){
			for(var i=0; i < arguments.length; i++){
				include.add(arguments[i],'absolute');
			}
		}
		else{
			if(!include.first) return;
			document.write('<script type="text/javascript" src="'+include.get_path()+include.get_production_name()+'"></script>');
			include.first = false;
			return;
		}
		if(include.first && !navigator.userAgent.match(/Opera/)){
			include.first = false;
			insert();
			
		}
	}
	
	
	include.first = true;
	
	var env = 'development', path = '/public', production = '/javascripts/production.js', cwd = '', includes=[], current_includes=[];
	include.setup = function(environment, production_name, p){
		if(environment != 'development' && environment != 'production' && environment != 'compress'){
			alert('You are using an incorrect environment!  Only development, production, and compress are allowed.');
			return;
		}
		
		env = environment;
		if(p) p = path;
		if(production_name) {
			production = production_name+(production_name.indexOf('.js') == -1 ? '.js' : '' );
		}
		
		if(env == 'compress'){
			document.write(
			'<script type="text/javascript" src="'+INCLUDE_ROOT+'compress.js'+'"></script>');
		}
	}
	include.get_env = function() { return env;}
	include.get_production_name = function() { 
		
		return production;
	}
	include.set_path = function(p) { 
		cwd = p;
	}
	include.get_path = function() { return cwd;}
	
	include.add = function(name, type){
		name = ( name.indexOf('.js') == -1 ? name+'.js' : name );
		var ar = name.split('/');
		ar.pop();
		var newer_path = ar.join('/');
		var current_path = include.get_path()
		//set the path to the new object;
		if(current_path != '' && type != 'absolute'){
			newer_path = current_path+'/'+ newer_path;
			name = current_path+'/'+name;
		}
		
		current_includes.unshift(  {start: newer_path, name: name } );
	}
	
	include.end = function(){
		includes = includes.concat(current_includes);
		var latest = includes.pop();
		
		if(!latest) {
			if(include.get_env()=='compress'){
				include.total = total;
				document.body.innerHTML = 'Compressing ..'
				setTimeout( include.compress, 10 );
			}
			return;
		};

		current_includes = [];
		
		include.set_path(latest.start);
		insert(latest.name);

	}
	include.opera = function(){
		if(navigator.userAgent.match(/Opera/)){
			include.end();
		}
	}

var total = []	
	var insert = function(src){
		//if you are compressing, load, eval, and then call end and return.
		if(src && include.get_env()=='compress'){
			var text = JMVC.request(src);
			total.push( text);
			try{
			eval( "with(window){"+text+"}");
			}catch(e){
				//alert('Error with '+src)
			}
			include.end();
			return;
		}
		
		
		if(navigator.userAgent.match(/Safari/) ){
			var start = script_tag();
			start.src = INCLUDE_PATH+'?'+Math.random()
			document.body.appendChild(start)
	
			if(!src) return ;
			var script = script_tag();
			script.src=src+'?'+Math.random()
			document.body.appendChild(script)
	
		}else if(navigator.userAgent.match(/Opera/)){
			if(src) {
				var script = script_tag();
				script.src=src+'?'+Math.random()
				document.body.appendChild(script)
			}
			var start = script_tag();
			start.src = INCLUDE_PATH+'?'+Math.random()
			document.body.appendChild(start)
		}
		else
		{
			document.write(
				(src? '<script type="text/javascript" src="'+src+(false ? '': '?'+Math.random() )+'"></script>':'')+
				'<script type="text/javascript" src="'+INCLUDE_PATH+(navigator.userAgent.match(/Firefox/) ? '': '?'+Math.random() )+'"></script>'
			);
		}
	}
	var script_tag = function(){
		var start = document.createElement('script')
		start.type = 'text/javascript';
		return start;
	}
})();