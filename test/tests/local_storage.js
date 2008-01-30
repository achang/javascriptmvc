JMVCTest = {
	APPLICATION_NAME : 'simple',
	TEST_DESCRIPTION : 'Test TrimQuery local storage.',
	TRIMQUERY : true,
	perform_test : function() {
	  new Test.Unit.Runner({
	  	
		setup: function() {
			
		},
		teardown: function() {
		},
	    test_trimquery_adapter : function() { with(this) {
			var app_schema = {"name":"db","tables":[
				{"name":"things","columns":
					[{"name":"content","type":"string"},{"name":"id","type":"integer"}]}
				]}
			JMVC.TrimQueryAdapter.setup(app_schema)
			JMVC.TrimQueryAdapter.execute("INSERT INTO things (content,id) VALUES ('test test',1)")
			var obj = JMVC.TrimQueryAdapter.execute("SELECT * FROM things WHERE things.id = 1")
			assertEqual(obj[0].content, 'test test')
			assertEqual(obj[0].id, 1)
	    }},
	    test_gears : function() { with(this) {
			if(!window.google || !google.gears) alert('This test requires Google Gears.')
			assert(window.google)
			assert(google.gears)
			var db = google.gears.factory.create('beta.database', '1.0');
			assert(db)
			db.open();
			var rs = db.execute('DROP TABLE things');
			rs.close();
			var rs = db.execute('CREATE TABLE things (id INTEGER, content TEXT)');
			rs.close();
			var rs = db.execute("DELETE FROM things WHERE id=1");
			rs.close();
			var rs = db.execute("INSERT INTO things (content,id) VALUES ('test test',1)")
			rs.close()
			var rs = db.execute("SELECT * FROM things WHERE things.id = 1");
			while (rs.isValidRow()) {
				assertEqual(rs.fieldName(0), 'id');
				assertEqual(rs.field(0), 1);
				assertEqual(rs.fieldName(1), 'content');
				assertEqual(rs.field(1), 'test test');
				rs.next();
			}
			rs.close();
	    }},
	    test_gears_adapter : function() { with(this) {
			if(!window.google || !google.gears) alert('This test requires Google Gears.')
			var app_schema = {"name":"db","tables":[
				{"name":"things","columns":
					[{"name":"content","type":"string"},{"name":"id","type":"integer"}]}
				]}
			JMVC.GearsAdapter.setup(app_schema)
			JMVC.GearsAdapter.execute("INSERT INTO things (content,id) VALUES ('test test',1)")
			var obj = JMVC.GearsAdapter.execute("SELECT * FROM things WHERE things.id = 1")
			assertEqual(obj[0].content, 'test test')
			assertEqual(obj[0].id, 1)
	    }}
	  }, "testlog");
	}
}