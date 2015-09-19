package com.github.cshankland.extralife;

import com.github.cshankland.extralife.extralife.ExtraLife;
import com.github.cshankland.extralife.http.HttpConnectionPool;
import org.apache.log4j.PropertyConfigurator;
import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.HandlerList;
import org.eclipse.jetty.servlet.FilterHolder;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.eclipse.jetty.servlets.CrossOriginFilter;
import org.glassfish.jersey.servlet.ServletContainer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.DispatcherType;
import java.io.File;
import java.net.URL;
import java.util.EnumSet;
import java.util.HashMap;

public class Main {

	private static final String TEAM_ID = "";
	private static final String EVENT_ID = "";

	private static final Logger logger = LoggerFactory.getLogger(Main.class);

	public static void main(String[] args) {
		configureLog4j();

		HttpConnectionPool connectionPool = new HttpConnectionPool();
		ExtraLife extraLife = new ExtraLife(connectionPool);
		ExtralifeServerResources serverResources = new ExtralifeServerResources(extraLife);

		ServletContainer container = new ServletContainer(serverResources);
		ServletHolder holder = new ServletHolder(container);

		Server server = new Server(7100);

		ServletContextHandler restContext = new ServletContextHandler(server, "/", ServletContextHandler.SESSIONS);
		restContext.addServlet(holder, "/*");
		FilterHolder corsFilterHolder = restContext.addFilter(CrossOriginFilter.class, "/*", EnumSet.allOf(DispatcherType.class));

		HashMap<String, String> corsParams = new HashMap<>();
		corsParams.put("allowedMethods", "GET,POST,HEAD,PUT,DELETE");
		corsFilterHolder.setInitParameters(corsParams);

		HandlerList handlers = new HandlerList();
		handlers.setHandlers(new Handler[] { restContext });

		server.setHandler(handlers);

		try {
			server.start();
			server.join();
		} catch (Exception e) {
			logger.error("Big Ole' Server Error", e);
		}

	}

	public static void configureLog4j() {
		// Configure from built in config
		ClassLoader loader = Main.class.getClassLoader();
		URL configUrl = loader.getResource("log4j.properties");
		if (null != configUrl) {
			PropertyConfigurator.configure(configUrl);
		}

		// Then check for config file
		File log4jFile = new File("config/log4j.properties");
		PropertyConfigurator.configureAndWatch(log4jFile.getAbsolutePath());
	}
}