// generic adapter class with a function(process_results) that is shared with client and server_adapter
JMVC.GenericInterface = Class.create()

JMVC.GenericInterface._process_results = function(server_data, sql, user_callback, query_callback) {
	// takes a resultset which is using aliased names, converts it into an hash
	// hash is in the form: {<#table_name>: {<#id>: {<#column>: <#value>, ...}, ...}, ...}
	var convert_to_objects = function(resultset, query) {
		var find_primary_key_alias = function(alias_map, table, primary_key) {
			for(var alias in alias_map) {
				if(alias_map[alias].table == table && alias_map[alias].column == primary_key)
					return alias;
			}
			return null;
		}
		var alias_map = query.alias_map();
        // put response in a data object thats easy to save
        var object_hash = {};
		var using_alias = false;
		if ($H(alias_map).size() > 0)
			using_alias = true;
        for(var i=0; i<resultset.length; i++) {
            var row = resultset[i];
            for(var alias in row) {
				if(using_alias) {
	                var table = alias_map[alias].table;
	                var column = alias_map[alias].column;
					var primary_key_alias = find_primary_key_alias(alias_map, table, 'id');
				} else {
					var table = query.sql.match(/SELECT.*FROM\s*(\w+)/)[1]
					var column = alias;
					var primary_key_alias = 'id';
				}
				var data = row[alias];
                if(data != null) {
                    if(!object_hash[table]) 
                        object_hash[table] = {};
                    if(!object_hash[table][ row[primary_key_alias] ]) // create the object hash
                        object_hash[table][ row[primary_key_alias] ] = {};
                    object_hash[table][ row[primary_key_alias] ][column] = data;
                }
            }
        }
        return object_hash;
    }
	
	var query = new JMVC.Query(sql);
	if (typeof(server_data) == 'object' && sql.match(/COUNT\(\*\)|SUM\(.*\)/)) // is probably a CALCULATION
		server_data = $H(server_data[0]).values()[0];
	else if(typeof(server_data) == 'object') // is probably a SELECT
		server_data = convert_to_objects(server_data, query);
	if(query_callback)
		query_callback(server_data, query);
	if(user_callback)
		return user_callback(server_data);
	else
		return server_data;
}

JMVC.GenericInterface.send_query = function() {
	throw new JMVC.Error(new Error(), 'send_query must be defined for interfaces');
}

// returns the adapter class by checking the this.db attribute
// if the adapter hasn't been set up yet, it sets it up, then returns the adapter's class
JMVC.GenericInterface._get_adapter_class = function() {
	var adapter_class = JMVC[this.db+'Adapter'];
	// verify that its been set up
	if(!adapter_class.setup_complete)
		adapter_class.setup(JMVC.app_schema);
	return adapter_class;
}

// generic client_adapter class, which calls the setup and execute methods of the defined client_db's adapter
JMVC.ClientInterface = Class.create(JMVC.GenericInterface)

// executes the query using the given sql
// returns the processed results
JMVC.ClientInterface.send_query = function(sql, callback) {
	var adapter_class = this._get_adapter_class();
	if(typeof console != 'undefined') console.info("Client Query: "+sql)
	var server_data = adapter_class.execute(sql);
	return this._process_results(server_data, sql, callback);
}

// the client interface uses TrimQuery currently
JMVC.ClientInterface.db = 'TrimQuery'

// params optionally contains:
// asynchronous: boolean that says whether the request should be done asychronously
// callback: function that specifies what function to call when the data returns
JMVC.ServerInterface = Class.create(JMVC.GenericInterface)

// sends a synchronous or asynchronous queries to the server
// returns the processed results
// 2 call signatures for the first parameter: 
// - single query with sql
// - multiple queres in an array, containing an object with a query and params
JMVC.ServerInterface.send_query = function(sql, params, querycontroller_callback) {
    var params = Object.extend({ 
        asynchronous: false, 
        callback: null
    }, params || {} );
	
	var adapter_class = this._get_adapter_class();
	
	var process_results = function(server_data) {
	    if(typeof(sql) == 'object') {
			var results_array = [];
		    for(var i=0; i<server_data.length; i++)
		        results_array.push( this._process_results(server_data[i], sql[i].sql, sql[i].params.callback, querycontroller_callback) );
		    return results_array;
		}
		return this._process_results(server_data, sql, params.callback, querycontroller_callback);
	}.bind(this)
	
	var sql_text = sql;
    if(typeof(sql) == 'object') {
		var sql_array = [];
	    for(var i=0; i<sql.length; i++)
	        sql_array.push( sql[i].sql );
	    sql_text = sql_array;
	}
	
    if(!params.asynchronous) { // synchronous
    	if(typeof console != 'undefined') console.info("Server Query: ", sql.toString())
		var server_data = adapter_class.execute(sql_text);
		return process_results(server_data);
    } // else asynchronous
    adapter_class.execute_asynchronous(sql_text, function(server_data) {
		return process_results(server_data);
	}.bind(this));
}

// the server interface currently uses Scaffold
JMVC.ServerInterface.db = 'Scaffold'

/* USAGE:
var package = new JMVC.QueryPackage();
package.add({object: Thing.packaged_find(1), result: Thing.packaged_find(2)});
  or...
package.object = Thing.packaged_find(1);
package.result = Thing.packaged_find(2);
var results = package.send();
  or...
var results = package.send({asynchronous: true, callback: some_function});
--> results = {object: <#Thing>, result: <#Thing>})
*/
// a class designed to support sending multiple find's in one server round trip
// query must be a method that produces a SELECT query, such as find, count, or sum
// must be synchronous also
JMVC.QueryPackage = function(hash_to_add) {
	if(hash_to_add)
		this.add(hash_to_add);
	return this;
}

JMVC.QueryPackage.prototype = {
	// supports the following:
	// package.add({object: Thing.packaged_find(1), result: Thing.packaged_find(2)});
	add : function(hash_to_add) {
		for(var key in hash_to_add)
			this[key] = hash_to_add[key];
		return this;
	},
    send : function(params) {
        var keys_array = [];
        var queries_array = [];
        for(var query in this) {
            if(typeof(this[query]) != 'function') {
                keys_array.push(query);
                queries_array.push(this[query]);
            }
        }
        var return_object = {};
		var callback = JMVC.QueryController._copy_objects_to_client_db;
        var results_array = JMVC.ServerInterface.send_query(queries_array, params, callback);
        for(var i=0; i<results_array.length; i++)
            return_object[keys_array[i]] = results_array[i];
        return return_object;
    }
}