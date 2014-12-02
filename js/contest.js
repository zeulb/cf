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

		// Add country
		if (value.userInfo.country === "~")
			tableRow += "<td> </td>";
		else
			tableRow += "<td>"+value.userInfo.country+"</td>";

		// Add handle
		if (isOfficial.contains(value.participantType))
			tableRow += "<td class='"+colorUserMapping[value.userInfo.rank]+"'>"+value.userInfo.handle+"</td>";
		else
			tableRow += "<td class='"+colorUserMapping[value.userInfo.rank]+"'>* "+value.userInfo.handle+"</td>";

		// Add rating
		tableRow += "<td class='"+colorUserMapping[value.userInfo.rank]+" text-center'>"+value.userInfo.rating+"</td>";

		

		// Add contest points
		tableRow += "<td class='text-center'>"+value.points+"</td>";

		// Add hack stat
		if (value.successfulHackCount > 0 && value.unsuccessfulHackCount > 0)
			tableRow += "<td class='text-center'> <span style = 'color:#0a0'>+"+value.successfulHackCount+"</span> / <span style = 'color:red'>-"+value.unsuccessfulHackCount+"</span></td>";
		else if (value.successfulHackCount > 0)
			tableRow += "<td class='text-center' style = 'color:#0a0'> +"+value.successfulHackCount+"</td>";
		else if (value.unsuccessfulHackCount > 0)
			tableRow += "<td class='text-center' style = 'color:red'> -"+value.unsuccessfulHackCount+"</td>";
		else
			tableRow += "<td class='text-center'> </td>";

		// Add problem points
		var problem = value.problemResults;
		$.each(problem, function(index,value) {
			if (value.points > 0)
			{
				var minutes = Math.round(value.bestSubmissionTimeSeconds/60);
				var hours = Math.round(minutes/60);
				minutes %= 60;
				minutes = padding(minutes,2);
				hours = padding(hours,2);

				//console.log(index+" "+fastestSolve[index]);
				if (value.bestSubmissionTimeSeconds===fastestSolve[index])
					tableRow += "<td class='text-center' style = 'color:#0a0;font-weight: bold;background-color:#CCFFFF'>"+value.points+"<br><small class='text-muted' style='font-weight: normal;'>"+hours+":"+minutes+"</small></td>";
			
				else
					tableRow += "<td class='text-center' style = 'color:#0a0;font-weight: bold;'>"+value.points+"<br><small class='text-muted' style='font-weight: normal;'>"+hours+":"+minutes+"</small></td>";
			}
			else
			{
				if (value.rejectedAttemptCount > 0)
				tableRow += "<td class='text-center' style = 'color:red;font-weight: bold'>-"+value.rejectedAttemptCount+"</td>";
				else
					tableRow += "<td class='text-center'><br><br></td>";
			}
			
		});

		// update behaviour
		if (newContestId)
			$("tbody").append("<tr id='user"+index+"'>"+tableRow+"</tr>");
		else
			$("#user"+index).html(tableRow);
	});

	// Refresh every 60 seconds
	newContestId = false;
	if (autoRefresh) statusRefresh = setTimeout("getStandings()",60000);
	$("input").prop('disabled', false);
	$('.btn').attr("disabled", false);
	$("#loading").fadeOut(1000);
}

function getExpectedRank()
{
	$.each(contestantList, function(index,value) {
		cloneTemp[index].index=index;
		cloneTemp[index].userInfo=value.userInfo;
	});
	cloneTemp.sort(sortByRating);

	var lastRating = -1;
	var lastRank = -1;
	$.each(cloneTemp, function(index,value) {
		if (value.userInfo.rating === lastRating)
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
		if (value.userInfo.country === undefined) value.userInfo.country = "~";
		if (value.userInfo.rating  === undefined) value.userInfo.rating  = 1500;
		value.hackBalance = value.successfulHackCount-value.unsuccessfulHackCount;
	});
	getExpectedRank();
}

function doSort()
{
	if (getUrlParameter("sortByRating") === "true")
	{
		contestantList.sort(sortByRating);
	}
	else if (getUrlParameter("sortByHandle") === "true")
	{
		contestantList.sort(sortByHandle);
	}
	else if (getUrlParameter("sortByCountry") === "true")
	{
		contestantList.sort(sortByCountry);
	}
	else if (getUrlParameter("sortByHack") === "true")
	{
		contestantList.sort(sortByHack);
	}
	else
	{
		contestantList.sort(sortByRank);
	}

}

function finalize()
{
	$("#loading-message").html("Working");
	doSort();
	showTableBody();
}

