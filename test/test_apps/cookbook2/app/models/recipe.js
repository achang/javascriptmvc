Recipe = Class.create(Junction.ActiveRecordGenerator('Recipe'), {

});
Recipe.belongs_to("category")