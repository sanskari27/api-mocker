import { useToast } from '@chakra-ui/react';
import { MockRule } from '../../types';
import { generateRuleId } from '../utils/common';
import { PopupState } from './usePopupState';

interface UseRuleManagementProps {
	popupState: PopupState;
	setPopupState: React.Dispatch<React.SetStateAction<PopupState>>;
	saveRules: (rules: MockRule[]) => Promise<void>;
}

export const useRuleManagement = ({
	popupState,
	setPopupState,
	saveRules,
}: UseRuleManagementProps) => {
	const toast = useToast();

	const addNewRule = (): void => {
		const newRule: MockRule = {
			id: generateRuleId(),
			url: '',
			method: 'ANY',
			responseCode: 200,
			responseHeaders: { 'Content-Type': 'application/json' },
			responseBody: '{}',
			requestCount: 0,
			enabled: true,
		};

		// Ensure rules is an array before spreading
		const currentRules = Array.isArray(popupState.rules) ? popupState.rules : [];
		const updatedRules = [...currentRules, newRule];
		setPopupState((prev) => ({ ...prev, rules: updatedRules }));
		saveRules(updatedRules);
	};

	const updateRule = (ruleId: string, updates: Partial<MockRule>): void => {
		// Ensure rules is an array before mapping
		const currentRules = Array.isArray(popupState.rules) ? popupState.rules : [];
		const updatedRules = currentRules.map((rule) =>
			rule.id === ruleId ? { ...rule, ...updates } : rule
		);
		setPopupState((prev) => ({ ...prev, rules: updatedRules }));
		saveRules(updatedRules);
	};

	const deleteRule = (ruleId: string): void => {
		// Ensure rules is an array before filtering
		const currentRules = Array.isArray(popupState.rules) ? popupState.rules : [];
		const updatedRules = currentRules.filter((rule) => rule.id !== ruleId);
		setPopupState((prev) => ({ ...prev, rules: updatedRules }));
		saveRules(updatedRules);
		toast({
			title: 'Rule deleted',
			status: 'info',
			duration: 2000,
			isClosable: true,
		});
	};

	const cloneRule = (ruleId: string): void => {
		// Ensure rules is an array before finding
		const currentRules = Array.isArray(popupState.rules) ? popupState.rules : [];
		const ruleToClone = currentRules.find((rule) => rule.id === ruleId);

		if (!ruleToClone) {
			toast({
				title: 'Rule not found',
				description: 'Could not find the rule to clone',
				status: 'error',
				duration: 2000,
				isClosable: true,
			});
			return;
		}

		// Create a clone with new ID and reset request count
		const clonedRule: MockRule = {
			...ruleToClone,
			id: generateRuleId(),
			requestCount: 0,
		};

		// Find the index of the original rule and insert the clone right after it
		const originalIndex = currentRules.findIndex((rule) => rule.id === ruleId);
		const updatedRules = [
			...currentRules.slice(0, originalIndex + 1),
			clonedRule,
			...currentRules.slice(originalIndex + 1),
		];

		setPopupState((prev) => ({ ...prev, rules: updatedRules }));
		saveRules(updatedRules);
		toast({
			title: 'Rule cloned',
			description: 'Rule has been duplicated and placed after the original',
			status: 'success',
			duration: 2000,
			isClosable: true,
		});
	};

	const updateRuleHeaders = (ruleId: string, headers: Record<string, string>): void => {
		updateRule(ruleId, { responseHeaders: headers });
	};

	const getRuleCount = (): number => {
		// Ensure rules is an array before getting length
		return Array.isArray(popupState.rules) ? popupState.rules.length : 0;
	};

	const clearAllRules = (): void => {
		setPopupState((prev) => ({ ...prev, rules: [] }));
		saveRules([]);
		toast({
			title: 'All rules cleared',
			status: 'info',
			duration: 2000,
			isClosable: true,
		});
	};

	return {
		addNewRule,
		updateRule,
		deleteRule,
		cloneRule,
		updateRuleHeaders,
		getRuleCount,
		clearAllRules,
	};
};
