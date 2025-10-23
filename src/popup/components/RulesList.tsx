import { Accordion, Box, Text } from '@chakra-ui/react';
import React from 'react';
import { getThemeClasses, useTheme } from '../contexts/ThemeContext';
import EmptyState from './EmptyState';
import RuleCard from './RuleCard';
interface RulesListProps {
	rules: MockRule[];
	onUpdateRule: (ruleId: string, updates: Partial<MockRule>) => void;
	onDeleteRule: (ruleId: string) => void;
	onCloneRule: (ruleId: string) => void;
	onUpdateRuleHeaders: (ruleId: string, headers: Record<string, string>) => void;
	searchTerm?: string;
}

const RulesList: React.FC<RulesListProps> = ({
	rules,
	onUpdateRule,
	onDeleteRule,
	onCloneRule,
	onUpdateRuleHeaders,
	searchTerm = '',
}) => {
	const { theme } = useTheme();
	const themeClasses = getThemeClasses(theme);
	// Filter rules based on search term
	const filteredRules = rules.filter((rule) => {
		if (!searchTerm.trim()) return true;
		return rule.url.toLowerCase().includes(searchTerm.toLowerCase());
	});

	if (!Array.isArray(rules) || rules.length === 0) {
		return (
			<Box className='bg-white mx-3 mb-2'>
				<EmptyState />
			</Box>
		);
	}

	// Show empty state if no rules match the search
	if (filteredRules.length === 0 && searchTerm.trim()) {
		return (
			<Box className={`${themeClasses.bgCard} mx-3 mb-2 p-4 text-center rounded-md`}>
				<Text className={`${themeClasses.text}`}>No rules found matching "{searchTerm}"</Text>
			</Box>
		);
	}

	return (
		<Box className='mx-3'>
			<Accordion allowMultiple>
				{filteredRules.map((rule, index) => (
					<RuleCard
						key={rule.id}
						rule={rule}
						index={index}
						onUpdate={onUpdateRule}
						onDelete={onDeleteRule}
						onClone={onCloneRule}
						onUpdateHeaders={onUpdateRuleHeaders}
					/>
				))}
			</Accordion>
		</Box>
	);
};

export default RulesList;
