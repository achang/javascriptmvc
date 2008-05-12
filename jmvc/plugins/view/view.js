/*--------------------------------------------------------------------------
 *  MVC.View - Embedded JavaScript, version 0.1.0
 *  Copyright (c) 2007 Edward Benson
 *  http://www.edwardbenson.com/projects/MVC.View
 *  ------------------------------------------------------------------------
 *
 *  EJS is freely distributable under the terms of an MIT-style license.
 *
 *  EJS is a client-side preprocessing engine written in and for JavaScript.
 *  If you have used PHP, ASP, JSP, or ERB then you get the idea: code embedded
 *  in <% // Code here %> tags will be executed, and code embedded in <%= .. %> 
 *  tags will be evaluated and appended to the output. 
 * 
 *  This is essentially a direct JavaScript port of Masatoshi Seki's erb.rb 
 *  from the Ruby Core, though it contains a subset of ERB's functionality. 
 * 
 * 
 *  Usage:
 *      // source should be either a string or a DOM node whose innerHTML
 *      // contains EJB source.
 *  	var source = "<% var ejb="EJB"; %><h1>Hello, <%= ejb %>!</h1>"; 
 *      var compiler = new MVC.View.Compiler(source);		
 *	    compiler.compile();	
 *	    var output = eval(compiler.out);
 *      alert(output); // -> "<h1>Hello, EJB!</h1>"
 *       
 *  For a demo:      see demo.html
 *  For the license: see license.txt
 *
 *--------------------------------------------------------------------------*/


MVC.View = function( options ){
	this.set_options(options);
	if(options.precompiled){
		this.template = {};
		this.template.process = options.precompiled;
		MVC.View.update(this.name, this);
		return;
	}
	
	if(options.url){
		options.url = MVC.root.join('views/'+options.url+ (options.url.match(/\.ejs/) ? '' : '.ejs' )) ;
		var template = MVC.View.get(options.url, this.cache);
		if (template) return template;
	    if (template == MVC.View.INVALID_PATH) return null;
		this.text = new MVC.Ajax(options.url+(this.cache ? '' : '?'+Math.random() ), {asynchronous: false, method: 'get', use_fixture: false}).transport.responseText;
		
		if(this.text == null){
			//MVC.View.update(options.url, this.INVALID_PATH);
			throw 'There is no template at '+options.url;
		}
		this.name = options.url;
	}else if(options.element)
	{
		if(typeof options.element == 'string'){
			var name = options.element;
			options.element = MVC.$E(  options.element );
			if(options.element == null) throw name+'does not exist!';
		}
		if(options.element.value){
			this.text = options.element.value;
		}else{
			this.text = options.element.innerHTML;
		}
		this.name = options.element.id;
		this.type = '[';
	}
	var template = new MVC.View.Compiler(this.text, this.type);

	template.compile(options);

	
	MVC.View.update(this.name, this);
	this.template = template;
};
MVC.View.prototype = {
	render : function(object){
		object = object || {};
		var v = new MVC.View.Helpers(object);
		return this.template.process.call(v, object,v);
	},
	out : function(){
		return this.template.out;
	},
	set_options : function(options){
		this.type = options.type != null ? options.type : MVC.View.type;
		this.cache = options.cache != null ? options.cache : MVC.View.cache;
		this.text = options.text != null ? options.text : null;
		this.name = options.name != null ? options.name : null;
	},
	// called without options, returns a function that takes the object
	// called with options being a string, uses that as a url
	// called with options as an object
	update : function(element, options){
		if(typeof element == 'string'){
			element = MVC.$E(element);
		}
		if(options == null){
			_template = this;
			return function(object){
				MVC.View.prototype.update.call(_template, element, object);
			};
		}
		if(typeof options == 'string'){
			params = {};
			params.url = options;
			_template = this;
			params.onComplete = function(request){
				var object = eval( "("+ request.responseText+")" );
				MVC.View.prototype.update.call(_template, element, object);
			};
			new MVC.Ajax(params.url, params)
		}else
		{
			element.innerHTML = this.render(options);
		}
	}
};


/* Make a split function like Ruby's: "abc".split(/b/) -> ['a', 'b', 'c'] */
String.prototype.rsplit = function(regex) {
	var item = this;
	var result = regex.exec(item);
	var retArr = new Array();
	while (result != null)
	{
		var first_idx = result.index;
		var last_idx = regex.lastIndex;
		if ((first_idx) != 0)
		{
			var first_bit = item.substring(0,first_idx);
			retArr.push(item.substring(0,first_idx));
			item = item.slice(first_idx);
		}		
		retArr.push(result[0]);
		item = item.slice(result[0].length);
		result = regex.exec(item);	
	}
	if (! item == '')
	{
		retArr.push(item);
	}
	return retArr;
};

