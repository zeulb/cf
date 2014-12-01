var limiter = 200;
var participant = [];
var temporary = [];
var request = [];
var mapping = {
				"international grandmaster" : "rated-user user-red",
				"grandmaster"               : "rated-user user-fire",
				"international master"      : "rated-user user-orange",
				"master"					: "rated-user user-orange",
				"candidate master"			: "rated-user user-violet",
				"expert"					: "rated-user user-blue",
				"specialist"				: "rated-user user-green",
				"pupil"						: "rated-user user-green",
				"newbie"					: "rated-user user-gray",
				"unrated"					: ""
};
var firstTime = true;


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

var requestedId = getUrlParameter("id");

function show()
{
	console.log("firsttime"+firstTime);
	$.each(participant, function(index,value) {
		var tableRow = "";
		tableRow += "<td class=\"text-center\">"+value.rank+"</td>";
		tableRow += "<td class=\"text-center\">"+value.expectedRank+"</td>";
		tableRow += "<td class=\""+mapping[value.userInfo.rank]+"\">"+value.userInfo.handle+"</td>";
		tableRow += "<td class=\""+mapping[value.userInfo.rank]+" text-center\">"+value.userInfo.rating+"</td>";
		tableRow += "<td>"+value.userInfo.country+"</td>";
		tableRow += "<td class=\"text-center\">"+value.points+"</td>";
		if (value.successfulHackCount > 0 && value.unsuccessfulHackCount > 0)
		{
			tableRow += "<td class=\"text-center\"> +"+value.successfulHackCount+" / -"+value.unsuccessfulHackCount+"</td>";
		}
		else if (value.successfulHackCount > 0)
		{
			tableRow += "<td class=\"text-center\"> +"+value.successfulHackCount+"</td>";
		}
		else if (value.unsuccessfulHackCount > 0)
		{
			tableRow += "<td class=\"text-center\"> -"+value.unsuccessfulHackCount+"</td>";
		}
		else
		{
			tableRow += "<td class=\"text-center\"> </td>";
		}
		var problem = value.problemResults;
		$.each(problem, function(index,value) {
			tableRow += "<td class=\"text-center\">"+value.points+"</td>";
		});
		if (firstTime) $("tbody").append("<tr id=\"user"+index+"\">"+tableRow+"</tr>");
		else
		{
			//console.log("#user"+index);
			//console.log(tableRow);
			//console.log($("#user"+index));
			$("#user"+index).html(tableRow);
		}
	});
	firstTime = false;
	setTimeout("getStandings()",60000);
}

function finalize()
{
	$.each(participant, function(index,value) {
		if (value.userInfo.country === undefined) value.userInfo.country = "-";
		if (value.userInfo.rating === undefined) value.userInfo.rating = 1500;
		value.hackBalance = value.successfulHackCount-value.unsuccessfulHackCount;
		temporary[index].index=index;
		temporary[index].rating=value.userInfo.rating;
	});
	temporary.sort(function(element1,element2){
		if (element1.rating !== element2.rating)
		{
			if (element1.rating > element2.rating) return -1;
			else return 1;
		}
		else
		{
			if (element1.index > element2.index) return 1;
			else return -1;
		}
	});
	var lastRating = -1;
	var lastRank = -1;
	$.each(temporary, function(index,value) {
		if (value.rating === lastRating)
		{
			participant[value.index].expectedRank = lastRank;
		}
		else
		{
			participant[value.index].expectedRank = index+1;
			lastRank = index+1;
		}
		lastRating = value.rating;
	});
	show();
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
				finalize();
				console.log("Done Extraction");
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
		},
		error: function ()
		{
			console.log("failed to get user rating");
			getUser(size,handle);
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
		if (value.party.participantType !== "PRACTICE")
		{
			var member = value.party.members;
			$.each(member, function(index2,value2) {
				participant.push(new Object());
				temporary.push(new Object());
				if (value.party.participantType !== "CONTESTANT") value2.handle = "*"+value2.handle;
				handles.push(value2.handle);
			});
		}
	});
	processUser(handles);
	$.each(user, function(index,value) {
		if (value.party.participantType !== "PRACTICE")
		{
			participant[index].rank = value.rank;
			participant[index].points = value.points;
			participant[index].penalty = value.penalty;
			participant[index].successfulHackCount = value.successfulHackCount;
			participant[index].unsuccessfulHackCount = value.unsuccessfulHackCount;
			participant[index].problemResults = value.problemResults;
		}
	});

}

function getStandings(){
	participant = [];
	temporary = [];
	request = [];
	$.ajax({
		url: 'http://codeforces.com/api/contest.standings',
		dataType: 'JSONP',
		data : {
			jsonp:"callback",
			contestId:requestedId,
			from:1,
			showUnofficial:true
		},
		jsonpCallback: 'callback',
		type: 'GET',
		success: function (data) {
			
			console.log("requesting standings data "+firstTime);
			//console.log(data);
			if (firstTime)
			{
				$("title").append(data.result.contest.name);
				$(".panel-heading").append("<h4 class=\"text-center\">"+data.result.contest.name+"</h4>");
				var problem = data.result.problems;
				$.each(problem, function(index,value) {
					$("thead > tr").append("<td class=\"text-center\">"+ String.fromCharCode(65+index)+"</td>");
				});
			}
			extractRow(data.result.rows);
			
			
		},
		error: function(){
			console.log("failed to request");
			getStandings();
		}
	});

}


$(document).ready(function() {
	getStandings();

});