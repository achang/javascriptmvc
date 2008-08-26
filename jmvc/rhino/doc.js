if(typeof load != 'undefined'){
    load('jmvc/rhino/doc/class.js');
    load('jmvc/rhino/doc/d_pair.js');
    load('jmvc/rhino/doc/d_function.js');
    load('jmvc/rhino/doc/d_class.js');
    load('jmvc/rhino/doc/d_constructor.js');
    load('jmvc/rhino/doc/d_other.js');
}else{
    include('doc/class','doc/d_pair', 'doc/d_function','doc/d_class', 'doc/d_constructor','doc/d_other')
}
