import { Box, Text, VStack } from '@chakra-ui/react';
import React, { useState } from 'react';
import { AppHeader, EnvironmentPage, RulesList, SettingsPage } from './components';
import { ThemeProvider, getThemeClasses } from './contexts/ThemeContext';
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
		const themeClasses = getThemeClasses(popupState.theme);
		return (
			<Box
				p={4}
				className={`w-full min-h-full flex items-center justify-center ${themeClasses.bg}`}
			>
				<Text className={themeClasses.text}>Loading Extension...</Text>
			</Box>
		);
	}

	// Show settings page
	if (currentPage === 'settings') {
		return (
			<ThemeProvider
				theme={popupState.theme}
				onThemeChange={(theme) => setPopupState((prev) => ({ ...prev, theme }))}
			>
				<SettingsPage
					onClose={() => setCurrentPage('home')}
					onExportEnvironments={exportAllEnvironments}
					onImportEnvironments={importEnvironments}
					onClearAllEnvironments={clearAllEnvironments}
					environmentCount={getEnvironmentCount()}
					theme={popupState.theme}
					onThemeChange={(theme) => setPopupState((prev) => ({ ...prev, theme }))}
				/>
			</ThemeProvider>
		);
	} else if (currentPage === 'environments') {
		return (
			<ThemeProvider
				theme={popupState.theme}
				onThemeChange={(theme) => setPopupState((prev) => ({ ...prev, theme }))}
			>
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
			</ThemeProvider>
		);
	}

	// Show home page
	const themeClasses = getThemeClasses(popupState.theme);
	return (
		<ThemeProvider
			theme={popupState.theme}
			onThemeChange={(theme) => setPopupState((prev) => ({ ...prev, theme }))}
		>
			<Box className={`w-full max-h-full ${themeClasses.bg} overflow-auto`}>
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
		</ThemeProvider>
	);
};

export default App;
