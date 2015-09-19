package com.github.cshankland.extralife.model;

import org.jsoup.nodes.Document;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Created by Chris on 9/19/15.
 */
public class TeamInfo {

	public final String name;
	public final List<TeamMemberInfo> teamMembers;

	public TeamInfo(Document document) {
		name = document
				.getElementById("team-name")
				.getElementsByTag("h1")
				.first()
				.html();

		teamMembers = document
				.getElementById("team")
				.getElementsByTag("a")
				.stream()
				.map(TeamMemberInfo::new)
				.collect(Collectors.toList());
	}

}
