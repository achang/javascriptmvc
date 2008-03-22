// setup, setup_complete, and execute methods must be defined
JMVC.GearsAdapter = Class.create(JMVC.GenericAdapter);
// uses the database schema to create a schema in the form that trimquery requires
JMVC.GearsAdapter.setup = function(schema) {
    var get_gears_column_type = function(type) {
        if(type == 'integer' || type=='boolean')
            return 'INTEGER';
        else if (type == 'date' || type == 'datetime')
            return 'DATETIME';
        return 'TEXT';
    };
	var db = google.gears.factory.create('beta.database', '1.0');
	db.open();
	for(var i=0; i<schema.tables.length; i++) {
		var table_name = schema.tables[i].name;
		var drop_sql = ['DROP TABLE IF EXISTS', table_name];
		var create_sql = ['CREATE TABLE IF NOT EXISTS', table_name];
		var columns_sql = [];
		for(var j=0; j<schema.tables[i].columns.length; j++) {
			var column_name = schema.tables[i].columns[j].name;
			var column_type = get_gears_column_type(schema.tables[i].columns[j].type);
			columns_sql.push(column_name+' '+column_type);
		}
		create_sql.push('('+columns_sql.join(', ')+')');
		var rs = db.execute(drop_sql.join(' '));
		rs.close();
		var rs = db.execute(create_sql.join(' '));
		rs.close();
	}
	this.setup_complete = true;
};
// boolean attribute that signifies whether setup has been performed on this adapter or not
JMVC.GearsAdapter.setup_complete = false;
// performs the query and returns results
JMVC.GearsAdapter.execute = function(sql) {
	var db = google.gears.factory.create('beta.database', '1.0');
	db.open();
	var rs = db.execute(sql);
	var objects = [];
	while (rs.isValidRow()) {
		var obj = {};
		var field_count = rs.fieldCount();
		for(var i=0; i<field_count; i++) {
			obj[rs.fieldName(i)] = rs.field(i);
		}
		objects.push(obj);
		rs.next();
	}
	rs.close();
    return objects;
};