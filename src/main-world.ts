// This script runs in the page's main world and can override fetch/XMLHttpRequest

interface MockRule {
	id: string;
	url: string;
	method: 'ANY' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	responseCode: number;
	responseHeaders: Record<string, string>;
	responseBody: string;
	requestCount: number;
	enabled: boolean;
}

class ApiMockerMainWorld {
	private enabled: boolean = false;
	private rules: MockRule[] = [];
	private originalFetch: typeof fetch;
	private originalXMLHttpRequest: typeof XMLHttpRequest;

	constructor() {
		// Store original functions before overriding them
		this.originalFetch = window.fetch;
		this.originalXMLHttpRequest = window.XMLHttpRequest;

		this.initializeListeners();
		this.overrideNetworkFunctions();
	}

	private initializeListeners(): void {
		// Listen for messages from content script
		window.addEventListener('message', (event) => {
			if (event.source !== window || !event.data.type) return;

			if (event.data.type === 'API_MOCKER_UPDATE_STATE') {
				this.enabled = event.data.enabled;
				this.rules = event.data.rules || [];
			}
		});
	}

	private overrideNetworkFunctions(): void {
		// Override fetch
		window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
			try {
				const url =
					typeof input === 'string'
						? input
						: input instanceof URL
						? input.href
						: (input as Request).url;
				const method = (init?.method || 'GET').toUpperCase();

				if (this.enabled) {
					const matchingRule = this.findMatchingRule(url, method);
					if (matchingRule) {
						console.log('[API Mocker] Mocking fetch request:', method, url, matchingRule);

						// Notify content script about the match
						window.postMessage(
							{
								type: 'API_MOCKER_REQUEST_INTERCEPTED',
								ruleId: matchingRule.id,
							},
							'*'
						);

						// Add a small delay to simulate network latency
						await new Promise((resolve) => setTimeout(resolve, 1000));

						// Create proper status text based on response code
						const getStatusText = (code: number): string => {
							if (code >= 200 && code < 300) return 'OK';
							if (code >= 300 && code < 400) return 'Redirect';
							if (code >= 400 && code < 500) return 'Client Error';
							if (code >= 500) return 'Server Error';
							return 'Unknown';
						};

						// Ensure headers are properly formatted
						const responseHeaders = new Headers();
						Object.entries(matchingRule.responseHeaders || {}).forEach(([key, value]) => {
							responseHeaders.set(key, String(value));
						});

						// Set default content-type if not provided
						if (!responseHeaders.has('content-type')) {
							try {
								JSON.parse(matchingRule.responseBody);
								responseHeaders.set('content-type', 'application/json');
							} catch (e) {
								responseHeaders.set('content-type', 'text/plain');
							}
						} // Ensure we have a valid response body
						const responseBody = matchingRule.responseBody || '';
						const safeJson = responseBody.replace(/,\s*([\]}])/g, '$1');
						const parsed = JSON.parse(safeJson);
						console.log('[API Mocker] Response body:', typeof parsed, parsed);
						const response = new Response(JSON.stringify(parsed), {
							status: matchingRule.responseCode,
							statusText: getStatusText(matchingRule.responseCode),
							headers: responseHeaders,
						});

						return response;
					}
				}

