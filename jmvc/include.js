/***
 * Include
 * 	Include adds other JavaScript files, and can be used to compress a project.
 * 
 */


(function(){
	
	//checks if included has been added, if it has, gets the next included file.
	if(typeof include != 'undefined'  && typeof include.end != 'undefined'){
		include.end();
		return;
	}
	//Saves root of the page that include is loaded on;
	var PAGE_ROOT = window.location.href;
	var last = PAGE_ROOT.lastIndexOf('/');
	if(last != -1) PAGE_ROOT = PAGE_ROOT.substring(0,last); // no ending /
	
	
	var INCLUDE_ROOT = '',
		INCLUDE_PATH = '', 
		first = true , 
		INCLUDE_regex = /include\.js/, 
		PACKER_OPTIONS = {base62: false, shrink_variables: true}, 
		first_wave_done = false,
		PACK_FOR_REMOTE = false,
		included_paths = [];
	var env = 'development', 
		production = '/javascripts/production.js', 
		cwd = '', 
		includes=[], 
		current_includes=[];
	var total = []; //used to store text
	//returns true if a path is absolute
	var is_absolute = function(path){
		return is_local_absolute(path) || is_domain_absolute(path);
	};
	var is_cross_domain = function(path){
		if(path.indexOf('/') == 0) return false;
		return (get_domain(location.href) != get_domain(path));
	};
	var is_local_absolute = function(path){
		return path.indexOf('/') == 0;
	};
	var is_domain_absolute = function(path){
		return path.indexOf('http') == 0 || path.indexOf('file://') == 0
	};
	var is_relative = function(path){
		return !is_absolute(path);
	};
	var get_domain = function(path){
		return path.split('/')[2];
	};
	var is_included = function(path){
		for(var i = 0; i < includes.length; i++){
			if(includes[i].absolute == path) return true;
		}
		for(var i = 0; i < current_includes.length; i++){
			if(current_includes[i].absolute == path) return true;
		}
		return false;
	};
	//joins 2 folders.  This takes into account things like ../../
	var join = function(first, second){
		if(second == '') return first.substr(0,first.length-1)
		var first_parts = first.split('/');
		first_parts.pop();
		var second_parts = second.split('/');
		var second_part = second_parts[0];
		while(second_part == '..' && second_parts.length > 0){
			second_parts.shift();
			first_parts.pop();
			second_part =second_parts[0];
		}
		return first_parts.concat(second_parts).join('/');
	}
	//find include and get its absolute path
	for(var i=0; i<document.getElementsByTagName("script").length; i++) {
		var src = document.getElementsByTagName("script")[i].src;
		if(src.match(INCLUDE_regex)){
			INCLUDE_PATH = src;
			if(!is_absolute(src) ) src = join(window.location.href, src);
			INCLUDE_ROOT = src.replace(INCLUDE_regex,'');
		}
			
	}
	/**
	 * includes a list of files like 'abc','def'
	 */
	include = function(){
		if(include.get_env()=='development' || include.get_env()=='compress'){
			for(var i=0; i < arguments.length; i++){
				var newInclude = arguments[i];
				if(typeof newInclude == 'string'){
					newInclude = {name: newInclude.indexOf('.js') == -1  ? newInclude+'.js' : newInclude};
				}
				
				if(newInclude.base62 == null)
					newInclude.base62 = PACKER_OPTIONS.base62;
				if(newInclude.shrink_variables == null)
					newInclude.shrink_variables = PACKER_OPTIONS.shrink_variables;
				include.add(newInclude);
			}
		}else{
			if(!first_wave_done) return; //if production isn't finished loading, don't add
			for(var i=0; i < arguments.length; i++){
				var newInclude = arguments[i];
				if(typeof newInclude == 'string'){
					newInclude = {name: newInclude};
				}
				if(newInclude.base62 == null)
					newInclude.base62 = PACKER_OPTIONS.base62;
				if(newInclude.shrink_variables == null)
					newInclude.shrink_variables = PACKER_OPTIONS.shrink_variables;
				setTimeout(function(){
					include.add(newInclude);
				}, 10);
				
			};
			return;
		}
		if(first && !navigator.userAgent.match(/Opera/)){
			first = false;
			insert(); //insert include tag
		}
	};
	
	
	/**
	 * Sets up the environment.
	 * @param {Object} environment - the environment the scripts are running in [deveopment,compress,production]
	 * @param {Object} production_name - where the production file should be looked for
	 * @param {Object} packer_options - optional object that sets default packing options {base62: true/false, shrink_variables: true/false }
	 */
	include.setup = function(options){
		options = options || {};
		if(options.env){
			env = options.env;
		}
		if(options.production)   production = options.production+(options.production.indexOf('.js') == -1 ? '.js' : '' );
		
		if(env == 'compress') include.compress_window = window.open(INCLUDE_ROOT+'compress.html', null, "width=600,height=680,scrollbars=no,resizable=yes");
		
		
		if(options.base62 != null)
			PACKER_OPTIONS.base62 = options.base62;
		if(options.shrink_variables != null)
			PACKER_OPTIONS.shrink_variables = options.shrink_variables;
		if(options.remote != null)
			PACK_FOR_REMOTE = options.remote;
		
		if(env == 'production' && ! navigator.userAgent.match(/Opera/)){
			document.write('<script type="text/javascript" src="'+include.get_production_name()+'"></script>');
			return;
		}
	};
	
	include.get_env = function() { return env;}
	include.get_production_name = function() { return production;}
	include.set_path = function(p) { 
		cwd = p;
	}
	include.get_path = function() { 
		if(PACK_FOR_REMOTE)
			return include.get_absolute_path();
		else
			return cwd;
	
	}
	
	include.get_absolute_path = function(){
		if(is_absolute(cwd)) return cwd;
		return join(PAGE_ROOT+'/',cwd);
	}
	
	
	
	/**
	 * Adds a file to the of objects to be included.  If it is not absolute, it adds the current path
	 * to the include path.
	 * @param {Object} newInclude
	 * {name: NAME, base62: true/false, shrink_variables: true/false }
	 */
	include.add = function(newInclude){
		var name = newInclude.name;
		if(first_wave_done){ //add right away!
			insert_head(name);
			return;
		}
		newInclude.name = include.normalize(  name  );
		//this doesn't take into account /file.js == mydomain.com/file.js
		newInclude.absolute = newInclude.name;
		if(is_relative(newInclude.absolute)){
			newInclude.absolute = join(include.get_absolute_path()+'/', name);
		}
		if(is_included(newInclude.absolute)) return;
		var ar = newInclude.name.split('/');
		ar.pop();
		newInclude.start = ar.join('/');
		current_includes.unshift(  newInclude );
	}
	include.normalize = function(path){
		var current_path = include.get_path();
		//if you are cross domain from the page, and providing a path that doesn't have an domain
		if(is_cross_domain(include.get_absolute_path()) && !is_domain_absolute(path) ){
			//if the path starts with /
			if(is_local_absolute(path) ){
				var domain_part = current_path.split('/').slice(0,3).join('/')
				path = domain_part+path;
			}else{ //otherwise
				path = join(current_path+'/', path);
			}
		}else if(current_path != '' && !is_absolute(path)){
			current_path.lastIndexOf('/') === current_path.length - 1
			path = join(current_path+(current_path.lastIndexOf('/') === current_path.length - 1 ? '' : '/'), path);
		}else if(current_path != '' && PACK_FOR_REMOTE && !is_domain_absolute(path)){
			var domain_part = current_path.split('/').slice(0,3).join('/')
			path = domain_part+path;
		}
		return path;
	}
	
	/**
	 * called after a file is loaded.  Then it takes the last one
	 * and loads it.  If it is the last one and it is in compression
	 * opens the compression page
	 */
	include.end = function(){
		includes = includes.concat(current_includes);
		var latest = includes.pop();
		
		if(!latest) {
			first_wave_done = true;
			if(include.get_env()=='compress'){
				//include.total = total;
				//if(! document.getElementById('_COMPRESS')){
				setTimeout( include.compress, 10 );
			}
			return;
		};
		current_includes = [];
		include.set_path(latest.start);
		
		if(include.get_env()=='compress'){
			latest.text = syncrequest(latest.name);
			total.push( latest);
		}
		if(latest.ignore){
			insert();
		}else
			insert(latest.name);
	}
	include.end_of_production = function(){
		first_wave_done = true;
	};
	include.compress = function(){
		if(include.compress_window)
			include.compress_window.compress(total, include.srcs, include.get_production_name())
		else
			alert("Your popup blocker is keeping the compressor from running.\n"+
			"Please allow popups for this page and refresh this page.")
	}
	
	/**
	 * This is for opera.  Call after all your includes.
	 */
	include.opera = function(){
		if(navigator.userAgent.match(/Opera/)){
			if(env == 'production')
				document.write('<script type="text/javascript" src="'+include.get_production_name()+'"></script>');
			else
				include.end();
		}
	};
	include.srcs = [];
	var insert_head = function(src){
		var script= document.createElement("script");
		script.type= "text/javascript";
		script.src= src;
		script.charset= "UTF-8";
		document.getElementsByTagName("head")[0].appendChild(script);
	}
	
	var insert = function(src){
		if(navigator.userAgent.match(/Safari/) ){
			if(src) {
				var script = script_tag();
				script.src=src+'?'+Math.random()
				document.body.appendChild(script)
			}
			var start = script_tag();
			start.src = INCLUDE_PATH+'?'+Math.random()
			document.body.appendChild(start)
	
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
				(src? '<script type="text/javascript" src="'+src+(true ? '': '?'+Math.random() )+'"></script>':'')+
				'<script type="text/javascript" src="'+INCLUDE_PATH+(navigator.userAgent.match(/Firefox/) ? '': '?'+Math.random() )+'"></script>'
			);
		}
	}
	var script_tag = function(){
		var start = document.createElement('script');
		start.type = 'text/javascript';
		return start;
	}
	
	var newRequest = function(){
	   var factories = [function() { return new XMLHttpRequest(); },function() { return new ActiveXObject("Msxml2.XMLHTTP"); },function() { return new ActiveXObject("Microsoft.XMLHTTP"); }];
	   for(var i = 0; i < factories.length; i++) {
	        try {
	            var request = factories[i]();
	            if (request != null)  return request;
	        }
	        catch(e) { continue;}
	   }
	}
	var syncrequest = function(path){
	   var request = newRequest();
	   request.open("GET", path, false);
	   try{request.send(null);}
	   catch(e){return null;}
	   if ( request.status == 404 || request.status == 2 ||(request.status == 0 && request.responseText == '') ) return null;
	   return request.responseText
	}
	
	//if(INCLUDE_ROOT.lastIndexOf('jmvc') !=-1){
	//	include(INCLUDE_ROOT+'jmvc')
	//}
	
	//JMVC stuff
	JMVC = function() {};
	JMVC.OPTIONS = {};
	JMVC.Test = {};
	
	//sets default app root to whatever page we are currently loading
	//can be changed by set application root
	(function() {
		var jmvc_root = INCLUDE_ROOT, 
			application_root = location.href.substring(0, location.href.lastIndexOf('/') )+ '/';
		JMVC.root = function(){
			return jmvc_root;
		};
		JMVC.set_application_root = function(path){
			application_root = path;
		};
		JMVC.get_application_root = function(){
			return application_root;
		};
	})();
	
	
	/**
	 * <p>Loads the correct version of JMVC.</p>
	 * <p>Saves the user defined app_init_func to be executed later (once JMVC files are included).</p>
	 */
	JMVC.Initializer = function(user_initialize_function) {
		if(include.get_path().lastIndexOf('/') == -1) {
			JMVC.set_application_root('');
		} else {
			var config_folder = include.get_path();
			JMVC.set_application_root(include.get_path().substring(0, config_folder.lastIndexOf('/')));
		}
		JMVC.user_initialize_function = user_initialize_function;
		include(JMVC.root()+'/framework');
	};
	
	
	include.plugin = function(plugin_name) {
		var current_path = include.get_path();
		include.set_path(JMVC.root());
		include('plugins/'+ plugin_name+'/setup');
		include.set_path(current_path);
	};
	
	include.plugins = function(){
		for(var i=0; i < arguments.length; i++)
			include.plugin(arguments[i]);
	};
	
	
	
})();