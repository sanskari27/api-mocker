import { AddIcon, InfoIcon } from '@chakra-ui/icons';
import { Badge, Box, HStack, IconButton, Image, Text, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { FaPause, FaPlay } from 'react-icons/fa6';
import { FiDownload, FiUpload } from 'react-icons/fi';
import { IoIosNuclear } from 'react-icons/io';
import { API_DISABLED, API_ENABLED } from '../../assets';

interface AppHeaderProps {
	enabled: boolean;
	ruleCount: number;
	onToggleMocking: () => void;
	onAddNewRule: () => void;
	onAddExampleRule: () => void;
	onClearAllRules: () => void;
	onExportRules: () => void;
	onImportRules: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
	enabled,
	ruleCount,
	onToggleMocking,
	onAddNewRule,
	onAddExampleRule,
	onClearAllRules,
	onExportRules,
	onImportRules,
}) => {
	return (
		<Box className='bg-white p-3 border-b border-b-gray-700'>
			<HStack justify='space-between' align='center'>
				<HStack spacing={3}>
					<Image src={enabled ? API_ENABLED : API_DISABLED} alt='API Mocker' width={9} height={9} />
					<Text className='font-bold text-lg text-gray-800'>API Mocker</Text>
					<Badge variant='outline' size='sm'>
						{ruleCount} rules
					</Badge>
				</HStack>

				<HStack spacing={2}>
					<Tooltip label='Import Rules' placement='bottom'>
						<IconButton
							aria-label='Import Rules'
							icon={<FiDownload />}
							onClick={onImportRules}
							size='sm'
							variant='outline'
							colorScheme='purple'
						/>
					</Tooltip>
					<Tooltip label='Export Rules' placement='bottom'>
						<IconButton
							aria-label='Export Rules'
							icon={<FiUpload />}
							onClick={onExportRules}
							size='sm'
							variant='outline'
							colorScheme='purple'
						/>
					</Tooltip>
					<Tooltip label='Add Example Rule' placement='bottom'>
						<IconButton
							aria-label='Add Example Rule'
							icon={<InfoIcon />}
							onClick={onAddExampleRule}
							size='sm'
							variant='outline'
							colorScheme='blue'
						/>
					</Tooltip>
					<Tooltip label='Add New Rule' placement='bottom'>
						<IconButton
							aria-label='Add New Rule'
							icon={<AddIcon />}
							onClick={onAddNewRule}
							size='sm'
							colorScheme='blue'
						/>
					</Tooltip>
					{ruleCount > 0 && (
						<Tooltip label='Clear All Rules' placement='bottom'>
							<IconButton
								aria-label='Clear All Rules'
								icon={<IoIosNuclear />}
								onClick={onClearAllRules}
								size='sm'
								variant='outline'
								colorScheme='orange'
							/>
						</Tooltip>
					)}
					<Tooltip label={enabled ? 'Pause Mocking' : 'Start Mocking'} placement='bottom'>
						<IconButton
							aria-label={enabled ? 'Pause Mocking' : 'Start Mocking'}
							icon={enabled ? <FaPause /> : <FaPlay />}
							onClick={onToggleMocking}
							size='sm'
							colorScheme={enabled ? 'red' : 'green'}
							variant={enabled ? 'solid' : 'outline'}
						/>
					</Tooltip>
				</HStack>
			</HStack>
		</Box>
	);
};

export default AppHeader;
