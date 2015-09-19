package com.github.cshankland.extralife.http;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;

/**
 * Helper class for performing HTTP requests on a seperate thread pool, while
 * using a HTTP connection pool.
 */
public class HttpConnectionPool {
	private PoolingHttpClientConnectionManager connectionManager;
	private CloseableHttpClient httpClient;

	private Executor executor;

	/**
	 * Creates a new connection pool.
	 */
	public HttpConnectionPool() {
		connectionManager = new PoolingHttpClientConnectionManager();
		connectionManager.setMaxTotal(100);
		connectionManager.setDefaultMaxPerRoute(20);

		httpClient = HttpClients.custom().setConnectionManager(connectionManager).build();

		executor = Executors.newCachedThreadPool();
	}

	/**
	 * Performs an HTTP request.  Returns a CompletableFuture that will complete (or fail) when
	 * the HTTP request is resolved.
	 *
	 * @param request the HTTP request
	 * @return a CompletableFuture instance
	 */
	public CompletableFuture<HttpResponse> performRequest(HttpUriRequest request) {
		CompletableFuture<HttpResponse> future = new CompletableFuture<>();

		executor.execute(() -> {
			try {
				System.out.println("Executing");
				HttpResponse response = httpClient.execute(request);
				future.complete(response);
			} catch (Exception e) {
				e.printStackTrace();
				future.completeExceptionally(e);
			}
		});

		return future;
	}
}

