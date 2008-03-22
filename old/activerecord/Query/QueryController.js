/**
 * 
 * @class This class is used to package Queries and send them to the server.
 *      <p>A request is typically returned by a serverFind or other requesting function.</p>
 *      <p>Request can be packaged or by themselves.</p>
 * params include
 *      force_remote: used for select queries to force a remote query
 *      force_local: used for select queries to force a local query
 *      asynchronous: specifies that the request, if it is remote, will be asynchronous
 *      callback: specifies which function to call when the asynchronous method returns
 * <p><i>Examples:</i></p>
 * <pre>1.
 *          requests = new JMVC.Request();
 *          requests.tasks = Task.find('all');
 *          requests.send();
 *2.
 *          tasks = Task.find('all').send();     
 * </pre>
 * @addon
 */
JMVC.QueryController = {
    send : function(sql, params) {
        if(params == null)
            params = {};
        if(params.force_remote == null)
            params.force_remote = true;
        if(params.force_local == null)
            params.force_local = false;
		var query = new JMVC.Query(sql);
        if(query.query_type() == 'INSERT') {
            var querycontroller_callback = function(last_id) {
                // insert last_id into the insert sql as id
                query.add_pair_into_insert('id', last_id)
                JMVC.ClientInterface.send_query(query.sql);
                return last_id;
            }.bind(this)
			if( params.force_local )
            	return JMVC.ClientInterface.send_query(sql);
            return JMVC.ServerInterface.send_query(sql, params, querycontroller_callback);
        } else if (query.query_type() == 'SELECT') {
            if( params.force_local || (this._query_cache_hit(query) && !params.force_remote) ) {
                return JMVC.ClientInterface.send_query(sql, params.callback);
            } else {
				var callback = this._copy_objects_to_client_db;
				if(sql.match(/COUNT\(\*\)|SUM\(.*\)/)) // no need to copy objects for these queries
					callback = null;
                return JMVC.ServerInterface.send_query(sql, params, callback);
            }
        } else {
			if( params.force_local ) {
            	JMVC.ClientInterface.send_query(sql);
				return;
			} else {
	            JMVC.ClientInterface.send_query(sql);
	            JMVC.ServerInterface.send_query(sql, params);
	            return;
			}
        }
    },
	// adds a particular query into the cache if its not already present
	add_to_cache : function(sql) {
		var query = new JMVC.Query(sql)
		if(!this._query_cache_hit(query))
			this._local_sql_cache.push(query);
	},
    _local_sql_cache : [],
	// checks if query is already stored locally by looking at the cache
	// returns true if its found in the cache, false otherwise
    _query_cache_hit : function(query) {
        var cache_hit = false;
        this._local_sql_cache.each(function(cached_query) {
            if(query.stripped() == cached_query.stripped())
                cache_hit = true;
        });
        return cache_hit;
    },
	// takes a hash of db objects and inserts them one by one into the client db
    _copy_objects_to_client_db : function(object_hash) {
		for(var table in object_hash) {
			for(var primary_value in object_hash[table]) {
				var object = object_hash[table][primary_value];
	            // even store duplicates because they might be more up to date than whats currently stored
	            var insert = JMVC.Query.generate_insert(object, table);
	            JMVC.ClientInterface.send_query(insert.sql);
			}
		}
    }
}