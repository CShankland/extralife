package com.github.cshankland.extralife.service;

import com.github.cshankland.extralife.extralife.ExtraLife;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.container.AsyncResponse;
import javax.ws.rs.container.Suspended;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * Created by Chris on 9/19/15.
 */
@Path("/")
public class DonationService {

	private final ExtraLife extraLife;

	public DonationService(ExtraLife extraLife) {
		this.extraLife = extraLife;
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/donations/{participantId}")
	public void getDonations(@PathParam("participantId") String participantId, @Suspended AsyncResponse asyncResponse) {
		extraLife.getDonations(participantId)
				.whenComplete((donations, throwable) -> {
					if (null != throwable) {
						asyncResponse.resume(throwable);
						return;
					}

					asyncResponse.resume(Response.ok(donations).build());
				});
	}
}
