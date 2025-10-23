export interface MockRule {
	id: string;
	url: string;
	method: 'ANY' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	responseCode: number;
	responseHeaders: Record<string, string>;
	responseBody: string;
	requestCount: number;
	enabled: boolean;
	delay: number;
}

export interface TabMockState {
	enabled: boolean;
}

export interface StorageData {
	environments: Environment[];
	tabStates: { [tabId: string]: TabMockState };
}

export interface MessageData {
	type:
		| 'GET_TAB_STATE'
		| 'GET_MOCKED_RULES'
		| 'SET_TAB_STATE'
		| 'GET_RULES'
		| 'SET_RULES'
		| 'GET_ACTIVE_ENVIRONMENT'
		| 'GET_ENVIRONMENTS'
		| 'SET_ENVIRONMENTS'
		| 'TOGGLE_MOCKING'
		| 'INCREMENT_REQUEST_COUNT'
		| 'TEST_ICON_UPDATE';
	tabId?: number;
	enabled?: boolean;
	rules?: MockRule[];
	environments?: Environment[];
	data?: any;
	ruleId?: string;
}

export interface MockResponse {
	data: any;
	status?: number;
	statusText?: string;
	headers?: { [key: string]: string };
}

export interface Environment {
	id: string;
	name: string;
	enabled: boolean;
	rules: MockRule[];
}
