var sortByRating = function (element1,element2) {
	if (element1.userInfo.rating !== element2.userInfo.rating)
	{
		if (element1.userInfo.rating > element2.userInfo.rating) return -1;
		else return 1;
	}
	else
	{
		if (element1.index > element2.index) return 1;
		else return -1;
	}
}

var sortByHandle = function (element1,element2) {
	if (element1.userInfo.handle !== element2.userInfo.handle)
	{
		if (element1.userInfo.handle < element2.userInfo.handle) return -1;
		else return 1;
	}
	else
	{
		if (element1.index > element2.index) return 1;
		else return -1;
	}
}

var sortByCountry = function (element1,element2) {
	if (element1.userInfo.country !== element2.userInfo.country)
	{
		if (element1.userInfo.country < element2.userInfo.country) return -1;
		else return 1;
	}
	else
	{
		if (element1.index > element2.index) return 1;
		else return -1;
	}
}

var sortByHack = function (element1,element2) {
	if (element1.hackBalance !== element2.hackBalance)
	{
		if (element1.hackBalance > element2.hackBalance) return -1;
		else return 1;
	}
	else
	{
		if (element1.index > element2.index) return 1;
		else return -1;
	}
}

var sortByRank = function (element1,element2) {
	if (element1.index > element2.index) return 1;
	else return -1;
}