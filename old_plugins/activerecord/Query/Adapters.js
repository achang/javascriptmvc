JMVC.GenericAdapter = Class.create();

JMVC.GenericAdapter.setup = function() {
	throw new JMVC.Error(new Error(), 'setup must be defined for adapters');
}

// boolean attribute that signifies whether setup has been performed on this adapter or not
JMVC.GenericAdapter.setup_complete = false;

JMVC.GenericAdapter.execute = function() {
	throw new JMVC.Error(new Error(), 'execute must be defined for adapters');
}

JMVC.ScaffoldAdapter = Class.create(JMVC.GenericAdapter);
// creates the permanent url to send requests to
JMVC.ScaffoldAdapter.setup = function(schema) {
	this.url = JMVC.QueryController.RESOURCE;
	this.packaged_url = JMVC.QueryController.RESOURCE+'/packaged';
}
JMVC.ScaffoldAdapter.execute = function(sql) {
    var postBody = this._create_postbody(sql);
	var theURL = this._create_url(sql);
    var req = new MVC.Ajax.Request(theURL, {asynchronous: false, method: "post", postBody: postBody});
    return eval(req.transport.responseText);
}
JMVC.ScaffoldAdapter.execute_asynchronous = function(sql, callback) {
    var postBody = this._create_postbody(sql);
	var theURL = this._create_url(sql);
	new MVC.Ajax.Request(theURL, {asynchronous: true, method: "post", postBody: postBody, onComplete: function(request) {
            return callback(eval(request.responseText));
        }.bind(this)
	});
}
JMVC.ScaffoldAdapter._create_postbody = function(sql) {
	if(typeof(sql) == 'object')
		sql=sql.toJSON();
	return 'request='+encodeURIComponent(sql);
}

JMVC.ScaffoldAdapter._create_url = function(sql) {
	if(typeof(sql) == 'object')
		return this.packaged_url;
	return this.url;
}

// setup, setup_complete, and execute methods must be defined
JMVC.TrimQueryAdapter = Class.create(JMVC.GenericAdapter);
// uses the database schema to create a schema in the form that trimquery requires
JMVC.TrimQueryAdapter.setup = function(schema) {
    var get_trimquery_column_type = function(type) {
        if(type == 'integer' || type=='boolean')
            return 'Number';
        else if (type == 'date' || type == 'datetime')
            return 'Datetime';
        return 'String';
    }
	for(var i=0; i<schema.tables.length; i++) {
		var table = schema.tables[i];
		var trimquery_schema = {};
	    for (var j=0; j<table.columns.length; j++) {
			var column = table.columns[j];
	        trimquery_schema[column.name] = {type: get_trimquery_column_type(column.type)};
	    }
	    this._data_schema[table.name] = trimquery_schema;
	}
	this.setup_complete = true;
}
// boolean attribute that signifies whether setup has been performed on this adapter or not
JMVC.TrimQueryAdapter.setup_complete = false;
// performs the query and returns results
JMVC.TrimQueryAdapter.execute = function(sql) {
    return this._data_provider.query(this._sqlPrepare(sql));
}
JMVC.TrimQueryAdapter._data_provider = {
    query : function(stmt) { 
        return stmt.filter(this.memoryData); 
    },
    memoryData : {}
}
/**
 * Stores the "schema" required by TrimQuery, which contains an object hashed 
 * by each table name, and objects for each field
 */ 
JMVC.TrimQueryAdapter._data_schema = [];
/**
 * Stores the query language for this model.
 */
JMVC.TrimQueryAdapter._model_query_lang = null;
/**
 * Gets the query language.  This might be moved to query.
 */
JMVC.TrimQueryAdapter._queryLang = function(forceReset) {
    if (!this._model_query_lang || forceReset == true) {
        this._model_query_lang = TrimPath.makeQueryLang(this._data_schema);
        this._sqlPrepare_cache = {};
    }
    return this._model_query_lang;
}
/**
 * Stores previously performed queries and their results for quick access
 */
JMVC.TrimQueryAdapter._sqlPrepare_cache = {};
/**
 * checks if query has been performed previously and returns cached results if so
 */
JMVC.TrimQueryAdapter._sqlPrepare = function(sql, sqlParams) {
    var key = sql + " -- " + sqlParams;
    if (this._sqlPrepare_cache[key] == null) {
        sqlPrepare_value = this._queryLang().parseSQL(sql, sqlParams);
        this._sqlPrepare_cache[key] = sqlPrepare_value;
    }
    return this._sqlPrepare_cache[key];
}