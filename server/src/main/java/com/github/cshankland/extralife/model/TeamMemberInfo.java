package com.github.cshankland.extralife.model;

import org.jsoup.nodes.Element;

/**
 * Created by Chris on 9/19/15.
 */
public class TeamMemberInfo {
	public final String name;
	public final String id;
	public final float amount;

	public TeamMemberInfo(Element element) {
		String link = element.attr("href");
		id = link.substring(link.lastIndexOf("=") + 1);
		name = element.getElementsByTag("span")
				.last()
				.getElementsByTag("strong")
				.first()
				.ownText()
				.trim();
		amount = Float.parseFloat(
					element.getElementsByTag("span")
						.last()
						.getElementsByTag("div")
						.first()
						.getElementsByTag("small")
						.first()
						.getElementsByTag("strong")
						.first()
						.ownText()
						.trim()
						.substring(1)
						.replace(",", "")
		);
	}
}
