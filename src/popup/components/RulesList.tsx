import { Accordion, Box } from '@chakra-ui/react';
import React from 'react';
import { MockRule } from '../../types';
import EmptyState from './EmptyState';
import RuleCard from './RuleCard';

interface RulesListProps {
	rules: MockRule[];
	onUpdateRule: (ruleId: string, updates: Partial<MockRule>) => void;
	onDeleteRule: (ruleId: string) => void;
	onUpdateRuleHeaders: (ruleId: string, headers: Record<string, string>) => void;
}

const RulesList: React.FC<RulesListProps> = ({
	rules,
	onUpdateRule,
	onDeleteRule,
	onUpdateRuleHeaders,
}) => {
	if (!Array.isArray(rules) || rules.length === 0) {
		return (
			<Box className='bg-white mx-3 mb-2'>
				<EmptyState />
			</Box>
		);
	}

	return (
		<Box className='bg-white mx-3'>
			<Accordion allowMultiple>
				{rules.map((rule, index) => (
					<RuleCard
						key={rule.id}
						rule={rule}
						index={index}
						onUpdate={onUpdateRule}
						onDelete={onDeleteRule}
						onUpdateHeaders={onUpdateRuleHeaders}
					/>
				))}
			</Accordion>
		</Box>
	);
};

export default RulesList;
