// eliminate prototye dependancy

if(typeof Object == 'undefined' || typeof Object.extent == 'undefined' )
{
	if(typeof Object == 'undefined') Object = {}
	Object.extend = function(destination, source) {
	  for (var property in source) {
	    destination[property] = source[property];
	  }
	  return destination;
	};
}


Paginator = function(controller, item_count, items_per_page, current_page) {
	if(items_per_page <=0) throw 'Paginator must have at least one item per page'
	
	this.controller = controller;
	this.item_count = item_count;
	this.items_per_page = items_per_page;
	this.pages = {}
	this.current_page = current_page;
}

Paginator.prototype = {
	has_page_number : function(number){
		return number >= 1 || number <= this.page_count()
	},
	page_count : function() {
		if(this.item_count == 0) return 1;
		return Math.ceil(this.item_count / this.items_per_page);
	},
	current_page : function() {
		return new Paginator.Page(this, this.current_page)
	},
	page : function(number){
		return new Paginator.Page(this, number)
	},
	first_page : function() {
		return this.page(1)
	},
	last_page : function() {
		return this.page(this.page_count())
	}
}
//aliases
Paginator.prototype.first = Paginator.prototype.first_page
Paginator.prototype.last = Paginator.prototype.last_page

Paginator.Page = function(paginator, number) {
	this.paginator = paginator
	this.number =  parseInt(number);
	if(paginator.has_page_number(number) )
		this.number = 1
}
Paginator.Page.prototype = {
	window : function(padding) {
		return new Paginator.Window(this)
	},
	equal : function(page){
		if(!page) return false;
		return (page.paginator === this.paginator && this.number == page.number)
	},
	is_first : function(){
		return this.equal(this.paginator.first())
	},
	is_last : function(){
		return this.equal(this.paginator.last())
	}
	
}


Paginator.Window = function(page, padding) {
	this.paginator = page.paginator
	this.page = page
	this.set_padding( padding)
}
Paginator.Window.prototype = {
	pages : function(){
		var pages = [];
		for(var i = this.first.number; i <= this.last.number; i ++){
			pages.push(this.paginator.pages(i))
		}
		return pages;
	},
	set_padding : function(padding) {
		this.padding = padding < 0 ? 0 : padding
		this.first = this.paginator.has_page_number(this.page.number - this.padding) ?
             this.paginator.page(this.page.number - this.padding) : this.paginator.first();
		
		this.last =  this.paginator.has_page_number(this.page.number + this.padding) ?
             this.paginator.page(this.page.number + this.padding) : this.paginator.last();
	}
}

JMVC.MVC.View.DEFAULT_PAGINATION_OPTIONS = {
	link_to_current_page : false,
	always_show_anchors : true,
	window_size : 3,
	name : 'page'
}
JMVC.MVC.View.pagination_links = function(paginator, options, html_options) {
	options = $(JMVC.MVC.View.DEFAULT_PAGINATION_OPTIONS).merge(options)
	var params = Object.extend({},paginator.controller.params) // shallow copy
	
	
	return JMVC.MVC.View.pagination_links_each(paginator, options, function(n){
		params[options.name] = n;
		JMVC.MVC.View.link_to(n, params, html_options)
	})
}


JMVC.MVC.View.pagination_links_each = function(paginator, options, block) {
	options = $(JMVC.MVC.View.DEFAULT_PAGINATION_OPTIONS).merge(options)
	link_to_current_page = options.link_to_current_page
    always_show_anchors = options.always_show_anchors
	
	current_page = paginator.current_page()
	window_pages = current_page.window(options.window_size).pages
	if(!link_to_current_page &&  window_pages.length <= 1) return; 
	
	var first = paginator.first();
	var last = paginator.last();
	html = ''
	var wp_first = window_pages[0]
	
	if(always_show_anchors && wp_first.is_first() ){
		html += block(first.number)
		if(wp_first.number - first.number > 1)
			html += ' ... ' 
		html += ' '
	}
	
	for(var p = 0; p < window_pages.length; p++) {
		var page = window_pages[p]
		if(current_page.equal(page) && !link_to_current_page)
		
			html += page.number
		else
			html += block((page.number))
		html += ' '
	}
	var wp_last = window_pages[window_pages.length-1]
	
	if(always_show_anchors && wp_first.is_last() ){
		if(wp_first.number - first.number > 1)
			html += ' ... ' 
		html += block(first.number)
		html += ' '
	}
}

JMVC.library_loaded()