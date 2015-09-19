package com.github.cshankland.extralife;

import com.github.cshankland.extralife.extralife.ExtraLife;
import com.github.cshankland.extralife.service.DonationService;
import com.github.cshankland.extralife.service.UserService;
import com.github.cshankland.extralife.util.JacksonFeature;
import org.glassfish.jersey.server.ResourceConfig;

/**
 * Created by Chris on 9/19/15.
 */
public class ExtralifeServerResources extends ResourceConfig {

	public ExtralifeServerResources(ExtraLife extraLife) {
		register(JacksonFeature.class);

		register(new DonationService(extraLife));
		register(new UserService(extraLife));
	}

}
