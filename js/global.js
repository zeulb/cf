var ignoredPhase = ["BEFORE"];
var contestList = []; // List of retrieved contest list
var contestMap = {};  // A mapping between contest id and contest name

var ignoredparticipantType = ["VIRTUAL","PRACTICE"];
var isOfficial = ["CONTESTANT"];
var cloneTemp = [];
var requestedUser = [];
var contestantList = [];
var newContestId = true;
var maxUserEachRetrieval = 300;
var colorUserMapping = {
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


Array.prototype.contains = function(k) {
  for(var i=0; i < this.length; i++){
    if(this[i] === k){
      return true;
    }
  }
  return false;
}

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