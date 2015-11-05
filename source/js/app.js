define(function(require, exports, module) {

	var REST = require("./util/REST");

	var serverRoot = "https://slots-stage-web.bigvikinggames.com/extralife-api/";
	var teamId = 20874;
	var eventId = 525;

	// Get our output elements
	var totalDonationSpan = document.getElementById("total-donations");
	var totalDonationEffectSpan = document.getElementById("total-donations-effects");
	var latestDonationValueSpan = document.getElementById("latest-donation-value");
	var latestDonationNameSpan = document.getElementById("latest-donation-name");

	var baseAmountRaised = 0;
	var amountRaised = 0;
	var epsilon = 0.01;
	var countupDuration = 2000;

	function formatDonation(donation) {
		return "$" + donation.toFixed(2).toLocaleString();
	};

	function updateTotalDonationLabel(value) {
		totalDonationSpan.innerHTML = formatDonation(value);
	};

	function showUpdateHighlight(value, resolver) {
		var formattedValue = formatDonation(value);
		totalDonationEffectSpan.innerHTML = formattedValue;

		totalDonationEffectSpan.style.display = "block";

		// Lookup where we need to start from
		var left = totalDonationSpan.parentNode.offsetLeft + 10;
		var top = totalDonationSpan.parentNode.offsetTop + 9;

		totalDonationEffectSpan.style.left = left + "px";
		totalDonationEffectSpan.style.top = top + "px";
		totalDonationEffectSpan.style.transition = "1s ease-out";
		
		setTimeout(function () {
			totalDonationEffectSpan.style.transform = "scale(2, 2)";
			totalDonationEffectSpan.style.opacity = 0;
		}, 0);
		setTimeout(function() {
			totalDonationEffectSpan.style.display = "none";
			totalDonationEffectSpan.style.opacity = 1;
			totalDonationEffectSpan.style.transform = "";
			totalDonationEffectSpan.style.transition = "";

			setTimeout(resolver, 1200);
		}, 1200);
	};

	var animationHandle = null;
	var boundUpdate = null;
	var startTimestamp = null;
	function updateTotalDonation(resolver, timestamp) {
		if (null === startTimestamp) {
			startTimestamp = timestamp;
			window.requestAnimationFrame(boundUpdate);
			return;
		}

		var dt = timestamp - startTimestamp;
		var amountDelta = amountRaised - baseAmountRaised;
		var t = dt / countupDuration;

		if (t >= 1 || amountDelta <= epsilon) {
			baseAmountRaised = amountRaised;
			updateTotalDonationLabel(amountRaised);
			showUpdateHighlight(amountRaised, resolver);
			return;
		}

		var intermediateValue = baseAmountRaised + amountDelta * t;
		updateTotalDonationLabel(intermediateValue);

		animationHandle = window.requestAnimationFrame(boundUpdate);
	};

	function beginCountup(resolver) {
		startTimestamp = null;
		if (animationHandle) {
			window.cancelAnimationFrame(animationHandle);
		}

		boundUpdate = updateTotalDonation.bind(null, resolver);
		animationHandle = window.requestAnimationFrame(boundUpdate);
	};

	function rolloverDonation(name, value) {
		return new Promise(function (resolve, reject) {
			latestDonationValueSpan.style.opacity = 0;
			latestDonationNameSpan.style.opacity = 0;

			setTimeout(function() {
				latestDonationValueSpan.innerHTML = formatDonation(value);
				latestDonationNameSpan.innerHTML = name;

				latestDonationValueSpan.style.opacity = 1;
				latestDonationNameSpan.style.opacity = 1;

				amountRaised += value;
				return beginCountup(resolve);
			}, 1200);
		});
	};

	var updatePromise = Promise.resolve(true);
	function queueDonation(name, value) {
		updatePromise = updatePromise.then(rolloverDonation(name, value));
	};

	var donationsByUser = {};
	function checkRecentDonations(id) {
		return REST.get(serverRoot + "donations/" + id, { responseType: "json" })
		    .then(function processDonations(results) {
		    	if (! donationsByUser[id]) {
		    		donationsByUser[id] = [];
		    	}

		    	var knownDonations = donationsByUser[id];
		    	for (var idx = knownDonations.length; idx < results.length; ++idx) {
		    		var donation = results[idx];
		    		queueDonation(donation.name, donation.amount);
		    		knownDonations.push(donation);
		    	}
		    })
		    .then(function pause() {
		    	return new Promise(function resolver(resolve, reject) {
		    		setTimeout(resolve, 60000);
		    	});
		    })
		    .then(function checkAgain() {
		    	return checkRecentDonations(id);
		    });
	};

	REST.get(serverRoot + "teams/" + teamId, { responseType: "json" })
	    .then(function beginCheckingForDonations(teamData) {
	    	var members = teamData.teamMembers;

	    	Promise.all(
	    		members.map(function loadRecentDonations(teamMember) {
	    			return REST.get(serverRoot + "donations/" + teamMember.id, { responseType: "json" });
	    		})
	    	).then(function processInitialResults(arrResults) {
	    		var donations = [];
	    		arrResults.forEach(function (result, idx) { 
	    			donations = donations.concat(result);
	    			donationsByUser[members[idx].id] = result;
	    		});

	    		donations.sort(function (a, b) { return a.date - b.date; });

	    		donations.forEach(function countDonation(donation) { 
	    			amountRaised += donation.amount;
	    			baseAmountRaised += donation.amount;
	    		});

	    		var lastDonation = donations[donations.length - 1];
	    		latestDonationValueSpan.innerHTML = formatDonation(lastDonation.amount);
				latestDonationNameSpan.innerHTML = lastDonation.name;

				updateTotalDonationLabel(baseAmountRaised);
	    	})
	    	.then(function beginPolling() {
	    		members.forEach(function startPoll(teamMember, idx) {
	    			setTimeout(checkRecentDonations.bind(null, teamMember.id), 30000 + idx * 5000);
	    		});
	    	});
	    });
});
