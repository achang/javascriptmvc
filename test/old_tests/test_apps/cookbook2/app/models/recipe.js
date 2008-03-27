Recipe = Class.create(JMVC.ActiveRecordGenerator('Recipe'), {

});
Recipe.belongs_to("category")