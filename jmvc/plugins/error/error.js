$MVC.RemoteModel('application_error', {url: 'https://damnit.jupiterit.com', name: 'error'},{});

$MVC.Object.extend(ApplicationError,{
	textarea_text: "type description here",
	close_time: 10,
	generate_content: function(params){
		var content = [];
		for(var attr in params){
			if(params.hasOwnProperty(attr) && attr != 'toString' ) content.push(attr+':\n     '+params[attr]);
		}
		return content.join('\n');
	},
	create_containing_div: function(){
		var div = document.createElement('div');
		div.id = '_application_error';
		div.style.position = $MVC.Browser.Gecko ? 'fixed' : 'absolute';
		div.style.bottom = '0px';
		div.style.left = '0px';
		div.style.margin = '0px';
		return div;
	},
	create_title: function(){
		var title = document.createElement('div');
		title.style.background = 'url('+$MVC.root()+'plugins/error/background.png) repeat-x scroll center top;'
		title.style.font = 'bold 12pt verdana';
		title.style.color ='white';
		title.style.padding='0px 5px 0px 10px'
		title.innerHTML+= "<a style='float:right; width: 50px;text-decoration:underline; color: Red; padding-left: 25px; font-size: 10pt; cursor: pointer' onclick='ApplicationError.send()'>Close</a> "+
		"<span id='_error_seconds' style='float:right; font-size:10pt;'></span>Damn It!"
		return title;
	},
	create_form: function(callback){
		var form = document.createElement('form');
		var leftmargin = $MVC.Browser.IE ? 5 : 10;
		form.id = '_error_form';
		form.onsubmit = callback;
		form.innerHTML ="<div style='float: left; width: 300px;margin-left:"+leftmargin+"px;'>Something just went wrong.  Please describe your most recent actions and let us know what happenned. We'll fix the problem.</div>"+
		    "<input type='submit' value='Send' style='font-size: 12pt; float:right; margin: 17px 5px 0px 0px; width:60px;padding:5px;'/>"+
			"<textarea style='width: 335px; color: gray;' rows='"+($MVC.Browser.IE ? 3 : 2)+"' name='description' id='_error_text' "+
			"onfocus='ApplicationError.text_area_focus();' "+
			"onblur='ApplicationError.text_area_blur();' >"+this.textarea_text+"</textarea>";
		form.style.padding = '0px';
		form.style.font = 'normal 10pt verdana';
		form.style.margin = '0px';
		form.style.backgroundColor = '#FAE8CD';
		return form;
	},
	create_send_function: function(error){
		ApplicationError.send = function(){
			var params = {error: {}}, description;
			params.error.subject = error.subject;
			if((description = document.getElementById('_error_text'))){error['Description'] = description.value;}
			ApplicationError.pause_count_down();
			params.error.content = ApplicationError.generate_content(error);
			document.body.removeChild(document.getElementById('_application_error'));
			ApplicationError.create(params);
			//alert(params.error.subject);
		};
	},
	create_dom: function(error){
		if(document.getElementById('_application_error')) return; 
		this.create_send_function(error);
		var div = ApplicationError.create_containing_div();
		document.body.appendChild(div);
		div.appendChild(ApplicationError.create_title());
		div.appendChild(ApplicationError.create_form(ApplicationError.send));
		this.set_width();
		
		var seconds_remaining;
		var timer;
		
		ApplicationError.count_down = function(){
			seconds_remaining --;
			document.getElementById('_error_seconds').innerHTML = 'This will close in '+seconds_remaining+' seconds.';
			if(seconds_remaining == 0){
				ApplicationError.pause_count_down();
				ApplicationError.send();
			}
		};
		ApplicationError.start_count_down = function(){
			seconds_remaining = this.close_time;
			document.getElementById('_error_seconds').innerHTML = 'This will close in '+seconds_remaining+' seconds.';
			timer = setInterval(ApplicationError.count_down, 1000);
		};
		ApplicationError.pause_count_down = function(){
			clearInterval(timer);
			timer = null;
			document.getElementById('_error_seconds').innerHTML = '';
		};
		ApplicationError.start_count_down();
	},
	text_area_focus: function(){
		var area = document.getElementById('_error_text');
		if(area.value == this.textarea_text) area.value = '';
		area.style.color = 'black';
		ApplicationError.pause_count_down();
	},
	text_area_blur: function(){
		var area = document.getElementById('_error_text');
		if(area.value == this.textarea_text || area.value == '') area.value = this.textarea_text;
		area.style.color = 'gray';
		ApplicationError.start_count_down();
	},
	set_width: function(){
		var cont, width;
		if(!(cont = document.getElementById('_application_error') )) return;
		width = document.body.clientWidth;
		cont.style.width = width+'px';
		document.getElementById('_error_text').style.width = (width-400)+'px';
	}
});






$MVC.error_handler = function(msg, url, l){
	var error = {
		'Error Message' : msg,
		'File' :  url,
		'Line Number' : l,
		'Browser' : navigator.userAgent,
		'Page' : location.href,
		'HTML Content' : document.documentElement.innerHTML.replace(/\n/g,"\n     ").replace(/\t/g,"     "),
		'Stack' : new Error().stack,
		subject: 'ApplicationError on: '+window.location.href
	};
	ApplicationError.create_dom(error);
	return false;
};
if($MVC.Controller){
	$MVC.Controller._dispatch_action = function(instance, action_name, params){
		try{
			return instance[action_name](params);
		}catch(e){
			
			if(typeof e == 'string'){
				var old = e; e = { toString: function(){return old;}};
			}
			e['Controller'] = instance.klass.className;
			e['Action'] = action_name;
			e['Browser'] = navigator.userAgent;
			e['Page'] = location.href;
			e['HTML Content'] = document.documentElement.innerHTML.replace(/\n/g,"\n     ").replace(/\t/g,"     ");
			e.subject = 'Dispatch Error: '+e.toString();
			ApplicationError.create_dom(e);
		}
	};
}

if(window.attachEvent) {
	window.attachEvent("onresize", ApplicationError.set_width);
}else{
	window.addEventListener('resize', ApplicationError.set_width, false);
}
window.onerror = $MVC.error_handler;