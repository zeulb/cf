var caches = {};
var ignoredPhase = ["BEFORE"];
var contestList = []; // List of retrieved contest list
var contestMap = {};  // A mapping between contest id and contest name

var ignoredparticipantType = ["VIRTUAL","PRACTICE"];
var isOfficial = ["CONTESTANT"];
var cloneTemp = [];
var requestedUser = [];
var requestedIndex = [];
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
var countryList = ["Global",
	"Russia","Belarus","China","Japan","United States (USA)","Poland","Ukraine","Taiwan","Korea, Republic of","Kazakhstan","Vietnam","Iran","Croatia","Romania","Korea,DPR","Slovakia","Indonesia","Hong Kong","Latvia","India","Bulgaria","Germany","Brazil","Canada","Georgia","Thailand","Switzerland","Sweden","Finland","Serbia","Egypt","Czech Republic","Bangladesh","Australia","Armenia","Turkiye","Uzbekistan","Peru","United Kingdom","Colombia","Lithuania","Spain","France","Italy","Argentina","Kyrgyzstan","Mexico","Hungary","Syria","Belgium","Cuba","Catalonia","Mongolia","Austria","South Africa","Turkmenistan","Philippines","Slovenia","Venezuela","Estonia","Norway","Singapore","Tajikistan","Bolivia","Malaysia","Moldova","The Netherlands","Macedonia","Azerbaijan","Greece","Portugal","Jordan","Lebanon","Antarctica","Dominican Republic","Morocco","Sri Lanka","Bosnia and Herzegovina","Ireland","Tunisia","Cyprus","Denmark","Israel","Mete","Montenegro","Chile","Iceland","New Zealand","Mauritius","Zimbabwe","Macau","Gensokyo","Hubei","Oman","Madagascar","PRC","Nada","Pakistan","Nepal","Ghana","Kyrgyzstans","Mozambique","Zambia","Two_friends_say_that_I_have_no_life. Yeah_it_true.I_am_useless.","Valencian Country","AngelBeats","Uruguay","Haiti","Burundi","Albania","Iraq","GDL","Benin","Palestine","Nigeria","Saudi Arabia","Honduras","Algeria"
]

var autoRefresh = false;
var statusRefresh;
var fastestSolve;

$("#loading").hide();

Array.prototype.contains = function(k) {
  for(var i=0; i < this.length; i++){
    if(this[i] === k){
      return true;
    }
  }
  return false;
}

function padding(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

var unofficialnobtn = '<a href="#" class="btn btn-success" role="button" id="unofficial-no">show unofficial&nbsp <span class="glyphicon glyphicon-remove"></span></a>';
var unofficialokbtn = '<a href="#" class="btn btn-warning" role="button" id="unofficial-ok">show unofficial&nbsp <span class="glyphicon glyphicon-ok"></span></a>';


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