				return await this.originalFetch.call(window, input, init);
			} catch (error) {
				console.error('[API Mocker] Error in fetch override:', error);
				// Fallback to original fetch in case of any error
				return await this.originalFetch.call(window, input, init);
			}
		};

		// Override XMLHttpRequest
		const originalXHR = this.originalXMLHttpRequest;
		const apiMocker = this;

		window.XMLHttpRequest = class extends originalXHR {
			private _url: string = '';
			private _method: string = 'GET';

			constructor() {
				super();
			}

			open(
				method: string,
				url: string | URL,
				async: boolean = true,
				user?: string | null,
				password?: string | null
			): void {
				this._method = method;
				this._url = typeof url === 'string' ? url : url.href;
				super.open(method, url, async, user, password);
			}

			send(body?: Document | XMLHttpRequestBodyInit | null): void {
				if (apiMocker.enabled) {
					const matchingRule = apiMocker.findMatchingRule(this._url, this._method.toUpperCase());
					if (matchingRule) {
						console.log('[API Mocker] Mocking XHR request:', this._method, this._url, matchingRule);

						// Notify content script about the match
						window.postMessage(
							{
								type: 'API_MOCKER_REQUEST_INTERCEPTED',
								ruleId: matchingRule.id,
							},
							'*'
						);

						// Simulate the complete XHR lifecycle
						const simulateResponse = () => {
							// Set response headers methods
							const getResponseHeader = (name: string) => {
								return (
									matchingRule.responseHeaders[name] ||
									matchingRule.responseHeaders[name.toLowerCase()] ||
									null
								);
							};

							const getAllResponseHeaders = () => {
								return Object.entries(matchingRule.responseHeaders)
									.map(([key, value]) => `${key}: ${value}`)
									.join('\r\n');
							};

							this.getResponseHeader = getResponseHeader;
							this.getAllResponseHeaders = getAllResponseHeaders;

							// State 1: OPENED (request opened)
							Object.defineProperty(this, 'readyState', {
								value: 1,
								writable: true,
								configurable: true,
							});
							if (this.onreadystatechange) {
								this.onreadystatechange.call(this, new Event('readystatechange'));
							}

							setTimeout(() => {
								// State 2: HEADERS_RECEIVED
								Object.defineProperty(this, 'readyState', {
									value: 2,
									writable: true,
									configurable: true,
								});
								Object.defineProperty(this, 'status', {
									value: matchingRule.responseCode,
									writable: false,
									configurable: true,
								});
								Object.defineProperty(this, 'statusText', {
									value:
										matchingRule.responseCode >= 200 && matchingRule.responseCode < 300
											? 'OK'
											: 'Error',
									writable: false,
									configurable: true,
								});

								if (this.onreadystatechange) {
									this.onreadystatechange.call(this, new Event('readystatechange'));
								}

								setTimeout(() => {
									// State 3: LOADING
									Object.defineProperty(this, 'readyState', {
										value: 3,
										writable: true,
										configurable: true,
									});
									if (this.onreadystatechange) {
										this.onreadystatechange.call(this, new Event('readystatechange'));
									}

									setTimeout(() => {
										const responseBody = matchingRule.responseBody || '';
										const safeJson = responseBody.replace(/,\s*([\]}])/g, '$1');
										const parsed = JSON.parse(safeJson);
										// State 4: DONE
										Object.defineProperty(this, 'readyState', {
											value: 4,
											writable: true,
											configurable: true,
										});
										Object.defineProperty(this, 'responseText', {
											value: parsed,
											writable: false,
											configurable: true,
										});
										Object.defineProperty(this, 'response', {
											value: parsed,
											writable: false,
											configurable: true,
										});

										// Try to parse as JSON for responseType handling
										try {
											const parsedResponse = JSON.parse(matchingRule.responseBody);
											Object.defineProperty(this, 'responseJSON', {
												value: parsedResponse,
												writable: false,
												configurable: true,
											});
										} catch (e) {
											// Not JSON, keep as text
										}
										if (this.onreadystatechange) {
											this.onreadystatechange.call(this, new Event('readystatechange'));
										}

										if (this.onload) {
											this.onload.call(
												this,
												new ProgressEvent('load', {
													lengthComputable: true,
													loaded: matchingRule.responseBody.length,
													total: matchingRule.responseBody.length,
												})
											);
										}

										// Fire loadend event
										if (this.onloadend) {
											this.onloadend.call(this, new ProgressEvent('loadend'));
										}
									}, 5);
								}, 5);
							}, 5);
						};

						// Start the simulation after a short delay
						setTimeout(simulateResponse, 10);
						return;
					}
				}

				super.send(body);
			}
		};
	}

	// URL matching function
	private urlMatches(url: string, pattern: string): boolean {
		try {
			if (!pattern) return false;

			if (pattern.startsWith('*') && pattern.endsWith('*')) {
				const innerPattern = pattern.slice(1, -1);
				return url.includes(innerPattern);
			}

			if (pattern.startsWith('*')) {
				return url.includes(pattern.substring(1));
			}

			if (pattern.endsWith('*')) {
				return url.startsWith(pattern.substring(0, pattern.length - 1));
			}
			return url.includes(pattern) || url.endsWith(pattern);
		} catch (error) {
			return false;
		}
	}

	// Method matching function
	private methodMatches(requestMethod: string, ruleMethod: string): boolean {
		return ruleMethod === 'ANY' || requestMethod === ruleMethod;
	}

	// Find matching rule
	private findMatchingRule(url: string, method: string): MockRule | null {
		for (const rule of this.rules) {
			const urlMatch = this.urlMatches(url, rule.url);
			const methodMatch = this.methodMatches(method, rule.method);
			const enabled = rule.enabled !== false; // Default to true for backward compatibility
			if (urlMatch && methodMatch && enabled) {
				return rule;
			}
		}
		return null;
	}
}

// Initialize the main world script
new ApiMockerMainWorld();
