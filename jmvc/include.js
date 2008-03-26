/***
 * Include
 * 	Include adds other JavaScript files, and can be used to compress a project.
 * 
 */
(function(){
	
	//check if included has been added, if it has, gets the next included file.
	if(typeof include != 'undefined'  && typeof include.end != 'undefined'){
		include.end();
		return;
	} else if(typeof include != 'undefined' && typeof include.end == 'undefined') {
		throw("Include is defined as function or an element's id, please change it.")
	}
	//$MVC stuff
	$MVC = {
		OPTIONS: {},
		Test: {},
		_no_conflict: false,
		no_conflict: function(){ $MVC._no_conflict = true  },
		File: function(path){ this.path = path; },
		Initializer: function(user_initialize_function) {
			$MVC.user_initialize_function = user_initialize_function;
			include.set_path($MVC.root);
			include('framework');
		}
	};
	var File = $MVC.File;
	$MVC.File.prototype = {
		clean: function(){
			return this.path.match(/([^\?#]*)/)[1];
		},
		dir: function(){
			var last = this.clean().lastIndexOf('/');
			return last != -1 ? this.clean().substring(0,last) : this.clean()
		},
		domain: function(){ 
			if(this.path.indexOf('file:') == 0 ) return null;
			var http = this.path.match(/^(?:https?:\/\/)([^\/]*)/);
			return http ? http[1] : this.path.split('/')[2];
		},
		join_from: function( url){
			if(this.has_protocol){
				var u = new File(url);
				if(this.domain() && this.domain() == u.domain() ) 
					return this.after_domain();
				else if(this.domain() == u.domain()) { // we are from a file
					return this.to_reference_from_same_domain(url)
				}else
					return this.path;
			}else if(url == $MVC.page_dir){
				return this.path;
			}else{
				alert('fu')
			}
		},
		relative: function(){
			return path.match(/^(https?|file|\/)/) == null;
		},
		has_protocol: function(){
			return this.path.indexOf('http') == 0 || this.path.indexOf('file://') == 0;
		},
		after_domain: function(){
			return this.path.match(/(?:https?:\/\/[^\/]*)(.*)/)[1];
		},
		to_reference_from_same_domain: function(url){
			var parts = this.path.split('/');
			var other_parts = url.split('/');
			var result = '';
			while(parts.length > 0 && other_parts.length >0 && parts[0] == other_parts[0]){
				parts.shift(); other_parts.shift();
			}
			for(var i = 0; i< other_parts.length; i++) result += '../';
			return result+ parts.join('/');
		}
	};
	$MVC.Object = {extend: function(d, s) {
		  for (var property in s)
		    d[property] = s[property];
		  return d;
	}};
	
	
	$MVC.page_dir = new File(window.location.href).dir(); // the folder where this page is
	$MVC.root = null;										  //where JMVC is
	$MVC.include_path = null;								  //where include is
	$MVC.application_root = null;							  //where your application is, if different than jmvc
	
	
	
	
	//find include and get its absolute path
	for(var i=0; i<document.getElementsByTagName("script").length; i++) {
		var src = document.getElementsByTagName("script")[i].src;
		if(src.match(/include\.js/)){
			$MVC.include_path = src;
			var inc = new File(src); 
			$MVC.root = new File( inc.join_from( $MVC.page_dir ) ).dir();
			if(src.indexOf('?') != -1)
				$MVC.script_options = src.split('?')[1].split(',');
			
		}
	}
	
	
	//configurable options
	var options = {	remote: false, 
					env: 'development', 
					production: '/javascripts/production.js',
					base62: false, shrink_variables: true};
	
	// variables used while including
	var first = true , 
		first_wave_done = false, 
		included_paths = [],
		cwd = '', 
		includes=[], 
		current_includes=[],
		total = [];


	//helper functions
	var is_absolute = function(path){
		return path.match(/^(https?|file|\/)/) != null;
	};
	var is_cross_domain = function(path){
		if(path.indexOf('/') == 0) return false;
		return (get_domain(location.href) != get_domain(path));
	};
	var is_local_absolute = function(path){		return path.indexOf('/') == 0};
	var is_domain_absolute = function(path){ 	return path.match(/^(https?|file)/) != null};
	var is_relative = function(path){			return !is_absolute(path); };
	
	var get_domain = function(path){	
		if(path.indexOf('file:') == 0 ) return null;
		var http = path.match(/^(?:https?:\/\/)([^\/]*)/);
		return http ? http[1] : path.split('/')[2];
	};
	
	var is_included = function(path){
		for(var i = 0; i < includes.length; i++) if(includes[i].absolute == path) return true;
		for(var i = 0; i < current_includes.length; i++) if(current_includes[i].absolute == path) return true;
		for(var i = 0; i < total.length; i++) if(total[i].absolute == path) return true;
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

	var add_with_defaults = function(newInclude){
		if(typeof newInclude == 'string')
			newInclude = {path: newInclude.indexOf('.js') == -1  ? newInclude+'.js' : newInclude};
		$MVC.Object.extend( $MVC.Object.extend({},options), newInclude)
		include.add(newInclude);
	}
	
	
	
	
	
	/**
	 * includes a list of files like 'abc','def'
	 */
	include = function(){
		if(include.get_env().match(/development|compress|test/)){
			for(var i=0; i < arguments.length; i++)
				add_with_defaults(arguments[i]);
		}else{
			//if production isn't finished loading, don't add
			if(!first_wave_done) return; 
			for(var i=0; i < arguments.length; i++) add_with_defaults(arguments[i]);
			return;
		}
		if(first && !navigator.userAgent.match(/Opera/)){
			first = false;
			insert(); //insert include tag
		}
	};
	
$MVC.Object.extend(include,{
	setup: function(o){
		$MVC.Object.extend(options, o || {});
		// in case there is no .js
		options.production = options.production+(options.production.indexOf('.js') == -1 ? '.js' : '' );
		
		//open window for compress
		if(options.env == 'compress') include.compress_window = window.open($MVC.root+'/compress.html', null, "width=600,height=680,scrollbars=no,resizable=yes");
		
		if(options.env == 'production' && ! navigator.userAgent.match(/Opera/)){
			document.write('<script type="text/javascript" src="'+include.get_production_name()+'"></script>');
			return;
		}
	},
	get_env: function() { return options.env;},
	get_production_name: function() { return options.production;},
	set_path: function(p) { cwd = p; },
	get_path: function() { 
		if(options.remote)
			return include.get_absolute_path();
		else
			return cwd;
	},
	get_absolute_path: function(){
		if(is_absolute(cwd)) return cwd;
		return join($MVC.page_dir+'/',cwd);
	},
	add: function(newInclude){
		var path = newInclude.path;
		if(first_wave_done){ //add right away!
			insert_head(path);
			return;
		}
		newInclude.path = include.normalize(  path  );
		//this doesn't take into account /file.js == mydomain.com/file.js
		newInclude.absolute = newInclude.path;
		if(is_relative(newInclude.absolute)){
			newInclude.absolute = join(include.get_absolute_path()+'/', path);
		}
		if(is_included(newInclude.absolute)) return;
		var ar = newInclude.path.split('/');
		ar.pop();
		newInclude.start = ar.join('/');
		current_includes.unshift(  newInclude );
	},
	normalize: function(path){
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
		}else if(current_path != '' && options.remote && !is_domain_absolute(path)){
			var domain_part = current_path.split('/').slice(0,3).join('/')
			path = domain_part+path;
		}
		return path;
	},
	end: function(){
		includes = includes.concat(current_includes);
		var latest = includes.pop();
		if(!latest) {
			first_wave_done = true;
			if(include.get_env()=='compress') setTimeout( include.compress, 10 );
			return;
		};
		total.push( latest);
		current_includes = [];
		include.set_path(latest.start);
		
		if(include.get_env()=='compress'){
			latest.text = syncrequest(latest.path);
		}
		if(latest.ignore){
			insert();
		}else
			insert(latest.path);
	},
	end_of_production: function(){ first_wave_done = true; 
	},
	compress: function(){
		if(include.compress_window)
			include.compress_window.compress(total, include.srcs, include.get_production_name())
		else
			alert("Your popup blocker is keeping the compressor from running.\nPlease allow popups for this page and refresh this page.")
	},
	opera: function(){
		include.opera_called = true;
		if(navigator.userAgent.match(/Opera/)){
			if(options.env == 'production')
				document.write('<script type="text/javascript" src="'+include.get_production_name()+'"></script>');
			else
				include.end();
		}
	},
	opera_called : false,
	srcs: [],
	plugin: function(plugin_name) {
		var current_path = include.get_path();
		include.set_path($MVC.root);
		include('plugins/'+ plugin_name+'/setup');
		include.set_path(current_path);
	},
	plugins: function(){
		for(var i=0; i < arguments.length; i++) include.plugin(arguments[i]);
	}
})
	
	var head = function(){
		var d = document, de = d.documentElement;
		var heads = d.getElementsByTagName("head");
		if(heads.length > 0 ) return heads[0];
		var head = d.createElement('head');
		de.insertBefore(head, de.firstChild);
		return head;
	};
	var insert_head = function(src){
		var script= script_tag();
		script.src= src;
		script.charset= "UTF-8";
		head().appendChild(script);
	};
	var script_tag = function(){
		var start = document.createElement('script');
		start.type = 'text/javascript';
		return start;
	}
	var insert = function(src){
		if(navigator.userAgent.match(/Safari|Opera/) ){
			if(src) {
				var script = script_tag();
				script.src=src+'?'+Math.random()
				document.body.appendChild(script)
			}
			var start = script_tag();
			start.src = $MVC.include_path+'?'+Math.random()
			document.body.appendChild(start)
		}
		else
		{
			document.write(
				(src? '<script type="text/javascript" src="'+src+(true ? '': '?'+Math.random() )+'"></script>':'')+
				'<script type="text/javascript" src="'+$MVC.include_path+(navigator.userAgent.match(/Firefox/) ? '': '?'+Math.random() )+'"></script>'
			);
		}
	}
	
	//ajax
	var newRequest = function(){
	   var factories = [function() { return new XMLHttpRequest(); },function() { return new ActiveXObject("Msxml2.XMLHTTP"); },function() { return new ActiveXObject("Microsoft.XMLHTTP"); }];
	   for(var i = 0; i < factories.length; i++) {
	        try {
	            var request = factories[i]();
	            if (request != null)  return request;
	        }
	        catch(e) { continue;}
	   }
	};
	var syncrequest = function(path){
	   var request = newRequest();
	   request.open("GET", path, false);
	   try{request.send(null);}
	   catch(e){return null;}
	   if ( request.status == 404 || request.status == 2 ||(request.status == 0 && request.responseText == '') ) return null;
	   return request.responseText
	};
	
	include.app = function(f){
		return function(){
			for(var i=0; i< arguments.length; i++) arguments[i] = f(arguments[i]);
			return include.apply(null, arguments);
		}
	};
	
	include.controllers = include.app(function(i){return 'controllers/'+i+'_controller'});
	include.models = include.app(function(i){return 'models/'+i});
	include.resources = include.app(function(i){return 'resources/'+i});
	

	
	if($MVC.script_options){
		$MVC.application_root =  $MVC.root.replace(/jmvc$/,'');
		if($MVC.script_options.length > 1){
			include.setup({env: $MVC.script_options[1], production: $MVC.application_root+'apps/'+$MVC.script_options[0]+'_production'})
		}
		if($MVC.script_options[1] == 'test')
			include.plugins('test');

		include($MVC.application_root+'apps/'+$MVC.script_options[0]);
		
		include.opera();
	}
	
	if(navigator.userAgent.match(/Opera/)){
		setTimeout(function(){
			if(!include.opera_called){
				alert("You must call include.opera() after your includes if you want to support opera!");
			};
		}, 10000);
	}
	
})();