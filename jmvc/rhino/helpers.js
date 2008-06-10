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
		txt = total[s].process ? total[s].process(total[s]) : total[s].text
		collection += "include.set_path('"+total[s].start+"')"+";\n"+txt + ";\n";
	}
	collection += "include.end_of_production();";
    return collection;
};