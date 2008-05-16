new MVC.Test.Unit('inflector',{
	test_singularize : function(){
		this.assert_equal('person', MVC.String.singularize('people'));
		this.assert_equal('dog', MVC.String.singularize('dogs'));
	},
	test_pluralize : function(){
		this.assert_equal('people', MVC.String.pluralize('person'));
		this.assert_equal('dogs', MVC.String.pluralize('dog'));
	},
	test_conflict_singular : function(){
		if(MVC.no_conflict) {
			this.messages.push("Skipping because no_conflict mode is on.");
			return;
		}
		this.assert_equal('person', 'people'.singularize());
		this.assert_equal('dog', 'dogs'.singularize());
	},
	test_conflict_pluralize : function(){
		if(MVC.no_conflict) {
			this.messages.push("Skipping because no_conflict mode is on.");
			return;
		}
		this.assert_equal('people', 'person'.pluralize(), "OK if no conflict");
		this.assert_equal('dogs', 'dog'.pluralize(), "OK if no conflict");
	}
});