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
    };
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
};
// boolean attribute that signifies whether setup has been performed on this adapter or not
JMVC.TrimQueryAdapter.setup_complete = false;
// performs the query and returns results
JMVC.TrimQueryAdapter.execute = function(sql) {
    return this._data_provider.query(this._sqlPrepare(sql));
};
JMVC.TrimQueryAdapter._data_provider = {
    query : function(stmt) { 
        return stmt.filter(this.memoryData); 
    },
    memoryData : {}
};
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
};
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
};