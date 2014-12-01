var requestedId = 374;
var limiter = 300;
var participant = [];
var request = [];


function getUrlParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
    }
}   

requestedId = getUrlParameter("id");


function show()
{
	$.each(participant, function(index,value) {
		if (value.country === undefined) value.country = "-";
		if (value.rating === undefined) value.rating = 1500;
		var tableRow = "<tr>";
		tableRow += "<td>"+value.rank+"</td>";
		tableRow += "<td>"+value.userInfo.handle+"</td>";
		tableRow += "<td>"+value.userInfo.rating+"</td>";
		tableRow += "<td>"+value.userInfo.rank+"</td>";
		tableRow += "<td>"+value.userInfo.country+"</td>";
		tableRow += "<td>"+value.points+"</td>";
		tableRow += "<td> +"+value.successfulHackCount+" / -"+value.unsuccessfulHackCount+"</td>";
		var problem = value.problemResults;
		$.each(problem, function(index,value) {
			tableRow += "<td>"+value.points+"</td>";
		});
		tableRow += "</tr>";
		//console.log(tableRow);
		$("tbody").append(tableRow);
	});
}

function getUser(size,handle)
{
	$.ajax({
		url: 'http://codeforces.com/api/user.info',
		dataType: 'JSONP',
		data : {
			jsonp:"callback",
			handles:request.join(";")
		},
		jsonpCallback: 'callback',
		type: 'GET',
		success: function (data) {
			member = data.result;
			$.each(member, function(index,value) {
				participant[size-1].userInfo = value;
				size--;
			});
			if (size === 0)
			{
				show();
			//	console.log("Done Extraction");
			}
			else
			{
				request = [];
				while(request.length < limiter)
				{
					request.push(handle.pop());
					if (handle.length === 0) break;
				}
				getUser(size,handle);
			}

		}
	});
}

function processUser(handles)
{
	while(request.length < limiter) {
		request.push(handles.pop());
		if (handles.length === 0) break;
	}
	getUser(handles.length+request.length,handles);
}

function extractRow(user)
{
	var handles = [];
	$.each(user, function(index,value) {
		var member = value.party.members;
		$.each(member, function(index2,value) {
			participant.push(new Object());
			handles.push(value.handle);
		});
	});
	processUser(handles);
	$.each(user, function(index,value) {
		participant[index].rank = value.rank;
		participant[index].points = value.points;
		participant[index].penalty = value.penalty;
		participant[index].successfulHackCount = value.successfulHackCount;
		participant[index].unsuccessfulHackCount = value.unsuccessfulHackCount;
		participant[index].problemResults = value.problemResults;
	});

}

getStandings = function(){
	$.ajax({
		url: 'http://codeforces.com/api/contest.standings',
		dataType: 'JSONP',
		data : {
			jsonp:"callback",
			contestId:requestedId,
			from:1
		},
		jsonpCallback: 'callback',
		type: 'GET',
		success: function (data) {
			var problem = data.result.problems;
			$.each(problem, function(index,value) {
			//	console.log("<td>"+ String.fromCharCode(65+index)+"</td>");
				$("thead > tr").append("<td>"+ String.fromCharCode(65+index)+"</td>");
			});
			$(".panel-heading").append(data.result.contest.name);
			$("title").append(data.result.contest.name);
			
			extractRow(data.result.rows);

		}
	});

}

$(document).ready(function() {
	$(document).on("show",getStandings);
	$(document).trigger("show");

});