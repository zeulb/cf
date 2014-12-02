function getCleanURL(contestId)
{
	var url = "index.html?id="+contestId;
	if (getUrlParameter("sortByRating") === "true") url += "&sortByRating=true";
	else if (getUrlParameter("sortByHandle") === "true") url += "&sortByHandle=true";
	else if (getUrlParameter("sortByCountry") === "true") url += "&sortByCountry=true";
	else if (getUrlParameter("sortByHack") === "true") url += "&sortByHack=true";
	return url;
}

function display(contestId)
{
	console.log("displayed "+contestId);
	var url = getCleanURL(contestId);
	if (getUrlParameter("showUnofficial") === "true") url += "&showUnofficial=true";
	window.history.pushState({},"",url);
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
	$("#loading-message").html("Retrieving Contest List");
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
			if (getUrlParameter("id") === "undefined") display(mostRecent);
			else display(getUrlParameter("id"));
		},
		error: function (){
			$("#loading-message").html("Failed to retrieve contest list");
			setTimeout("getContestList()",5000);
		}
	});
}

$(document).ready(function(){
	if (getUrlParameter("showUnofficial") === "true")
	{
		$(".input-group-btn").html(unofficialokbtn);
	}
	else
	{
		$(".input-group-btn").html(unofficialnobtn);
	}
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

	$(".input-group-btn").on("click","#unofficial-no",function(){
		console.log("triggeredd222");
		$(".input-group-btn").empty();
		var url = getCleanURL(requestedId);
		url += "&showUnofficial=true";
		window.history.pushState({},"",url);
		newContestId = true;
		getStandings();
		$(".input-group-btn").html(unofficialokbtn);
		$('.btn').attr("disabled", true);
	});

	$(".input-group-btn").on("click","#unofficial-ok",function(){
		console.log("triggeredd");
		$(".input-group-btn").empty();
		var url = getCleanURL(requestedId);
		window.history.pushState({},"",url);
		newContestId = true;
		getStandings(requestedId);
		$(".input-group-btn").html(unofficialnobtn);
		$('.btn').attr("disabled", true);
	});
});