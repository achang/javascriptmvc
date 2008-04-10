(function(){
	var parse = Date.parse;
	MVC.Native.extend('Date', {
		month_name: function(date) {
			return MVC.Date.month_names[date.getMonth()-1];
		},
		number_of_days_in_month : function(date) {
		    var year = date.getFullYear(),month = date.getMonth(),m = [31,28,31,30,31,30,31,31,30,31,30,31];
		    if (month != 1) return m[month];
		    if (year%4 != 0 || (year%100 == 0 && year%400 != 0)) return m[1];
		    return m[1] + 1;
		},
		month_names: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		parse: function(data) {
			if(typeof data != "string") return null;
			var f1 = /\d{4}-\d{1,2}-\d{1,2}/, f2 = /\d{4}\/\d{1,2}\/\d{1,2}/, f3 = /\d{4}-\d{1,2}-\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}/;
			
			if(data.match(f3)) {
				var timeArr = data.match(f3)[0].split(' ')[1].split(':');
				var dateArr = data.match(f3)[0].split(' ')[0].split('-');
				return new Date( Date.UTC(parseInt(dateArr[0], 10), (parseInt(dateArr[1], 10)-1), parseInt(dateArr[2], 10),
					parseInt(timeArr[0], 10), parseInt(timeArr[1], 10), parseInt(timeArr[2], 10)) );
			}
			if(data.match(f1)) {
				var dateArr = data.match(date_format_1)[0].split('-');
				return new Date( Date.UTC(parseInt(dateArr[0], 10), (parseInt(dateArr[1], 10)-1), parseInt(dateArr[2], 10)) );
			}
			if(data.match(f2)) {
				var dateArr = data.match(date_format_2)[0].split('/');
				return new Date( Date.UTC(parseInt(dateArr[0], 10), (parseInt(dateArr[1], 10)-1), parseInt(dateArr[2], 10)) );
			}
			return parse(data);
		}
	});
})();