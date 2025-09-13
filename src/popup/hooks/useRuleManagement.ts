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

	const exportRules = (): void => {
		try {
			const currentRules = Array.isArray(popupState.rules) ? popupState.rules : [];
			const exportData = {
				version: '1.0',
				exportedAt: new Date().toISOString(),
				rules: currentRules,
			};

			const dataStr = JSON.stringify(exportData, null, 2);
			const dataBlob = new Blob([dataStr], { type: 'application/json' });
			const url = URL.createObjectURL(dataBlob);

			const link = document.createElement('a');
			link.href = url;
			link.download = `api-mocker-rules-${new Date().toISOString().split('T')[0]}.json`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);

			toast({
				title: 'Rules exported successfully',
				status: 'success',
				duration: 2000,
				isClosable: true,
			});
		} catch (error) {
			toast({
				title: 'Export failed',
				description: 'Failed to export rules',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		}
	};

	const importRules = (): void => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.onchange = (event) => {
			const file = (event.target as HTMLInputElement).files?.[0];
			if (!file) return;

			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const content = e.target?.result as string;
					const importData = JSON.parse(content);

					// Validate the imported data structure
					if (!importData.rules || !Array.isArray(importData.rules)) {
						throw new Error('Invalid file format: rules array not found');
					}

					// Validate each rule has required properties
					const validRules = importData.rules.filter(
						(rule: any) =>
							rule.id &&
							typeof rule.url === 'string' &&
							typeof rule.method === 'string' &&
							typeof rule.responseCode === 'number' &&
							typeof rule.responseBody === 'string' &&
							typeof rule.enabled === 'boolean'
					);

					if (validRules.length === 0) {
						throw new Error('No valid rules found in the file');
					}

					// Generate new IDs for imported rules to avoid conflicts
					const rulesWithNewIds = validRules.map((rule: any) => ({
						...rule,
						id: generateRuleId(),
						requestCount: 0, // Reset request count for imported rules
					}));

					// Merge with existing rules
					const currentRules = Array.isArray(popupState.rules) ? popupState.rules : [];
					const updatedRules = [...currentRules, ...rulesWithNewIds];

					setPopupState((prev) => ({ ...prev, rules: updatedRules }));
					saveRules(updatedRules);

					toast({
						title: 'Rules imported successfully',
						description: `${rulesWithNewIds.length} rules imported`,
						status: 'success',
						duration: 3000,
						isClosable: true,
					});
				} catch (error) {
					toast({
						title: 'Import failed',
						description: error instanceof Error ? error.message : 'Invalid file format',
						status: 'error',
						duration: 3000,
						isClosable: true,
					});
				}
			};
			reader.readAsText(file);
		};
		input.click();
	};

	return {
		addNewRule,
		updateRule,
		deleteRule,
		cloneRule,
		updateRuleHeaders,
		addExampleRule,
		getRuleCount,
		clearAllRules,
		exportRules,
		importRules,
	};
};
