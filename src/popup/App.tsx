import { Box, Text, VStack } from '@chakra-ui/react';
import React, { useState } from 'react';
import { AppHeader, EnvironmentPage, RulesList, SettingsPage } from './components';
import { useEnvironments, usePopupState, useRuleManagement } from './hooks';

const App: React.FC = () => {
	const [currentPage, setCurrentPage] = useState<'home' | 'settings' | 'environments'>('home');

	const { popupState, setPopupState, loading, toggleMocking } = usePopupState();

	const { addNewRule, updateRule, deleteRule, cloneRule, updateRuleHeaders, getRuleCount } =
		useRuleManagement({ popupState, setPopupState });

	const {
		getEnvironmentCount,
		addNewEnvironment,
		updateEnvironmentName,
		deleteEnvironment,
		toggleEnvironmentStatus,
		clearAllEnvironments,
		exportAllEnvironments,
		exportSingleEnvironment,
		importEnvironments,
		importSingleEnvironment,
	} = useEnvironments({ popupState, setPopupState });

	if (loading) {
		return (
			<Box p={4} className='w-full min-h-full flex items-center justify-center'>
				<Text>Loading Extension...</Text>
			</Box>
		);
	}

	// Show settings page
	if (currentPage === 'settings') {
		return (
			<SettingsPage
				onClose={() => setCurrentPage('home')}
				onExportEnvironments={exportAllEnvironments}
				onImportEnvironments={importEnvironments}
				onClearAllEnvironments={clearAllEnvironments}
				environmentCount={getEnvironmentCount()}
			/>
		);
	} else if (currentPage === 'environments') {
		return (
			<EnvironmentPage
				environments={popupState.environments}
				onEnvironmentStatusUpdate={toggleEnvironmentStatus}
				onAddEnvironment={addNewEnvironment}
				onDeleteEnvironment={deleteEnvironment}
				onUpdateEnvironment={updateEnvironmentName}
				onClose={() => setCurrentPage('home')}
				onExportEnvironmentRules={exportSingleEnvironment}
				onImportEnvironmentRules={importSingleEnvironment}
			/>
		);
	}

	// Show home page
	return (
		<Box className='w-full max-h-full bg-gray-50 overflow-auto'>
			<VStack spacing={2} align='stretch'>
				{/* Header Section with Play/Pause and Actions */}
				<AppHeader
					enabled={popupState.enabled}
					ruleCount={getRuleCount()}
					onToggleMocking={toggleMocking}
					onAddNewRule={addNewRule}
					onOpenPage={setCurrentPage}
				/>

				{/* Rules Section */}
				<RulesList
					rules={popupState.rules}
					onUpdateRule={updateRule}
					onDeleteRule={deleteRule}
					onCloneRule={cloneRule}
					onUpdateRuleHeaders={updateRuleHeaders}
				/>
			</VStack>
		</Box>
	);
};

export default App;
