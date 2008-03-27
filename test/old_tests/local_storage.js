JMVCTest = {
	APPLICATION_NAME : 'simple',
	TEST_DESCRIPTION : 'Test TrimQuery and Gears local storage.',
	perform_test : function() {
	  new Test.Unit.Runner({
	  	
		setup: function() {
			JMVC.TrimQueryAdapter._model_query_lang = null
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
	    }},
	    test_localstorage : function() { with(this) {
			var adapters = ['TrimQuery', 'Gears'];
			for(var i=0; i<adapters.length; i++) {
				LocalStorage.type = adapters[i];
				var app_schema = {"name":"db","tables":[
					{"name":"things","columns":
						[{"name":"content","type":"string"},{"name":"id","type":"integer"}]}
					]}
				LocalStorage.setup(app_schema)
				LocalStorage.execute("INSERT INTO things (content,id) VALUES ('test test',1)")
				var obj = LocalStorage.execute("SELECT * FROM things WHERE things.id = 1")
				assertEqual(obj[0].content, 'test test')
				assertEqual(obj[0].id, 1)
				LocalStorage.execute("UPDATE things SET content='different content' WHERE things.id = 1")
				var obj = LocalStorage.execute("SELECT * FROM things WHERE things.id = 1")
				assertEqual(obj[0].content, 'different content')
				LocalStorage.execute("DELETE FROM things WHERE things.id = 1")
				var obj = LocalStorage.execute("SELECT * FROM things WHERE things.id = 1")
				assertEqual(obj.length, 0)
			}
	    }},
	    test_localstorage_joins : function() { with(this) {
			var adapters = ['TrimQuery', 'Gears'];
			for(var i=0; i<adapters.length; i++) {
				LocalStorage.type = adapters[i];
				var app_schema = {"name":"db","tables":[
					{"name":"teachers","columns":
						[{"name":"name","type":"string"},{"name":"id","type":"integer"}]},
					{"name":"students","columns":
						[{"name":"name","type":"string"},{"name":"id","type":"integer"},{"name": "teacher_id","type":"integer"}]}
					]}
				LocalStorage.setup(app_schema)
				LocalStorage.execute("INSERT INTO teachers (name,id) VALUES ('Brian Moschel',1)")
				LocalStorage.execute("INSERT INTO students (name,id,teacher_id) VALUES ('Tommy Jones',2,1)")
				LocalStorage.execute("INSERT INTO students (name,id,teacher_id) VALUES ('Mike Jones',3,1)")
				var obj = LocalStorage.execute("SELECT students.name AS t0_c0, students.id AS t0_c1, students.teacher_id AS t0_c2, teachers.name AS t1_c0, teachers.id AS t1_c1 FROM students LEFT OUTER JOIN teachers ON students.teacher_id = teachers.id WHERE teachers.id = 1")
				assertEqual(obj.length, 2)
				assertEqual(obj[0].t0_c0, 'Tommy Jones')
				assertEqual(obj[1].t1_c0, 'Brian Moschel')
			}
	    }}
	  }, "testlog");
	}
}