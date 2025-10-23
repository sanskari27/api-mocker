import { useToast } from '@chakra-ui/react';
import { Environment } from '../../types';
import { generateEnvironmentId, generateRuleId } from '../utils/common';
import { PopupState } from './usePopupState';

interface UseEnvironmentsProps {
	popupState: PopupState;
	setPopupState: React.Dispatch<React.SetStateAction<PopupState>>;
	saveEnvironments?: (environments: Environment[]) => Promise<void>;
}

export const useEnvironments = ({ popupState, setPopupState }: UseEnvironmentsProps) => {
	const { environments } = popupState;
	const toast = useToast();

	const addNewEnvironment = (): void => {
		const newEnvironment: Environment = {
			id: generateEnvironmentId(),
			name: `Environment ${environments.length + 1}`,
			enabled: false,
			rules: [],
		};

		// Ensure environments is an array before spreading
		const currentEnvironments = Array.isArray(environments) ? environments : [];
		const updatedEnvironments = [...currentEnvironments, newEnvironment];
		setPopupState((prev) => ({ ...prev, environments: updatedEnvironments }));
	};

	const updateEnvironment = (envId: string, updates: Partial<Environment>): void => {
		// Ensure environments is an array before mapping
		const currentEnvironments = Array.isArray(environments) ? environments : [];
		const updatedEnvironments = currentEnvironments.map((env) =>
			env.id === envId ? { ...env, ...updates } : env
		);
		setPopupState((prev) => ({ ...prev, environments: updatedEnvironments }));
	};

	const updateEnvironmentName = (envId: string, name: string): void => {
		updateEnvironment(envId, { name });
	};

	const toggleEnvironmentStatus = (envId: string, enabled: boolean): void => {
		const currentEnvironments = Array.isArray(environments) ? environments : [];
		const environment = currentEnvironments.find((env) => env.id === envId);

		if (!environment) {
			toast({
				title: 'Environment not found',
				description: 'Could not find the environment to update',
				status: 'error',
				duration: 2000,
				isClosable: true,
			});
			return;
		}

		// If enabling, disable all others; if disabling, just disable the selected envId
		let updatedEnvironments;
		if (enabled) {
			updatedEnvironments = currentEnvironments.map((env) =>
				env.id === envId ? { ...env, enabled: true } : { ...env, enabled: false }
			);
		} else {
			updatedEnvironments = currentEnvironments.map((env) =>
				env.id === envId ? { ...env, enabled: false } : env
			);
		}
		updatedEnvironments = enableDefaultEnvironment(updatedEnvironments);

		setPopupState((prev) => ({ ...prev, environments: updatedEnvironments }));
	};

	const deleteEnvironment = (envId: string): void => {
		// Ensure environments is an array before filtering
		const currentEnvironments = Array.isArray(environments) ? environments : [];
		const environment = currentEnvironments.find((env) => env.id === envId);

		if (!environment) {
			toast({
				title: 'Environment not found',
				description: 'Could not find the environment to delete',
				status: 'error',
				duration: 2000,
				isClosable: true,
			});
			return;
		}

		let updatedEnvironments = currentEnvironments.filter((env) => env.id !== envId);
		updatedEnvironments = enableDefaultEnvironment(updatedEnvironments);
		setPopupState((prev) => ({ ...prev, environments: updatedEnvironments }));
		toast({
			title: 'Environment deleted',
			description: `"${environment.name}" has been deleted`,
			status: 'info',
			duration: 2000,
			isClosable: true,
		});
	};

	const clearAllEnvironments = (): void => {
		const environments = [
			{
				id: 'default',
				name: 'Default',
				enabled: true,
				rules: [],
			},
		];
		setPopupState((prev) => ({ ...prev, environments }));
	};

	const enableDefaultEnvironment = (environments: Environment[]): Environment[] => {
		if (!environments.find((env) => env.enabled)) {
			const defaultEnvironment = environments.find((env) => env.id === 'default');
			if (defaultEnvironment) {
				defaultEnvironment.enabled = true;
			}
		}
		return environments;
	};

	const getEnvironmentCount = (): number => {
		return Array.isArray(environments) ? environments.length : 0;
	};

	const exportEnvironments = (environments: Environment[]): void => {
		try {
			const exportData = {
				version: '1.0',
				exportedAt: new Date().toISOString(),
				environments: environments,
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
				title: 'Environments exported successfully',
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

	const exportAllEnvironments = (): void => {
		exportEnvironments(environments);
	};

	const exportSingleEnvironment = (envId: string): void => {
		const environment = environments.find((env) => env.id === envId);
		if (!environment) {
			toast({
				title: 'Environment not found',
				description: 'Could not find the environment to export',
				status: 'error',
				duration: 2000,
				isClosable: true,
			});
			return;
		}
		exportEnvironments([environment]);
	};

	const importEnvironments = (): void => {
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
					if (!importData.environments || !Array.isArray(importData.environments)) {
						throw new Error('Invalid file format: environments array not found');
					}

					const validEnvironments = importData.environments.filter(
						(environment: any) =>
							environment.id &&
							typeof environment.name === 'string' &&
							typeof environment.enabled === 'boolean' &&
							Array.isArray(environment.rules) &&
							environment.rules.every(
								(rule: any) =>
									rule.id &&
									typeof rule.url === 'string' &&
									typeof rule.method === 'string' &&
									typeof rule.responseCode === 'number' &&
									typeof rule.responseBody === 'string' &&
									typeof rule.enabled === 'boolean'
							)
					);

					if (validEnvironments.length === 0) {
						throw new Error('No valid environments found in the file');
					}

					// Generate new IDs for imported rules to avoid conflicts
					const environmentsWithNewIds = validEnvironments.map((environment: any) => ({
						...environment,
						rules: environment.rules.map((rule: any) => ({
							...rule,
							id: generateRuleId(),
							requestCount: 0,
							enabled: true,
						})),
						id: generateEnvironmentId(),
						enabled: false,
					}));

					// Merge with existing rules
					const currentEnvironments = Array.isArray(environments) ? environments : [];
					let updatedEnvironments = [...currentEnvironments, ...environmentsWithNewIds];
					updatedEnvironments = enableDefaultEnvironment(updatedEnvironments);

					setPopupState((prev) => ({ ...prev, environments: updatedEnvironments }));

					toast({
						title: 'Environments imported successfully',
						description: `${environmentsWithNewIds.length} environments imported`,
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

	const importSingleEnvironment = (envId: string): void => {
		const environment = environments.find((env) => env.id === envId);
		if (!environment) {
			toast({
				title: 'Environment not found',
				description: 'Could not find the environment to import',
				status: 'error',
				duration: 2000,
				isClosable: true,
			});
			return;
		}
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
					if (!importData.environments || !Array.isArray(importData.environments)) {
						throw new Error('Invalid file format: environments array not found');
					}

					const validEnvironments = importData.environments.filter(
						(environment: any) =>
							environment.id &&
							typeof environment.name === 'string' &&
							typeof environment.enabled === 'boolean' &&
							Array.isArray(environment.rules) &&
							environment.rules.every(
								(rule: any) =>
									rule.id &&
									typeof rule.url === 'string' &&
									typeof rule.method === 'string' &&
									typeof rule.responseCode === 'number' &&
									typeof rule.responseBody === 'string' &&
									typeof rule.enabled === 'boolean'
							)
					);

					if (validEnvironments.length === 0) {
						throw new Error('No valid environments found in the file');
					}

					const rules = validEnvironments.map((environment: any) => environment.rules).flat();

					const updatedEnvironments = environments.map((environment: any) =>
						environment.id === envId ? { ...environment, rules: rules } : environment
					);

					setPopupState((prev) => ({ ...prev, environments: updatedEnvironments }));
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
		addNewEnvironment,
		updateEnvironment,
		updateEnvironmentName,
		deleteEnvironment,
		toggleEnvironmentStatus,
		clearAllEnvironments,
		getEnvironmentCount,
		exportAllEnvironments,
		exportSingleEnvironment,
		importEnvironments,
		importSingleEnvironment,
	};
};
