import { useToast } from '@chakra-ui/react';
import { MockRule } from '../../types';

interface UseRuleManagementProps {
	popupState: { enabled: boolean; rules: MockRule[] };
	setPopupState: React.Dispatch<React.SetStateAction<{ enabled: boolean; rules: MockRule[] }>>;
	saveRules: (rules: MockRule[]) => Promise<void>;
}

export const useRuleManagement = ({
	popupState,
	setPopupState,
	saveRules,
}: UseRuleManagementProps) => {
	const toast = useToast();

	const generateRuleId = (): string => {
		return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	};

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

	const updateRuleHeaders = (ruleId: string, headers: Record<string, string>): void => {
		updateRule(ruleId, { responseHeaders: headers });
	};

	const addExampleRule = (): void => {
		const exampleRule: MockRule = {
			id: generateRuleId(),
			url: '/api/user',
			method: 'GET',
			responseCode: 200,
			responseHeaders: { 'Content-Type': 'application/json' },
			responseBody: JSON.stringify(
				{ id: 123, name: 'Mock User', email: 'mock@example.com' },
				null,
				2
			),
			requestCount: 0,
			enabled: true,
		};

		// Ensure rules is an array before spreading
		const currentRules = Array.isArray(popupState.rules) ? popupState.rules : [];
		const updatedRules = [...currentRules, exampleRule];
		setPopupState((prev) => ({ ...prev, rules: updatedRules }));
		saveRules(updatedRules);
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
		updateRuleHeaders,
		addExampleRule,
		getRuleCount,
		clearAllRules,
	};
};
