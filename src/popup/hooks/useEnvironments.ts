import { useToast } from '@chakra-ui/react';
import { Environment } from '../../types';
import { PopupState } from './usePopupState';

interface UseEnvironmentsProps {
	popupState: PopupState;
	setPopupState: React.Dispatch<React.SetStateAction<PopupState>>;
	saveEnvironments: (environments: Environment[]) => Promise<void>;
}

export const useEnvironments = ({
	popupState,
	setPopupState,
	saveEnvironments,
}: UseEnvironmentsProps) => {
	const { environments } = popupState;
	const toast = useToast();

	const generateEnvironmentId = (): string => {
		return `env_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	};

	const addNewEnvironment = (): void => {
		const newEnvironment: Environment = {
			id: generateEnvironmentId(),
			name: `Environment ${environments.length + 1}`,
			enabled: false,
		};

		// Ensure environments is an array before spreading
		const currentEnvironments = Array.isArray(environments) ? environments : [];
		const updatedEnvironments = [...currentEnvironments, newEnvironment];
		setPopupState((prev) => ({ ...prev, environments: updatedEnvironments }));
		saveEnvironments(updatedEnvironments);
	};

	const updateEnvironment = (envId: string, updates: Partial<Environment>): void => {
		// Ensure environments is an array before mapping
		const currentEnvironments = Array.isArray(environments) ? environments : [];
		const updatedEnvironments = currentEnvironments.map((env) =>
			env.id === envId ? { ...env, ...updates } : env
		);
		setPopupState((prev) => ({ ...prev, environments: updatedEnvironments }));
		saveEnvironments(updatedEnvironments);
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
		saveEnvironments(updatedEnvironments);
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
		saveEnvironments(updatedEnvironments);
		toast({
			title: 'Environment deleted',
			description: `"${environment.name}" has been deleted`,
			status: 'info',
			duration: 2000,
			isClosable: true,
		});
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

	return {
		onAddEnvironment: addNewEnvironment,
		updateEnvironment,
		onUpdateEnvironment: updateEnvironmentName,
		onDeleteEnvironment: deleteEnvironment,
		onToggleEnvironmentStatus: toggleEnvironmentStatus,
	};
};
