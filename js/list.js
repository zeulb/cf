var contestList = [];
var contestMap = new Object();
var inverseMap = new Object();
var lastCall = -1;

function display(contestId)
{
	if (contestId === -1) return;
	lastCall = contestId;
	window.history.pushState("object or string", "Title", "index.html?id="+contestId);
	$("#haha").load("contest.html?id="+contestId);
}

var substringMatcher = function(strs) {
	return function findMatches(q, cb) {
		var matches, substrRegex;
		matches = [];
		substrRegex = new RegExp(q, 'i');
		$.each(strs, function(i, str) {
			if (substrRegex.test(str)) {
        	matches.push({ value: str });
      		}
    	});
	cb(matches);
	};
}


$(document).ready(function(){
	$(document).on("ready",function(){
		$(document).off();
		console.log("trigerred");
		$.ajax({
			url: 'http://codeforces.com/api/contest.list',
			dataType: 'JSONP',
			data : {
				jsonp:"callback"
			},
			jsonpCallback: 'callback',
			type: 'GET',
			success: function (data) {
				contest = data.result;
				var mostRecent = -1;
				$.each(contest, function(index,value) {
					if (value.phase !== "BEFORE")
					{
						contestList.push(value.name);
						console.log("<li onclick=display("+value.id+")><a href=contest.html?id="+index+">"+value.name+"</a></li>");
						$(".dropdown-menu").append("<li onclick=display("+value.id+")><a href=\"#\">"+value.name+"</a></li>");
						contestMap[value.name] = value.id;
						inverseMap[value.id] = value.name;
						if (mostRecent === -1) mostRecent = value.id;
					}
				});
				display(mostRecent);
			},
			error: function (){
				console.log("server down");
			}
		});
	});
	$(document).trigger("ready");
	
	$('.typeahead').typeahead(null, {
	  name: 'states',
	  displayKey: 'value',
	  source: substringMatcher(contestList)
	});

	
	var selectedDatum;
	$('.typeahead').on('typeahead:selected', function(event, datum) {
  		selectedDatum = datum;
  		display(contestMap[selectedDatum["value"]]);
	});

	$('#go').on('click.search', function(){
		console.log(selectedDatum);
    	display(contestMap[selectedDatum["value"]]);
    	console.log(contestMap);
	});

	

});