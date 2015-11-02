define(function(require, exports, module) {

	var REST = require("./util/REST");

	var serverRoot = "http://127.0.0.1:7100/";
	var teamId = 20874;
	var eventId = 525;

	// Get our output elements
	var totalDonationSpan = document.getElementById("total-donations");
	var totalDonationEffectSpan = document.getElementById("total-donations-effects");
	var latestDonationValueSpan = document.getElementById("latest-donation-value");
	var latestDonationNameSpan = document.getElementById("latest-donation-name");

	var baseAmountRaised = 1337.69;
	var amountRaised = 1337.69;
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

	var donationIndex = 0;
	var donations = [
		{ name: "KingArthurofTintagelBOOBS", value: 500 },
		{ name: "John Doe", value: 20 },
		{ name: "Anonymous", value: 10 },
		{ name: "King-Arthur-of-Tintagel", value: 500 }
	];

	function nextDonation() {
		var donation = donations[donationIndex];
		donationIndex = (donationIndex + 1) % donations.length;

		return rolloverDonation(donation.name, donation.value)
			.then(nextDonation);
	};

	nextDonation();

/*
	var donationsByUser = {};
	function loadRecentDonations(id, skipNotify) {
		return REST.get(serverRoot + "donations/" + id, { responseType: "json" })
			.then(function processDonations(results) {
				var knownDonationCount = donationsByUser[id].length;
				if (results.length === knownDonationCount) {
					return;
				}

				for (var idx = knownDonationCount; idx < results.length; ++idx) {
					donationsByUser[id].push(results[idx]);

					if (! skipNotify) {
						onDonationReceived(id, results[id]);
					}
				}
			});
	};
*/

});
