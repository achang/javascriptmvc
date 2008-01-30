// setup, setup_complete, and execute methods must be defined
JMVC.GearsAdapter = Class.create(JMVC.GenericAdapter);
// uses the database schema to create a schema in the form that trimquery requires
JMVC.GearsAdapter.setup = function(schema) {
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
JMVC.GearsAdapter.setup_complete = false;
// performs the query and returns results
JMVC.GearsAdapter.execute = function(sql) {
    return this._data_provider.query(this._sqlPrepare(sql));
}