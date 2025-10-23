import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Environment, MockRule } from '../../types';
import { Theme } from '../contexts/ThemeContext';

export interface PopupState {
	enabled: boolean;
	rules: MockRule[];
	environments: Environment[];
	theme: Theme;
}

export const usePopupState = () => {
	const [popupState, setPopupState] = useState<PopupState>({
		enabled: false,
		rules: [],
		environments: [],
		theme: 'system',
	});
	const [loading, setLoading] = useState<boolean>(true);
	const [currentTabId, setCurrentTabId] = useState<number | null>(null);
	const toast = useToast();

	useEffect(() => {
		initializePopup();
	}, []);

	useEffect(() => {
		saveRules(popupState.rules);
	}, [popupState.rules]);

	useEffect(() => {
		saveEnvironments(popupState.environments);
	}, [popupState.environments]);

	useEffect(() => {
		saveTheme(popupState.theme);
	}, [popupState.theme]);

	const initializePopup = async (): Promise<void> => {
		try {
			// Get current tab
			const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
			if (!tab.id) {
				setLoading(false);
				return;
			}

			setCurrentTabId(tab.id);

			// Get tab state from background script
			const response = await chrome.runtime.sendMessage({
				type: 'GET_TAB_STATE',
				tabId: tab.id,
			});

			if (response.success) {
				const state = response.data;
				// Ensure rules is always an array
				const environments: Environment[] = Array.isArray(state.environments)
					? state.environments
					: [];
				const rules = environments.find((env) => env.enabled)?.rules ?? [];
				const safeState = {
					enabled: state.enabled || false,
					rules: rules,
					environments: environments,
					theme: state.theme || 'system',
				};
				setPopupState(safeState);
			}
		} catch (err) {
			// Silently handle initialization errors
		} finally {
			setLoading(false);
		}
	};

	const toggleMocking = async (): Promise<void> => {
		if (!currentTabId) return;

		try {
			const response = await chrome.runtime.sendMessage({
				type: 'SET_TAB_STATE',
				tabId: currentTabId,
				enabled: !popupState.enabled,
			});

			if (response.success) {
				setPopupState((prev) => ({ ...prev, enabled: !prev.enabled }));
				toast({
					title: `Mocking ${!popupState.enabled ? 'enabled' : 'disabled'}`,
					status: 'success',
					duration: 2000,
					isClosable: true,
				});
			} else {
				throw new Error('Failed to toggle mocking');
			}
		} catch (err) {
			toast({
				title: 'Error',
				description: err instanceof Error ? err.message : 'Unknown error',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		}
	};

	const saveRules = async (rules: MockRule[]): Promise<void> => {
		if (!currentTabId) return;

		try {
			const response = await chrome.runtime.sendMessage({
				type: 'SET_RULES',
				tabId: currentTabId,
				rules: rules,
			});

			if (!response.success) {
				throw new Error('Failed to save rules');
			}
		} catch (err) {
			toast({
				title: 'Error saving rules',
				description: err instanceof Error ? err.message : 'Unknown error',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		}
	};

	const saveEnvironments = async (environments: Environment[]): Promise<void> => {
		if (!currentTabId) return;

		try {
			const response = await chrome.runtime.sendMessage({
				type: 'SET_ENVIRONMENTS',
				tabId: currentTabId,
				environments: environments,
			});

			if (!response.success) {
				throw new Error('Failed to save environments');
			}

			if (response.environmentStateUpdated) {
				const rules = environments.find((env) => env.enabled)?.rules ?? [];
				setPopupState((prev) => ({ ...prev, rules }));
			}
		} catch (err) {
			toast({
				title: 'Error saving environments',
				description: err instanceof Error ? err.message : 'Unknown error',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		}
	};

	const saveTheme = async (theme: 'light' | 'dark' | 'system'): Promise<void> => {
		if (!currentTabId) return;

		try {
			const response = await chrome.runtime.sendMessage({
				type: 'SET_THEME',
				tabId: currentTabId,
				theme: theme,
			});

			if (!response.success) {
				throw new Error('Failed to save theme');
			}
		} catch (err) {
			toast({
				title: 'Error saving theme',
				description: err instanceof Error ? err.message : 'Unknown error',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		}
	};

	return {
		popupState,
		setPopupState,
		loading,
		currentTabId,
		toggleMocking,
		saveRules,
		saveEnvironments,
		saveTheme,
	};
};
