import { MockRule } from './types';

class ApiMockerContentScript {
	private enabled: boolean = false;
	private rules: MockRule[] = [];

	constructor() {
		this.initializeListeners();
		this.initializeState();
	}

	private initializeListeners(): void {
		// Listen for messages from background script
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			switch (message.type) {
				case 'MOCKING_STATE_CHANGED':
					this.enabled = message.enabled;
					this.rules = message.rules || [];
					this.updateMainWorldScript();
					break;

				case 'RULES_UPDATED':
					this.rules = message.rules || [];
					this.enabled = message.enabled;
					this.updateMainWorldScript();
					break;
			}
		});

		// Listen for messages from main world script
		window.addEventListener('message', (event) => {
			if (event.source !== window || !event.data.type) return;

			if (event.data.type === 'API_MOCKER_REQUEST_INTERCEPTED') {
				this.incrementRequestCount(event.data.ruleId);
			}
		});
	}

	private async initializeState(): Promise<void> {
		try {
			// Get initial state from background script
			const response = await chrome.runtime.sendMessage({
				type: 'GET_TAB_STATE',
			});

			if (response.success) {
				this.enabled = response.data.enabled;
				this.rules = response.data.rules;
				this.updateMainWorldScript();
			}
		} catch (error) {
			// Silently handle initialization errors
		}
	}

	private updateMainWorldScript(): void {
		// Send state update to main world script
		window.postMessage(
			{
				type: 'API_MOCKER_UPDATE_STATE',
				enabled: this.enabled,
				rules: this.rules,
			},
			'*'
		);
	}

	private incrementRequestCount(ruleId: string): void {
		// Send message to background script to increment the request count
		chrome.runtime
			.sendMessage({
				type: 'INCREMENT_REQUEST_COUNT',
				ruleId: ruleId,
			})
			.catch((error) => {});
	}
}

// Initialize the content script
new ApiMockerContentScript();
