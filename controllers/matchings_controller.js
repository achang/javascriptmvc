MVC.Controller('matchings',{
    '# mouseover' : function(params){
        success('matchings_mouseover')
    },
    mouseover : function(){
        success('matching_mouseover')
    },
    'label.a_class mouseover' : function(){
        success('a_class_mouseover')
    },
    'label mouseover' : function(){
        success('label_mouseover')
    },
    '# #an_id mouseover' : function(){
         success('matchings_an_id')
    }
})