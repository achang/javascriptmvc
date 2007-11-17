Category = Class.create(JMVC.ActiveRecordGenerator('Category'), {

});
Category.has_many("recipes")