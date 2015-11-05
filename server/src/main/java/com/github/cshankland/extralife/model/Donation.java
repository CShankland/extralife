package com.github.cshankland.extralife.model;

import org.jsoup.nodes.Element;

/**
 * Created by Chris on 9/19/15.
 */
public class Donation {

	public final String name;
	public final float amount;
	public final String date;

	public Donation(Element element) {
		date = element.getElementsByTag("small").first().html();
		System.out.println("Date: " + date);

		// We have to parse the rest into a name and amount
		String detail = element.getElementsByTag("strong").first().html();
		System.out.println("Detail: " + detail);

		int donatedIndex = detail.indexOf(" donated");
		if (-1 == donatedIndex) {
			System.out.println("Unexpected detail: " + detail);
			name = "Unknown";
		} else {
			name = detail.substring(0, donatedIndex).trim();
		}

		float amount;
		try {
			amount = Float.parseFloat(
					detail.substring(detail.indexOf("$") + 1)
			);
		} catch (NumberFormatException nfe) {
			amount = 0;
		}
		this.amount = amount;

		System.out.println("Parsed donation of " + amount + " by " + name + " on " + date);
	}

}
