function display(contestId)
{
	window.history.pushState({},"","index.html?id="+contestId);
	newContestId = true;
	requestedId = contestId;
	getStandings();
	
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

function getContestList() {
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
				if (!ignoredPhase.contains(value.phase))
				{
					contestList.push(value.name);
					$(".dropdown-menu").append("<li onclick=display("+value.id+")><a href=\"#\">"+value.name+"</a></li>");
					contestMap[value.name] = value.id;
					if (mostRecent === -1) mostRecent = value.id;
				}
			});
			if (getUrlParameter("id") === undefined) display(mostRecent);
			else display(getUrlParameter("id"));
		},
		error: function (){
			console.log("Unable to retrieve contest list");
		}
	});
}

$(document).ready(function(){
	getContestList();

	$('.typeahead').typeahead(null, {
		name: 'states',
		displayKey: 'value',
		source: substringMatcher(contestList)
	});

	var selectedDatum;
	$('.typeahead').on('typeahead:selected', function(event, datum) {
		selectedDatum = datum;
		console.log(selectedDatum["value"]);
		display(contestMap[selectedDatum["value"]]);
	});

	$('#go').on('click.search', function(){
		display(contestMap[selectedDatum["value"]]);
	});
});