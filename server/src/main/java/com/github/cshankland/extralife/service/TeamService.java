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
public class TeamService {

	private final ExtraLife extraLife;

	public TeamService(ExtraLife extraLife) {
		this.extraLife = extraLife;
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/teams/{teamId}")
	public void getDonations(@PathParam("teamId") String teamId, @Suspended AsyncResponse asyncResponse) {
		extraLife.getTeamInfo(teamId)
				.whenComplete((teamInfo, throwable) -> {
					if (null != throwable) {
						throwable.printStackTrace();
						asyncResponse.resume(throwable);
						return;
					}

					asyncResponse.resume(Response.ok(teamInfo).build());
				});
	}
}
