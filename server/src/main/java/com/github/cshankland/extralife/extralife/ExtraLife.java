package com.github.cshankland.extralife.extralife;

import com.github.cshankland.extralife.http.HttpConnectionPool;
import com.github.cshankland.extralife.model.Donation;
import com.github.cshankland.extralife.model.UserInfo;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.util.EntityUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Extra life scraping class
 *
 * Created by Chris on 9/19/15.
 */
public class ExtraLife {

	private static final Logger logger = LoggerFactory.getLogger(ExtraLife.class);

	private static final String SCHEME = "http";
	private static final String HOST = "www.extra-life.org";
	private static final String PATH ="/index.cfm";

	private static final String ACTION_PARAM = "fuseaction";
	private static final String PROFILE_ACTION = "donorDrive.participant";
	private static final String DONATION_ACTION = "donorDrive.participantDonations";

	private final HttpConnectionPool httpPool;

	public ExtraLife(HttpConnectionPool httpPool) {
		this.httpPool = httpPool;
	}

	public CompletableFuture<List<Donation>> getDonations(String participantId) {
		URIBuilder builder = createBuilder(DONATION_ACTION);
		builder.setParameter("participantId", participantId);

		return get(builder, Collections.emptyList(), (document -> {
			Elements elements = document.getElementsByClass("donor-detail");
			return elements.stream()
					.map(Donation::new)
					.collect(Collectors.toList());
		}));
	}

	public CompletableFuture<UserInfo> getUserInfo(String participantId) {
		URIBuilder builder = createBuilder(PROFILE_ACTION);
		builder.setParameter("participantId", participantId);
		return get(builder, null, UserInfo::new);
	}

	private <T> CompletableFuture<T> get(URIBuilder builder, T defaultValue, Function<Document, T> handler) {
		try {
			URI uri = builder.build();
			HttpGet httpGet = new HttpGet(uri);

			return httpPool.performRequest(httpGet)
					.thenApply(response -> {
						try {
							String jsonString = EntityUtils.toString(response.getEntity());
							Document document = Jsoup.parse(jsonString);
							return handler.apply(document);
						} catch (IOException ioe) {
							ioe.printStackTrace();
							throw new RuntimeException(ioe);
						}
					});
		} catch (URISyntaxException e) {
			e.printStackTrace();
			return CompletableFuture.completedFuture(defaultValue);
		}
	}

	private static URIBuilder createBuilder(String action) {
		return new URIBuilder().setScheme(SCHEME).setHost(HOST).setPath(PATH).setParameter(ACTION_PARAM, action);
	}
}
