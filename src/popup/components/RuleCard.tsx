import { CopyIcon, DeleteIcon } from '@chakra-ui/icons';
import {
	AccordionButton,
	AccordionIcon,
	AccordionItem,
	AccordionPanel,
	Badge,
	Box,
	FormControl,
	FormLabel,
	HStack,
	IconButton,
	Input,
	Select,
	Switch,
	Tab,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
	Text,
	Tooltip,
	VStack,
} from '@chakra-ui/react';
import React from 'react';
import { MockRule } from '../../types';
import { getResolvedTheme, getThemeClasses, useTheme } from '../contexts/ThemeContext';
import Editor from './Editor';
import HeadersEditor from './HeadersEditor';

interface RuleCardProps {
	rule: MockRule;
	index: number;
	onUpdate: (ruleId: string, updates: Partial<MockRule>) => void;
	onDelete: (ruleId: string) => void;
	onClone: (ruleId: string) => void;
	onUpdateHeaders: (ruleId: string, headers: Record<string, string>) => void;
}

const RuleCard: React.FC<RuleCardProps> = ({
	rule,
	index,
	onUpdate,
	onDelete,
	onClone,
	onUpdateHeaders,
}) => {
	const { theme } = useTheme();
	const themeClasses = getThemeClasses(theme);

	return (
		<AccordionItem
			border='1px'
			borderColor='gray.200'
			mb={2}
			borderRadius='md'
			className={themeClasses.bgCard}
		>
			<AccordionButton className={`${themeClasses.hover} p-3`}>
				<Box flex='1' textAlign='left'>
					<HStack>
						<Badge size='sm' colorScheme='gray' variant='solid'>
							#{index + 1}
						</Badge>
						<Badge size='sm' colorScheme='blue' width={'10'} textAlign={'center'}>
							{rule.method}
						</Badge>
						<Badge size='sm' variant='outline'>
							{rule.responseCode}
						</Badge>
						<Text fontSize='sm' className={`font-mono font-semibold ${themeClasses.text}`}>
							{rule.url || 'New Rule'}
						</Text>
					</HStack>
				</Box>
				<HStack spacing={2}>
					<Badge size='sm' colorScheme='blue' variant='outline'>
						{rule.requestCount || 0} requests
					</Badge>
					<Box onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
						<Switch
							isChecked={rule.enabled}
							onChange={(e) => onUpdate(rule.id, { enabled: e.target.checked })}
							colorScheme='green'
							size='sm'
						/>
					</Box>
					<AccordionIcon />
				</HStack>
			</AccordionButton>
			<AccordionPanel pb={2} pt={0}>
				<VStack spacing={2} align='stretch'>
					{/* URL Input */}
					<FormControl className={themeClasses.text} rounded={'md'}>
						<FormLabel fontSize='sm' fontWeight='semibold'>
							URL Pattern
						</FormLabel>
						<Input
							size='sm'
							rounded={'md'}
							value={rule.url}
							onChange={(e) => onUpdate(rule.id, { url: e.target.value })}
							placeholder='e.g., /api/user or *user*'
							className='font-mono text-xs'
						/>
					</FormControl>

					{/* Method, Response Code, and Delay */}
					<HStack spacing={2}>
						<FormControl className={themeClasses.text} rounded={'md'}>
							<FormLabel fontSize='sm' fontWeight='semibold'>
								Method
							</FormLabel>
							<Select
								size='sm'
								rounded={'md'}
								value={rule.method}
								onChange={(e) =>
									onUpdate(rule.id, {
										method: e.target.value as MockRule['method'],
									})
								}
							>
								<option value='ANY'>ANY</option>
								<option value='GET'>GET</option>
								<option value='POST'>POST</option>
								<option value='PUT'>PUT</option>
								<option value='DELETE'>DELETE</option>
								<option value='PATCH'>PATCH</option>
							</Select>
						</FormControl>
						<FormControl className={themeClasses.text} rounded={'md'}>
							<FormLabel fontSize='sm' fontWeight='semibold'>
								Status Code
							</FormLabel>
							<Input
								size='sm'
								type='number'
								rounded={'md'}
								value={rule.responseCode}
								onChange={(e) =>
									onUpdate(rule.id, {
										responseCode: parseInt(e.target.value) || 200,
									})
								}
								min={100}
								max={599}
							/>
						</FormControl>
						<FormControl className={themeClasses.text} rounded={'md'}>
							<FormLabel fontSize='sm' fontWeight='semibold'>
								Delay (ms)
							</FormLabel>
							<Input
								size='sm'
								type='number'
								rounded={'md'}
								value={rule.delay || 0}
								onChange={(e) =>
									onUpdate(rule.id, {
										delay: parseInt(e.target.value) || 0,
									})
								}
								min={0}
								placeholder='0'
							/>
						</FormControl>
					</HStack>

					{/* Response Headers and Body Tabs */}
					<FormControl>
						<Tabs defaultIndex={0} size='sm'>
							<TabList>
								<Tab color={getResolvedTheme(theme) === 'dark' ? 'gray.100' : 'gray.900'}>
									Response Body
								</Tab>
								<Tab color={getResolvedTheme(theme) === 'dark' ? 'gray.100' : 'gray.900'}>
									Headers
								</Tab>
							</TabList>
							<TabPanels>
								<TabPanel px={0} py={2}>
									<Editor
										onChange={(value) => onUpdate(rule.id, { responseBody: value })}
										value={rule.responseBody}
										height='200px'
										placeholder='Enter JSON Response Body...'
									/>
								</TabPanel>
								<TabPanel px={0} py={2}>
									<HeadersEditor
										headers={rule.responseHeaders}
										onChange={(headers) => onUpdateHeaders(rule.id, headers)}
									/>
								</TabPanel>
							</TabPanels>
						</Tabs>
					</FormControl>

					{/* Action Buttons */}
					<HStack justify='flex-end' marginTop={-2} spacing={2}>
						<Tooltip label='Clone Rule' placement='top'>
							<IconButton
								aria-label='Clone Rule'
								icon={<CopyIcon />}
								size='sm'
								colorScheme='blue'
								variant='outline'
								onClick={() => onClone(rule.id)}
							/>
						</Tooltip>
						<Tooltip label='Delete Rule' placement='top'>
							<IconButton
								aria-label='Delete Rule'
								icon={<DeleteIcon />}
								size='sm'
								colorScheme='red'
								variant='outline'
								onClick={() => onDelete(rule.id)}
							/>
						</Tooltip>
					</HStack>
				</VStack>
			</AccordionPanel>
		</AccordionItem>
	);
};

export default RuleCard;
