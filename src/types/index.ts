export interface MockRule {
	id: string;
	url: string;
	method: 'ANY' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	responseCode: number;
	responseHeaders: Record<string, string>;
	responseBody: string;
	requestCount: number;
	enabled: boolean;
}

export interface TabMockState {
	enabled: boolean;
}

export interface StorageData {
	globalRules: MockRule[];
	tabStates: { [tabId: string]: TabMockState };
}

export interface MessageData {
	type:
		| 'GET_TAB_STATE'
		| 'SET_TAB_STATE'
		| 'GET_RULES'
		| 'SET_RULES'
		| 'TOGGLE_MOCKING'
		| 'INCREMENT_REQUEST_COUNT'
		| 'TEST_ICON_UPDATE';
	tabId?: number;
	enabled?: boolean;
	rules?: MockRule[];
	data?: any;
	ruleId?: string;
}

export interface MockResponse {
	data: any;
	status?: number;
	statusText?: string;
	headers?: { [key: string]: string };
}
