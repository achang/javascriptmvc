
/*
 * JavaScriptMVC - include
 * (c) 2008 Jupiter ITS
 */

(function(){
	

if(typeof include != 'undefined' && typeof include.end != 'undefined'){
    return include.end();
}else if(typeof include != 'undefined' && typeof include.end == 'undefined')
	throw("Include is defined as function or an element's id!");

MVC = {
	OPTIONS: {},
	Test: {},
	Included: {controllers: [], resources: [], models: [], plugins: [], views: [], functional_tests: [], unit_tests: []},
	_no_conflict: false,
	no_conflict: function(){ MVC._no_conflict = true  },
	File: function(path){ this.path = path; },
	Initializer: function(f) {
		MVC.user_initialize_function = f;
		include.set_path(MVC.mvc_root);
		include('framework');
	},
	Runner: function(f){
		if(!window.in_command_window && !window._rhino)
			f();
	},
	Ajax: {},
	Browser: {
	    IE:     !!(window.attachEvent && !window.opera),
	    Opera:  !!window.opera,
	    WebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
	    Gecko:  navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') == -1,
	    MobileSafari: !!navigator.userAgent.match(/Apple.*Mobile.*Safari/)
	},
	mvc_root: null,
	include_path: null,
	root: null,
	Object:  { extend: function(d, s) { for (var p in s) d[p] = s[p]; return d;} },
	$E: function(id){ return typeof id == 'string' ? document.getElementById(id): id },
	app_name: 'app',
    get_random: function(length){
    	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    	var randomstring = '';
    	for (var i=0; i<length; i++) {
    		var rnum = Math.floor(Math.random() * chars.length);
    		randomstring += chars.substring(rnum,rnum+1);
    	}
        return randomstring;
    }
};
	
var File = MVC.File;
MVC.File.prototype = {
	clean: function(){
		return this.path.match(/([^\?#]*)/)[1];
	},
	dir: function(){
		var last = this.clean().lastIndexOf('/');
		return last != -1 ? this.clean().substring(0,last) : ''; //this.clean();
	},
	domain: function(){ 
		if(this.path.indexOf('file:') == 0 ) return null;
		var http = this.path.match(/^(?:https?:\/\/)([^\/]*)/);
		return http ? http[1] : null;
	},
	join: function(url){
		return new File(url).join_from(this.path);
	},
	join_from: function( url, expand){
		if(this.is_domain_absolute()){
			var u = new File(url);
			if(this.domain() && this.domain() == u.domain() ) 
				return this.after_domain();
			else if(this.domain() == u.domain()) { // we are from a file
				return this.to_reference_from_same_domain(url);
			}else
				return this.path;
		}else if(url == MVC.page_dir && !expand){
			return this.path;
		}else{
			if(url == '') return this.path.replace(/\/$/,'');
			var urls = url.split('/'), paths = this.path.split('/'), path = paths[0];
			if(url.match(/\/$/) ) urls.pop();
			while(path == '..' && paths.length > 0){
				paths.shift();
				urls.pop();
				path =paths[0];
			}
			return urls.concat(paths).join('/');
		}
	},
	relative: function(){		return this.path.match(/^(https?:|file:|\/)/) == null;},
	after_domain: function(){	return this.path.match(/(?:https?:\/\/[^\/]*)(.*)/)[1];},
	to_reference_from_same_domain: function(url){
		var parts = this.path.split('/'), other_parts = url.split('/'), result = '';
		while(parts.length > 0 && other_parts.length >0 && parts[0] == other_parts[0]){
			parts.shift(); other_parts.shift();
		}
		for(var i = 0; i< other_parts.length; i++) result += '../';
		return result+ parts.join('/');
	},
	is_cross_domain : function(){
		if(this.is_local_absolute()) return false;
		return this.domain() != new File(location.href).domain();
	},
	is_local_absolute : function(){	return this.path.indexOf('/') === 0},
	is_domain_absolute : function(){return this.path.match(/^(https?:|file:)/) != null}
};



MVC.page_dir = new File(window.location.href).dir();						  

//find include and get its absolute path
var scripts = document.getElementsByTagName("script");
for(var i=0; i<scripts.length; i++) {
	var src = scripts[i].src;
	if(src.match(/include\.js/)){
		MVC.include_path = src;
		MVC.mvc_root = new File( new File(src).join_from( MVC.page_dir ) ).dir();
		// added this to check for html files that are deeper inside the jmvc directory
		if(MVC.mvc_root.match(/\.\.$/)) var tmp = MVC.mvc_root+'/..';
		else var tmp = MVC.mvc_root.replace(/jmvc$/,'');
		if(tmp.match(/.+\/$/)) tmp = tmp.replace(/\/$/, '');
		MVC.root = new File(tmp);
		if(src.indexOf('?') != -1) MVC.script_options = src.split('?')[1].split(',');
	}
}


//configurable options
var options = {	remote: typeof MVCOptions == 'object' && MVCOptions.remote, 
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



var is_included = function(path){
	for(var i = 0; i < includes.length; i++) if(includes[i].absolute == path) return true;
	for(var i = 0; i < current_includes.length; i++) if(current_includes[i].absolute == path) return true;
	for(var i = 0; i < total.length; i++) if(total[i].absolute == path) return true;
	return false;
};

var add_with_defaults = function(inc){
	if(typeof inc == 'string') inc = {path: inc.indexOf('.js') == -1  ? inc+'.js' : inc};
	if(typeof inc != 'function'){
        inc.original_path = inc.path;
        inc = MVC.Object.extend( MVC.Object.extend({},options), inc);
    }
	include.add(inc);
};

include = function(){
	if(include.get_env().match(/development|compress|test/)){
		for(var i=0; i < arguments.length; i++) add_with_defaults(arguments[i]);
	}else{
		if(!first_wave_done) return; 
		for(var i=0; i < arguments.length; i++) add_with_defaults(arguments[i]);
		return;
	}
	if(first && !MVC.Browser.Opera){
		first = false;insert();
	}
};
	
MVC.Object.extend(include,{
	setup: function(o){
        MVC.Object.extend(options, o || {});

		options.production = options.production+(options.production.indexOf('.js') == -1 ? '.js' : '' );

		if(options.env == 'compress' && !window._rhino) include.compress_window = window.open(MVC.mvc_root+'/compress.html', null, "width=600,height=680,scrollbars=no,resizable=yes");
		if(options.env == 'test') include.plugins('test');
		if(options.env == 'production' && ! MVC.Browser.Opera && ! options.remote)
			return document.write('<script type="text/javascript" src="'+include.get_production_name()+'"></script>');
	},
	get_env: function() { return options.env;},
	get_production_name: function() { return options.production;},
	set_path: function(p) {cwd = p;},
	get_path: function() { 
		return options.remote ? include.get_absolute_path() : cwd;
	},
	get_absolute_path: function(){
		var fwd = new File(cwd);
		return fwd.relative() ? fwd.join_from(MVC.page_dir+'/', true) : cwd;
	},
	add: function(newInclude){
		if(typeof newInclude == 'function'){
            include.functions.push(newInclude);
            current_includes.unshift(  newInclude );
            return;
        }
        
        var path = newInclude.path;
        if(first_wave_done) return insert_head(path);
        
        
        
		var pf = new File(newInclude.path);
		newInclude.path = include.normalize(  path  );
		
		newInclude.absolute = pf.relative() ? pf.join_from(include.get_absolute_path(), true) : newInclude.path;
		if(is_included(newInclude.absolute)) return;
		var ar = newInclude.path.split('/');
		ar.pop();
		newInclude.start = ar.join('/');
		current_includes.unshift(  newInclude );
	},
	normalize: function(path){
		var current_path = include.get_path();
		//if you are cross domain from the page, and providing a path that doesn't have an domain
		
		var file = new File(path);
		if(new File(include.get_absolute_path()).is_cross_domain() && !file.is_domain_absolute() ){
			//if the path starts with /
			if( file.is_local_absolute() ){
				var domain_part = current_path.split('/').slice(0,3).join('/');
				path = domain_part+path;
			}else{ //otherwise
				path = file.join_from(current_path);
			}
		}else if(current_path != '' && file.relative()){
			path = file.join_from( current_path+(current_path.lastIndexOf('/') === current_path.length - 1 ? '' : '/')  );
		}else if(current_path != '' && options.remote && ! file.is_domain_absolute()){
			var domain_part = current_path.split('/').slice(0,3).join('/');
			path = domain_part+path;
		}
		return path;
	},
    close_time : function(){
        setTimeout(function(){ document.close(); },10)
    },
    close : function(){
        if(include.get_env()=='production') include.close_time();
        else    include._close= true;
    },
	end: function(){
        includes = includes.concat(current_includes);
		var latest = includes.pop();
		if(!latest) {
			first_wave_done = true;
			if(include.get_env()=='compress') setTimeout( include.compress, 10 );
            if(include._close){ 
                this.close_time();
            }
			return;
		};
		total.push( latest);
		current_includes = [];
        if(typeof latest == 'function'){
            latest();
            
            //if(include.get_env()=='compress'){
            //    latest.text = "include.next_function();"
            //}
            
            insert();
        }else{
            include.set_path(latest.start);
    		include.current = latest.path;
    		if(include.get_env()=='compress'){
                if(latest.ignore && typeof print != 'undefined'){
                    var parts = latest.path.split("/")
                     if(parts.length > 4) parts = parts.slice(parts.length - 4);
                     print("   "+parts.join("/"));
                }
                latest.text = include.request(latest.path);
            }
    		latest.ignore ? insert() : insert(latest.path);
        }
	},
	end_of_production: function(){ first_wave_done = true; },
	compress: function(){
		if(typeof MVCOptions == 'undefined' || !MVCOptions.compress_callback){
            include.compress_window  ? 
			include.compress_window.compress(total, include.srcs, include.get_production_name()) :
			alert("Your popup blocker is keeping the compressor from running.\nPlease allow popups and refresh this page.");
        }else{
            MVCOptions.compress_callback(total)
        }
	},
	opera: function(){
		include.opera_called = true;
		if(MVC.Browser.Opera && ! options.remote){
			options.env == 'production' ? document.write('<script type="text/javascript" src="'+include.get_production_name()+'"></script>') : include.end();
		}
	},
	opera_called : false,
	srcs: [],
	plugin: function(plugin_name) {
		MVC.Included.plugins.push(plugin_name);
		var current_path = include.get_path();
		include.set_path(MVC.mvc_root);
		include('plugins/'+ plugin_name+'/setup');
		include.set_path(current_path);
	},
	plugins: function(){
		for(var i=0; i < arguments.length; i++) include.plugin(arguments[i]);
	},
	app: function(f, included_array){
		return function(){
			
            
            var current_path = include.get_path();
		    include.set_path(MVC.apps_root || MVC.root.join('apps') );

            for (var i = 0; i < arguments.length; i++) {
				arguments[i] = f(arguments[i]);
				included_array.push(arguments[i].match(/[^\/\\]*$/)[0].replace(/_controller/,''));
			}
			include.apply(null, arguments);
            include.set_path(current_path);
		}
	},
    functions: [],
    next_function : function(){
        var func = include.functions.pop();
        if(func) func();
    }
});
	
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
};
var insert = function(src){

    if(! document.write){
        if(src){
            load(new MVC.File( src ).clean());
        }
        load( new MVC.File( MVC.include_path ).clean()  )
    }else if(MVC.Browser.Opera||MVC.Browser.Webkit){
		if(src) {
			var script = script_tag();
			script.src=src+'?'+MVC.random;
			document.body.appendChild(script);
		}
		var start = script_tag();
		start.src = MVC.include_path+'?'+MVC.random;
		document.body.appendChild(start);
	}else{
        document.write(
			(src? '<script type="text/javascript" src="'+src+(true ? '': '?'+MVC.random )+'"></script>':'')+
			'<script type="text/javascript" src="'+MVC.include_path+(MVC.Browser.Gecko ? '': '?'+MVC.random )+'"></script>'
		);
	}
};

MVC.random = MVC.get_random(6);

MVC.Ajax.factory = function(){ return window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();};
include.request = function(path){
   var request = MVC.Ajax.factory();
   request.open("GET", path, false);
   try{request.send(null);}
   catch(e){return null;}
   if ( request.status == 404 || request.status == 2 ||(request.status == 0 && request.responseText == '') ) return null;
   return request.responseText;
};
include.check_exists = function(path){		
	var xhr=MVC.Ajax.factory();
	try{ 
		xhr.open("HEAD", path, false);
		xhr.send(null); 
	} catch(e) { return false; }
	if ( xhr.status > 505 || xhr.status == 404 || xhr.status == 2 || 
		xhr.status == 3 ||(xhr.status == 0 && xhr.responseText == '') ) 
			return false;
    return true;
}



include.controllers = include.app(function(i){return '../controllers/'+i+'_controller'}, MVC.Included.controllers);
include.models = include.app(function(i){return '../models/'+i}, MVC.Included.models);
include.resources = include.app(function(i){return '../resources/'+i}, MVC.Included.resources);

if(MVC.script_options){
	MVC.apps_root =  MVC.root.join('apps')
	MVC.app_name = MVC.script_options[0];
    if(window._rhino)
        MVC.script_options[1] = 'compress'
	if(MVC.script_options.length > 1)	include.setup({env: MVC.script_options[1], production: MVC.apps_root+'/'+MVC.script_options[0]+'/production'});
	include(MVC.apps_root+'/'+MVC.script_options[0]);
	
    if(MVC.script_options[1] == 'test'){
         if(include.check_exists(MVC.apps_root+'/'+MVC.app_name+'/test.js')){
    		var path = include.get_path();
    		include.set_path(MVC.apps_root)
    		include(MVC.app_name+'/test')
    		include.set_path(path)
    	}else{
    		setTimeout(function(){
                MVC.Console.log("There is no application test file at:\n    \"apps/"+MVC.app_name+"/test.js\"\nUse it to include your test files.\n\nTest includes:\n    include.unit_tests('product')\n    include.functional_tests('widget')")
            },1000)
            
    	}
    }
   
    
    
    include.opera();
}
if(MVC.Browser.Opera) 
    setTimeout(function(){ if(!include.opera_called && !options.remote){ alert("You forgot include.opera().")}}, 10000);
})();