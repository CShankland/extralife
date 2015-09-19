define(function(require, exports, module) {

	var REST = require("./util/REST");

	var serverRoot = "http://127.0.0.1:7100/";
	var teamId = 20874;
	var eventId = 525;

	var notificationQueue = Promise.resolve(true);
	function queueNotification(notificationHandler) {
		notificationQueue.then(notificationHandler);
	};

	function $(sel) { return document.querySelector(sel); };

	var container = $("#message-container");
	var content = $("#message-content");

	function createNotification(textColor, backgroundColor, message) {
		return function notification() {
			return new Promise(function resolver(resolve, reject) {
				container.style.backgroundColor = backgroundColor;
				content.style.color = textColor;
				content.innerHTML = message;

				setTimeout(resolve, 250);
			})
			.then(function nextStep() {
				return new Promise(function resolver(resolve, reject) {
					content.style.display = true;
					setTimeout(function() {
						content.style.fontSize = "60px";
						setTimeout(resolve, 3250);
					});
				});
			})
			.then(function nextStep() {
				return new Promise(function resolver(resolve, reject) {
					content.style.fontSize = "10px";
					setTimeout(resolve, 250);
				});
			})
			.then(function finalStep() {
				return new Promise(function resolver(resolve, reject) {
					container.style.backgroundColor = "transparent";
					content.style.display = false;

					setTimeout(resolve, 250);
				});
			})
		};
	};

	var teamMembers = {};
	function pollTeamMembers(delay) {
		REST.get(serverRoot + "teams/" + teamId, { responseType: "json" })
			.then(function handleMembers(teamInfo) {
				var teamMembers = teamInfo.teamMembers;
				teamMembers.forEach(function processMember(member) {
					if (teamMembers[member.id]) {
						return;
					}

					teamMembers[member.id] = {
						name: member.name,
						amount: member.amount
					};

					// onTeamMemberAdded(member.id);
				});
			})
			.then(function wait() {
				return new Promise(function resolver(resolve, reject) {
					setTimeout(resolve, delay);
				});
			})
			.then(function repeat() {
				pollTeamMembers(delay);
			});
	};

	REST.get(serverRoot + "teams/" + teamId, { responseType: "json" })
		.then(function startTeamMemberWatch(results) {
			var members = results.teamMembers;
			members.forEach(function cacheMember(member) {
				teamMembers[member.id] = {
					name: member.name,
					amount: member.amount
				};
			});

			pollTeamMembers(500);

		});

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
	}

	window.queueNotification = queueNotification;
	window.createNotification = createNotification;

});
