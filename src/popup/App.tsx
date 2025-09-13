import { Box, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import { AppHeader, RulesList } from './components';
import { usePopupState, useRuleManagement } from './hooks';

const App: React.FC = () => {
	const { popupState, setPopupState, loading, toggleMocking, saveRules } = usePopupState();

	const {
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
	} = useRuleManagement({ popupState, setPopupState, saveRules });

	if (loading) {
		return (
			<Box p={4} className='w-full min-h-full flex items-center justify-center'>
				<Text>Loading Extension...</Text>
			</Box>
		);
	}

	return (
		<Box className='w-full max-h-full bg-gray-50 overflow-auto'>
			<VStack spacing={2} align='stretch'>
				{/* Header Section with Play/Pause and Actions */}
				<AppHeader
					enabled={popupState.enabled}
					ruleCount={getRuleCount()}
					onToggleMocking={toggleMocking}
					onAddNewRule={addNewRule}
					onAddExampleRule={addExampleRule}
					onClearAllRules={clearAllRules}
					onExportRules={exportRules}
					onImportRules={importRules}
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
