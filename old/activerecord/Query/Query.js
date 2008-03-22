JMVC.Query = function(sql) {
	this.sql = sql;
}

JMVC.Query.prototype = {
	// returns the type of the query, such as INSERT, SELECT, UPDATE, or DELETE
	query_type : function() {
		var sql_components = this.sql.split(/\s+/);
        return sql_components[0];
	},
	// if this.sql is an insert query, this will accept a column and value to insert into the query
	// returns the modified query
    add_pair_into_insert : function(column, value) {
		if(this.query_type() != 'INSERT')
			throw new JMVC.Error(new Error(), 'add_pair_into_insert called on a non-insert query');
        var insertion_regex = /\((.+)\)\s+VALUES\s+\((.+)\)/
        this.sql = this.sql.replace(insertion_regex, '($1'+', '+column+') VALUES ($2, '+value+')');
        return this.sql;
    },
	// returns the sql for this query stripped of whitespace
	// useful for comparing queries to see if they're the same
	stripped : function() {
		return this.sql.replace(/\s+/g, '');
	},
	// for a query that uses aliasing, this function returns a hash 
	// from the alias name to the table and column names represented
	alias_map : function() {
		var alias_map = {};
		var alias_regex = /(\w+\.\w+)\s+AS\s+(t\d+_c\d+)/ig;
		while(alias_components = alias_regex.exec(this.sql)) {
			var table = alias_components[1].split('.')[0];
			var column = alias_components[1].split('.')[1];
			var alias = alias_components[2];
			alias_map[alias] = {table: table, column: column};
		}
		return alias_map;
	}
}

// takes a javascript object with columns/values as the key/value pairs
// returns the Query object for the correct INSERT query
JMVC.Query.generate_insert = function(object, table) {	        
    var fields_array = [];
    var values_array = [];
    for(var attr in object) {
        if(object[attr] != null) {
            fields_array.push( attr );
            values_array.push( "'" + object[attr].toString() + "'" );
        }
    }
    var fields_string = fields_array.join(',');
    var values_string = values_array.join(',');
    
	return new JMVC.Query('INSERT INTO '+table+' ('+fields_string+') VALUES ('+values_string+')');
}