function getUser(size,handle)
{
	$("#loading-message").html("Retrieving user information ("+Math.round(((contestantList.length-size)/contestantList.length)*100)+"%)");
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
				$("#loading-message").html("Retrieving user information ("+Math.round(((contestantList.length-size)/contestantList.length)*100)+"%)");
				getAdditionalData();
				finalize();
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
			$("#loading-message").html("Failed to retrieve user information");
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
			participant.index = realIndex;
			participant.participantType = value.party.participantType;
			participant.rank = realIndex+1;
			participant.points = value.points;
			participant.penalty = value.penalty;
			participant.successfulHackCount = value.successfulHackCount;
			participant.unsuccessfulHackCount = value.unsuccessfulHackCount;
			participant.problemResults = value.problemResults;
			$.each(participant.problemResults,function(index,value)
			{
				if (value.points > 0)
				{
					fastestSolve[index] = Math.min(fastestSolve[index],value.bestSubmissionTimeSeconds);
				}
			});
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
	
	$("thead").append('<tr><td class="text-center vertical-align" id="table-rank">Rank</td><td class="text-center vertical-align" id="table-exp-rank">Exp. Rank</td><td id="table-country" class="vertical-align">Country</td><td id="table-handle" class="vertical-align">Handle</td><td class="text-center vertical-align" id="table-rating">Rating</td><td class="text-center vertical-align" id="table-point">Points</td><td class="text-center vertical-align" id="table-hack">Hack</td></tr>');
	
	fastestSolve = [];
	var problemData = result.problems;
	$.each(problemData, function(index,value) {
		$("thead > tr").append("<td class='text-center vertical-align'>"+ value.index+"<br><strong><small>"+value.points+"</small></strong></td>");
		fastestSolve.push(1000000000);
	});
}

function reset() {
	contestantList = [];
	cloneTemp = [];
	requestedUser = [];
}

function getStandings(){
	$("input").prop('disabled', true);
	$('.btn').attr("disabled", true);
	$("#loading").fadeIn();
	console.log("getStandings : "+requestedId);
	$("#loading-message").html("Retrieving standings data");
	reset();
	$.ajax({
		url: 'http://codeforces.com/api/contest.standings',
		dataType: 'JSONP',
		data : {
			jsonp:"callback",
			contestId:requestedId,
			from:1,
			showUnofficial:(getUrlParameter("showUnofficial") === "true")
		},
		jsonpCallback: 'callback',
		type: 'GET',
		success: function (data) {
			console.log("standings data successfully retrieved | newContestId:"+newContestId);
			if (newContestId===true) showTableHead(data.result);
			autoRefresh=(data.result.contest.phase === "CODING");
			if (autoRefresh === 0 && statusRefresh !== undefined) clearInterval(statusRefresh);
			extractRow(data.result.rows);
		},
		error: function(){
			console.log("failed to retrieve standings data, try again in 5 seconds");
			$("#loading-message").html("Failed to retrieve standings data");
			setTimeout("getStandings()",5000);
		}
	});
}

updateURL = function(parameter) {
	$("#loading").fadeIn();
	console.log("triggered "+ parameter);
	var url = "index.html?id="+requestedId;
	if (parameter === "sortByRank") {
		if (getUrlParameter("sortByRank") !=="true") url += "&sortByRank=true";
	}
	if (parameter === "sortByRating") {
		if (getUrlParameter("sortByRating") !=="true") url += "&sortByRating=true";
	}
	if (parameter === "sortByHandle") {
		if (getUrlParameter("sortByHandle") !=="true") url += "&sortByHandle=true";
	}
	if (parameter === "sortByCountry") {
		if (getUrlParameter("sortByCountry") !=="true") url += "&sortByCountry=true";
	}
	if (parameter === "sortByHack") {
		if (getUrlParameter("sortByHack") !=="true") url += "&sortByHack=true";
	}
	if (getUrlParameter("showUnofficial") === "true") url += "&showUnofficial=true";
	window.history.pushState({},"",url);
	finalize();
}

$(document).ready(function() {
	$("thead").on("click","#table-rank",function(){
		updateURL("sortByRank");
	});
	$("thead").on("click","#table-country",function() {
		updateURL("sortByCountry");
	});
	$("thead").on("click","#table-handle",function() {
		updateURL("sortByHandle");
	});
	$("thead").on("click","#table-rating",function() {
		updateURL("sortByRating");
	});
	$("thead").on("click","#table-point",function() {
		updateURL("sortByRank");
	});
	$("thead").on("click","#table-hack",function() {
		updateURL("sortByHack");
	});
	$("thead").on("click","#table-exp-rank",function() {
		updateURL("sortByRating");
	});
});