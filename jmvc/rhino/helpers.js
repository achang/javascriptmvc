MVCOptions.save = function(path, src){
    var out = new java.io.FileWriter( new java.io.File( path )),
            text = new java.lang.String( src || "" );
		out.write( text, 0, text.length() );
		out.flush();
		out.close();
};
MVCOptions.compress = function(src, path){
    return Packages.org.mozilla.javascript.tools.shell.Main.compress(src, path || include.get_production_name() ); 
};
MVCOptions.collect = function(total){
    var collection = '', txt;
	for(var s=0; s < total.length; s++){
		var includer = total[s];
        
        if(typeof includer == 'function'){
            collection += "include.next_function();\n"
        }else{
            txt = includer.process ? includer.process(includer) : includer.text
		    collection += "include.set_path('"+includer.start+"')"+";\n"+txt + ";\n";
        }
        
        
	}
	collection += "include.end_of_production();";
    return collection;
};


MVCOptions.collect_and_compress = function(total){
    var collection = '', script, txt, compressed;
	for(var s=0; s < total.length; s++){
		script = total[s];
        if(typeof script == 'function'){
            collection += "include.next_function();\n"
        }else{
            txt = script.process ? script.process(total[s]) : script.text;
    		compressed = script.compress == false ? txt : MVCOptions.compress(txt, script.path);
            collection += "include.set_path('"+script.start+"')"+";\n"+compressed + ";\n";
            
            
        }
	}
	collection += "include.end_of_production();";
    return collection;
}