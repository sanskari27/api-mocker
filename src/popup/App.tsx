import { Box, Text, VStack } from '@chakra-ui/react';
import React, { useState } from 'react';
import { AppHeader, EnvironmentPage, RulesList, SettingsPage } from './components';
import { useEnvironments, usePopupState, useRuleManagement } from './hooks';

const App: React.FC = () => {
	const [currentPage, setCurrentPage] = useState<'home' | 'settings' | 'environments'>('home');

	const { popupState, setPopupState, loading, toggleMocking, saveRules, saveEnvironments } =
		usePopupState();

	const {
		addNewRule,
		updateRule,
		deleteRule,
		cloneRule,
		updateRuleHeaders,
		getRuleCount,
		clearAllRules,
		exportRules,
		importRules,
	} = useRuleManagement({ popupState, setPopupState, saveRules });

	const {
		onAddEnvironment,
		updateEnvironment,
		onUpdateEnvironment,
		onDeleteEnvironment,
		onToggleEnvironmentStatus,
	} = useEnvironments({ popupState, setPopupState, saveEnvironments });

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
				onExportRules={exportRules}
				onImportRules={importRules}
				onClearAllRules={clearAllRules}
				ruleCount={getRuleCount()}
			/>
		);
	} else if (currentPage === 'environments') {
		return (
			<EnvironmentPage
				environments={popupState.environments}
				onEnvironmentStatusUpdate={onToggleEnvironmentStatus}
				onAddEnvironment={onAddEnvironment}
				onDeleteEnvironment={onDeleteEnvironment}
				onUpdateEnvironment={onUpdateEnvironment}
				onClose={() => setCurrentPage('home')}
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
