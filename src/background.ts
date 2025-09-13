import { MessageData, MockRule, StorageData } from './types';

class BackgroundService {
	private storageKey = 'apiMockerData';

	constructor() {
		this.initializeListeners();
	}

	private initializeListeners(): void {
		// Listen for messages from popup and content scripts
		chrome.runtime.onMessage.addListener((message: MessageData, sender, sendResponse) => {
			this.handleMessage(message, sender, sendResponse);
			return true; // Keep message channel open for async response
		});

		// Initialize storage on install
		chrome.runtime.onInstalled.addListener(() => {
			this.initializeStorage();
		});

		// Update icon when tab becomes active
		chrome.tabs.onActivated.addListener(async (activeInfo) => {
			await this.updateIconForActiveTab(activeInfo.tabId);
		});

		// Update icon when tab is updated
		chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
			if (changeInfo.status === 'complete' && tab.active) {
				await this.updateIconForActiveTab(tabId);
			}
		});
	}

	private async initializeStorage(): Promise<void> {
		const result = await chrome.storage.local.get(this.storageKey);
		if (!result[this.storageKey]) {
			const initialData: StorageData = {
				globalRules: [],
				tabStates: {},
			};
			await chrome.storage.local.set({ [this.storageKey]: initialData });
		}
	}

	private async handleMessage(
		message: MessageData,
		sender: chrome.runtime.MessageSender,
		sendResponse: (response?: any) => void
	): Promise<void> {
		try {
			const tabId = message.tabId || sender.tab?.id;

			switch (message.type) {
				case 'GET_TAB_STATE':
					await this.getTabState(tabId!, sendResponse);
					break;

				case 'SET_TAB_STATE':
					await this.setTabState(tabId!, message.enabled!, sendResponse);
					break;

				case 'GET_RULES':
					await this.getRules(tabId!, sendResponse);
					break;

				case 'SET_RULES':
					await this.setRules(tabId!, message.rules!, sendResponse);
					break;

				case 'TOGGLE_MOCKING':
					await this.toggleMocking(tabId!, sendResponse);
					break;

				case 'INCREMENT_REQUEST_COUNT':
					await this.incrementRequestCount(message.ruleId!, sendResponse);
					break;

				case 'TEST_ICON_UPDATE':
					await this.updateBrowserIcon(tabId!, true);
					sendResponse({ success: true });
					break;

				default:
					sendResponse({ error: 'Unknown message type' });
			}
		} catch (error) {
			console.error('Background script error:', error);
			sendResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
		}
	}

	private async getStorageData(): Promise<StorageData> {
		const result = await chrome.storage.local.get(this.storageKey);
		const data = result[this.storageKey] || { globalRules: [], tabStates: {} };

		// Initialize requestCount for existing rules that don't have it
		data.globalRules = data.globalRules.map((rule: MockRule) => ({
			...rule,
			requestCount: rule.requestCount || 0,
		}));

		return data;
	}

	private async saveStorageData(data: StorageData): Promise<void> {
		await chrome.storage.local.set({ [this.storageKey]: data });
	}

	private async updateIconForActiveTab(tabId: number): Promise<void> {
		try {
			const data = await this.getStorageData();
			const tabState = data.tabStates[tabId.toString()] || { enabled: false };
			await this.updateBrowserIcon(tabId, tabState.enabled);
		} catch (error) {
			// Silently handle icon update errors
		}
	}

	private async updateBrowserIcon(tabId: number, enabled: boolean): Promise<void> {
		try {
			// Only update icon if we have a valid tabId
			if (!tabId || tabId === chrome.tabs.TAB_ID_NONE) {
				return;
			}

			// Use chrome.runtime.getURL to get proper extension URLs
			const iconPath = enabled ? 'api-enabled.png' : 'api-disabled.png';

			// Set icon for the specific tab using imageData instead of path
			// First, let's try with a simple path approach
			await chrome.action.setIcon({
				tabId: tabId,
				path: iconPath,
			});
		} catch (error) {
			// Silently handle icon update errors
		}
	}

	private async getTabState(tabId: number, sendResponse: (response: any) => void): Promise<void> {
		const data = await this.getStorageData();
		const tabState = data.tabStates[tabId.toString()] || { enabled: false };

		const responseData = {
			enabled: tabState.enabled,
			rules: data.globalRules,
		};
		sendResponse({ success: true, data: responseData });
	}

	private async setTabState(
		tabId: number,
		enabled: boolean,
		sendResponse: (response: any) => void
	): Promise<void> {
		const data = await this.getStorageData();
		const tabIdStr = tabId.toString();

		if (!data.tabStates[tabIdStr]) {
			data.tabStates[tabIdStr] = { enabled: false };
		}

		data.tabStates[tabIdStr].enabled = enabled;
		await this.saveStorageData(data);

		// Update browser icon
		await this.updateBrowserIcon(tabId, enabled);

		// Notify content script of the change
		try {
			await chrome.tabs.sendMessage(tabId, {
				type: 'MOCKING_STATE_CHANGED',
				enabled: enabled,
				rules: data.globalRules,
			});
		} catch (error) {
			// Silently handle message sending errors
		}

		sendResponse({ success: true });
	}

	private async getRules(tabId: number, sendResponse: (response: any) => void): Promise<void> {
		const data = await this.getStorageData();
		sendResponse({ success: true, data: data.globalRules });
	}

	private async setRules(
		tabId: number,
		rules: MockRule[],
		sendResponse: (response: any) => void
	): Promise<void> {
		const data = await this.getStorageData();

		// Update global rules
		data.globalRules = rules;
		await this.saveStorageData(data);

		// Notify all tabs with mocking enabled about rule changes
		try {
			const tabs = await chrome.tabs.query({});
			for (const tab of tabs) {
				if (tab.id) {
					const tabState = data.tabStates[tab.id.toString()];
					if (tabState && tabState.enabled) {
						try {
							await chrome.tabs.sendMessage(tab.id, {
								type: 'RULES_UPDATED',
								rules: rules,
								enabled: true,
							});
						} catch (error) {
							// Tab might be closed or not ready, ignore
						}
					}
				}
			}
		} catch (error) {
			// Silently handle message sending errors
		}

		sendResponse({ success: true });
	}

	private async toggleMocking(tabId: number, sendResponse: (response: any) => void): Promise<void> {
		const data = await this.getStorageData();
		const tabIdStr = tabId.toString();

		if (!data.tabStates[tabIdStr]) {
			data.tabStates[tabIdStr] = { enabled: false };
		}

		data.tabStates[tabIdStr].enabled = !data.tabStates[tabIdStr].enabled;
		await this.saveStorageData(data);

		// Update browser icon
		await this.updateBrowserIcon(tabId, data.tabStates[tabIdStr].enabled);

		// Notify content script of the change
		try {
			await chrome.tabs.sendMessage(tabId, {
				type: 'MOCKING_STATE_CHANGED',
				enabled: data.tabStates[tabIdStr].enabled,
				rules: data.globalRules,
			});
		} catch (error) {
			// Silently handle message sending errors
		}

		sendResponse({
			success: true,
			enabled: data.tabStates[tabIdStr].enabled,
		});
	}

	private async incrementRequestCount(
		ruleId: string,
		sendResponse: (response: any) => void
	): Promise<void> {
		const data = await this.getStorageData();

		// Find the rule and increment its request count
		const ruleIndex = data.globalRules.findIndex((rule) => rule.id === ruleId);
		if (ruleIndex !== -1) {
			data.globalRules[ruleIndex].requestCount =
				(data.globalRules[ruleIndex].requestCount || 0) + 1;
			await this.saveStorageData(data);

			// Notify all tabs with mocking enabled about the updated rule
			try {
				const tabs = await chrome.tabs.query({});
				for (const tab of tabs) {
					if (tab.id) {
						const tabState = data.tabStates[tab.id.toString()];
						if (tabState && tabState.enabled) {
							try {
								await chrome.tabs.sendMessage(tab.id, {
									type: 'RULES_UPDATED',
									rules: data.globalRules,
									enabled: true,
								});
							} catch (error) {
								// Tab might be closed or not ready, ignore
							}
						}
					}
				}
			} catch (error) {
				// Silently handle message sending errors
			}

			sendResponse({ success: true, requestCount: data.globalRules[ruleIndex].requestCount });
		} else {
			sendResponse({ success: false, error: 'Rule not found' });
		}
	}
}

// Initialize the background service
new BackgroundService();
