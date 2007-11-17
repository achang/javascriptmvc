Category = Class.create(Junction.ActiveRecordGenerator('Category'), {

});
Category.has_many("recipes")