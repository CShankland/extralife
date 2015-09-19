package com.github.cshankland.extralife.model;

import org.jsoup.nodes.Document;

/**
 * This is the info about a user we know
 *
 * Created by Chris on 9/19/15.
 */
public class UserInfo {
	public final String name;
	public final String image;
	public final String donateURL;
	public final String team;
	public final String teamURL;

	public UserInfo(Document document) {
		name = document.getElementById("participant-name").getElementsByTag("h1").first().html();
		image = document
				.getElementsByClass("avatar")
				.first()
				.getElementsByTag("img")
				.stream()
				.filter(element -> element.hasClass("profile-img"))
				.findFirst()
				.map(element -> element.attr("src"))
				.orElse("");
		donateURL = document
				.getElementsByClass("btn-support-card")
				.first()
				.attr("href");
		team = document
				.getElementsByClass("link-team")
				.first()
				.ownText();
		teamURL = "http://www.extra-life.org/" + document
				.getElementsByClass("link-team")
				.first()
				.attr("href");
	}
}