/* Chop is nice to have too */
String.prototype.chop = function() {
	return this.substr(0, this.length - 1);
};

/* Adaptation from the Scanner of erb.rb  */
MVC.View.Scanner = function(source, left, right) {
	this.left_delimiter = 	left +'%';	//<%
	this.right_delimiter = 	'%'+right;	//>
	this.double_left = 		left+'%%';
	this.double_right = 	'%%'+right;
	this.left_equal = 		left+'%=';
	this.left_comment = 	left+'%#';
	if(left=='[')
		this.SplitRegexp = /(\[%%)|(%%\])|(\[%=)|(\[%#)|(\[%)|(%\]\n)|(%\])|(\n)/;
	else
		this.SplitRegexp = new RegExp('('+this.double_left+')|(%%'+this.double_right+')|('+this.left_equal+')|('+this.left_comment+')|('+this.left_delimiter+')|('+this.right_delimiter+'\n)|('+this.right_delimiter+')|(\n)') ;
	
	this.source = source;
	this.stag = null;
	this.lines = 0;
};

MVC.View.Helpers = function(data){
	this.data = data;
};
MVC.View.Helpers.prototype = {
	partial: function(options, data){
		if(!data) data = this.data;
		return new MVC.View(options).render(data);
	},
	to_text: function(input, null_text) {
	    if(input == null || input === undefined) return null_text || '';
	    if(input instanceof Date) return input.toDateString();
		if(input.toString) return input.toString().replace(/\n/g, '<br />').replace(/''/g, "'");
		return '';
	}
};


MVC.View.Scanner.to_text = function(input){
	if(input == null || input === undefined)
        return '';
    if(input instanceof Date)
		return input.toDateString();
	if(input.toString) 
        return input.toString();
	return '';
};

MVC.View.Scanner.prototype = {

  /* For each line, scan! */
  scan: function(block) {
     scanline = this.scanline;
	 regex = this.SplitRegexp;
	 if (! this.source == '')
	 {
	 	 var source_split = this.source.rsplit(/\n/);
	 	 for(var i=0; i<source_split.length; i++) {
		 	 var item = source_split[i];
			 this.scanline(item, regex, block);
		 }
	 }
  },
  
  /* For each token, block! */
  scanline: function(line, regex, block) {
	 this.lines++;
	 var line_split = line.rsplit(regex);
 	 for(var i=0; i<line_split.length; i++) {
	   var token = line_split[i];
       if (token != null) {
		   	try{
	         	block(token, this);
		 	}catch(e){
				throw {type: 'MVC.View.Scanner', line: this.lines};
			}
       }
	 }
  }
};

/* Adaptation from the Buffer of erb.rb  */
MVC.View.Buffer = function(pre_cmd, post_cmd) {
	this.line = new Array();
	this.script = "";
	this.pre_cmd = pre_cmd;
	this.post_cmd = post_cmd;
	for (var i=0; i<this.pre_cmd.length; i++)
	{
		this.push(pre_cmd[i]);
	}
};
MVC.View.Buffer.prototype = {
	
  push: function(cmd) {
	this.line.push(cmd);
  },

  cr: function() {
	this.script = this.script + this.line.join('; ');
	this.line = new Array();
	this.script = this.script + "\n";
  },

  close: function() {
	if (this.line.length > 0)
	{
		for (var i=0; i<this.post_cmd.length; i++)
		{
			this.push(pre_cmd[i]);
		}
		this.script = this.script + this.line.join('; ');
		line = null;
	}
  }
 	
};

/* Adaptation from the Compiler of erb.rb  */
MVC.View.Compiler = function(source, left) {
	this.pre_cmd = ['var ___ViewO = "";'];
	this.post_cmd = new Array();
	this.source = ' ';	
	if (source != null)
	{
		if (typeof source == 'string')
		{
		    source = source.replace(/\r\n/g, "\n");
            source = source.replace(/\r/g,   "\n");
			this.source = source;
		}else if (source.innerHTML){
			this.source = source.innerHTML;
		} 
		if (typeof this.source != 'string'){
			this.source = "";
		}
	}
	left = left || '<';
	var right = '>';
	switch(left) {
		case '[':
			right = ']';
			break;
		case '<':
			break;
		default:
			throw left+' is not a supported deliminator';
			break;
	}
	this.scanner = new MVC.View.Scanner(this.source, left, right);
	this.out = '';
};
MVC.View.Compiler.prototype = {
  compile: function(options) {
  	options = options || {};
	this.out = '';
	var put_cmd = "___ViewO += ";
	var insert_cmd = put_cmd;
	var buff = new MVC.View.Buffer(this.pre_cmd, this.post_cmd);		
	var content = '';
	var clean = function(content)
	{
	    content = content.replace(/\\/g, '\\\\');
        content = content.replace(/\n/g, '\\n');
        content = content.replace(/"/g,  '\\"'); //' Fixes Emacs syntax highlighting
        return content;
	};
	this.scanner.scan(function(token, scanner) {
		if (scanner.stag == null)
		{
			switch(token) {
				case '\n':
					content = content + "\n";
					buff.push(put_cmd + '"' + clean(content) + '";');
					buff.cr();
					content = '';
					break;
				case scanner.left_delimiter:
				case scanner.left_equal:
				case scanner.left_comment:
					scanner.stag = token;
					if (content.length > 0)
					{
						buff.push(put_cmd + '"' + clean(content) + '"');
					}
					content = '';
					break;
				case scanner.double_left:
					content = content + scanner.left_delimiter;
					break;
				default:
					content = content + token;
					break;
			}
		}
		else {
			switch(token) {
				case scanner.right_delimiter:
					switch(scanner.stag) {
						case scanner.left_delimiter:
							if (content[content.length - 1] == '\n')
							{
								content = content.chop();
								buff.push(content);
								buff.cr();
							}
							else {
								buff.push(content);
							}
							break;
						case scanner.left_equal:
							buff.push(insert_cmd + "(MVC.View.Scanner.to_text(" + content + "))");
							break;
					}
					scanner.stag = null;
					content = '';
					break;
				case scanner.double_right:
					content = content + scanner.right_delimiter;
					break;
				default:
					content = content + token;
					break;
			}
		}
	});
	if (content.length > 0)
	{
		// Chould be content.dump in Ruby
		buff.push(put_cmd + '"' + clean(content) + '"');
	}
	buff.close();
	this.out = buff.script + ";";
	var to_be_evaled = 'this.process = function(_CONTEXT,_VIEW) { try { with(_VIEW) { with (_CONTEXT) {'+this.out+" return ___ViewO;}}}catch(e){e.lineNumber=null;throw e;}};";
	
	try{
		eval(to_be_evaled);
	}catch(e){
		if(typeof JSLINT != 'undefined'){
			JSLINT(this.out);
			for(var i = 0; i < JSLINT.errors.length; i++){
				var error = JSLINT.errors[i];
				if(error.reason != "Unnecessary semicolon."){
					error.line++;
					var e = new Error();
					e.lineNumber = error.line;
					e.message = error.reason;
					if(options.url)
						e.fileName = options.url;
					throw e;
				}
			}
		}else{
			throw e;
		}
	}
  }
};


//type, cache, folder

MVC.View.config = function(options){
	MVC.View.cache = options.cache != null ? options.cache : MVC.View.cache;
	MVC.View.type = options.type != null ? options.type : MVC.View.type;
	var templates_directory = {}; //nice and private container
	
	MVC.View.get = function(path, cache){
		if(cache == false) return null;
		if(templates_directory[path]) return templates_directory[path];
  		return null;
	};
	
	MVC.View.update = function(path, template) { 
		if(path == null) return;
		templates_directory[path] = template ;
	};
	
	MVC.View.INVALID_PATH =  -1;
};
MVC.View.config( {cache: include.get_env() == 'production', type: '<' } );

MVC.View.PreCompiledFunction = function(name, f){
	new MVC.View({name: name, precompiled: f});
};


include.view = function(path){
	if(include.get_env() == 'development'){
		new MVC.View({url: path});
	}else if(include.get_env() == 'compress'){
		var oldp = include.get_path();
		include.set_path(MVC.root.join('views'));
		include({path: path, process: MVC.View.process_include, ignore: true});
		include.set_path(oldp);
		new MVC.View({url: path});
	}else{
		//production, do nothing!
	}
};

include.views = function(){
	for(var i=0; i< arguments.length; i++){
		include.view(arguments[i]+'.ejs');
	}
};

MVC.View.process_include = function(script){
	var view = new MVC.View({text: script.text});
	return 'MVC.View.PreCompiledFunction("'+script.path+
				'", function(_CONTEXT,_VIEW) { try { with(_VIEW) { with (_CONTEXT) {'+view.out()+" return ___ViewO;}}}catch(e){e.lineNumber=null;throw e;}})";
};

if(!MVC._no_conflict){
	View = MVC.View;
}
