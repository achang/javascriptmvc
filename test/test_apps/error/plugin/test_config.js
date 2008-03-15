ApplicationError.config({
	prompt_text: 'DAMN IT YOU BROKE IT!', 
	textarea_title: 'Please explain.', 
	close_time: 5
});

breakme2 = function(){
	try {
		br.reak();
	} catch(e) {
		ApplicationError.notify(e);
	}
}