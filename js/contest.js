var requestedId;

function showTableBody()
{
	console.log("newContestId:"+newContestId);

	$.each(contestantList, function(index,value) {
		var tableRow = "";
		// Add rank
		tableRow += "<td class='text-center'>"+value.rank+"</td>";

		// Add expected rank
		tableRow += "<td class='text-center'>"+value.expectedRank+"</td>";

		// Add handle
		if (isOfficial.contains(value.participantType))
			tableRow += "<td class='"+colorUserMapping[value.userInfo.rank]+"'>"+value.userInfo.handle+"</td>";
		else
			tableRow += "<td class='"+colorUserMapping[value.userInfo.rank]+"'>* "+value.userInfo.handle+"</td>";

		// Add rating
		tableRow += "<td class='"+colorUserMapping[value.userInfo.rank]+" text-center'>"+value.userInfo.rating+"</td>";

		// Add country
		tableRow += "<td>"+value.userInfo.country+"</td>";

		// Add contest points
		tableRow += "<td class='text-center'>"+value.points+"</td>";

		// Add hack stat
		if (value.successfulHackCount > 0 && value.unsuccessfulHackCount > 0)
			tableRow += "<td class='text-center'> +"+value.successfulHackCount+" / -"+value.unsuccessfulHackCount+"</td>";
		else if (value.successfulHackCount > 0)
			tableRow += "<td class='text-center'> +"+value.successfulHackCount+"</td>";
		else if (value.unsuccessfulHackCount > 0)
			tableRow += "<td class='text-center'> -"+value.unsuccessfulHackCount+"</td>";
		else
			tableRow += "<td class='text-center'> </td>";

		// Add problem points
		var problem = value.problemResults;
		$.each(problem, function(index,value) {
			tableRow += "<td class='text-center'>"+value.points+"</td>";
		});

		// update behaviour
		if (newContestId)
			$("tbody").append("<tr id='user"+index+"'>"+tableRow+"</tr>");
		else
			$("#user"+index).html(tableRow);
	});

	// Refresh every 60 seconds
	newContestId = false;
	if (autoRefresh) setTimeout("getStandings()",60000);
	$("input").prop('disabled', false);
}

var sortByRating = function (element1,element2) {
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
}

function getExpectedRank()
{
	$.each(contestantList, function(index,value) {
		cloneTemp[index].index=index;
		cloneTemp[index].rating=value.userInfo.rating;
	});
	cloneTemp.sort(sortByRating);

	var lastRating = -1;
	var lastRank = -1;
	$.each(cloneTemp, function(index,value) {
		if (value.rating === lastRating)
			contestantList[value.index].expectedRank = lastRank;
		else {
			contestantList[value.index].expectedRank = index+1;
			lastRank = index+1;
		}
		lastRating = value.rating;
	});
}

function getAdditionalData()
{
	$.each(contestantList, function(index,value) {
		if (value.userInfo.country === undefined) value.userInfo.country = "-";
		if (value.userInfo.rating  === undefined) value.userInfo.rating  = 1500;
		value.hackBalance = value.successfulHackCount-value.unsuccessfulHackCount;
	});
	getExpectedRank();
}

function finalize()
{
	getAdditionalData();
	showTableBody();
}

function getUser(size,handle)
{
	$.ajax({
		url: 'http://codeforces.com/api/user.info',
		dataType: 'JSONP',
		data : {
			jsonp:"callback",
			handles:requestedUser.join(";")
		},
		jsonpCallback: 'callback',
		type: 'GET',
		success: function (data) {
			member = data.result;
			$.each(member, function(index,value) {
				contestantList[size-1].userInfo = value;
				size--;
			});
			if (size === 0)
			{
				finalize();
				console.log("Done Extraction");
			}
			else
			{
				requestedUser = [];
				while(requestedUser.length < maxUserEachRetrieval)
				{
					requestedUser.push(handle.pop());
					if (handle.length === 0) break;
				}
				getUser(size,handle);
			}
		},
		error: function ()
		{
			console.log("failed to retrieve user data try again in 5 seconds");
			setTimeout("getUser(size,handle)",5000);
		}
	});
}

function processUser(unretrievedUser)
{
	while(requestedUser.length < maxUserEachRetrieval) {
		requestedUser.push(unretrievedUser.pop());
		if (unretrievedUser.length === 0) break;
	}
	getUser(unretrievedUser.length+requestedUser.length,unretrievedUser);
}

function extractRow(user)
{
	var unretrievedUser = [];
	$.each(user, function(index,value) {
		if (!ignoredparticipantType.contains(value.party.participantType))
		{
			var member = value.party.members;
			contestantList.push({});
			cloneTemp.push({});
			// Cannot handle team member for now
			unretrievedUser.push(member[0].handle);
		}
	});
	processUser(unretrievedUser);
	// Extract data to contestantList
	var realIndex = 0;
	$.each(user, function(index,value) {
		if (!ignoredparticipantType.contains(value.party.participantType))
		{
			var participant = contestantList[realIndex];
			participant.participantType = value.party.participantType;
			participant.rank = realIndex+1;
			participant.points = value.points;
			participant.penalty = value.penalty;
			participant.successfulHackCount = value.successfulHackCount;
			participant.unsuccessfulHackCount = value.unsuccessfulHackCount;
			participant.problemResults = value.problemResults;
			realIndex++;
		}
	});

}

function showTableHead(result) {
	$("title").empty();
	$(".panel-heading").empty();
	$("thead > tr").empty();
	$("thead").empty();
	$("tbody").empty();

	$("title").append(result.contest.name);

	$(".panel-heading").append("<h4 class='text-center'>"+result.contest.name+"</h4>");
	
	$("thead").append('<tr><td class="text-center">Rank</td><td class="text-center">Exp. Rank</td><td>Handle</td><td class="text-center">Rating</td><td>Country</td><td class="text-center">Points</td><td class="text-center">Hack</td></tr>');
	
	var problemData = result.problems;
	$.each(problemData, function(index,value) {
		$("thead > tr").append("<td class='text-center'>"+ String.fromCharCode(65+index)+"</td>");
	});
}

function reset() {
	contestantList = [];
	cloneTemp = [];
	requestedUser = [];
}

function getStandings(){
	$("input").prop('disabled', true);
	console.log("getStandings : "+requestedId);
	reset();
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
			console.log("standings data successfully retrieved | newContestId:"+newContestId);
			if (newContestId===true) showTableHead(data.result);
			autoRefresh=(data.result.contest.phase === "CODING");
			extractRow(data.result.rows);
		},
		error: function(){
			console.log("failed to retrieve standings data, try again in 5 seconds");
			setTimeout("getStandings()",5000);
		}
	});
}


$(document).ready(function() {

});