import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { MockRule } from '../../types';

interface PopupState {
	enabled: boolean;
	rules: MockRule[];
}

export const usePopupState = () => {
	const [popupState, setPopupState] = useState<PopupState>({ enabled: false, rules: [] });
	const [loading, setLoading] = useState<boolean>(true);
	const [currentTabId, setCurrentTabId] = useState<number | null>(null);
	const toast = useToast();

	useEffect(() => {
		initializePopup();
	}, []);

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
				const safeState = {
					enabled: state.enabled || false,
					rules: Array.isArray(state.rules) ? state.rules : [],
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

	return {
		popupState,
		setPopupState,
		loading,
		currentTabId,
		toggleMocking,
		saveRules,
		toast,
	};
};
