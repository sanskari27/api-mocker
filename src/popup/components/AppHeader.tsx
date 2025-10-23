import { AddIcon, SettingsIcon } from '@chakra-ui/icons';
import { Badge, Box, HStack, IconButton, Image, Text, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { FaPause, FaPlay } from 'react-icons/fa6';
import { SiDotenv } from 'react-icons/si';
import { API_DISABLED, API_ENABLED } from '../../assets';

interface AppHeaderProps {
	enabled: boolean;
	ruleCount: number;
	onToggleMocking: () => void;
	onAddNewRule: () => void;
	onOpenPage: (page: 'settings' | 'environments') => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
	enabled,
	ruleCount,
	onToggleMocking,
	onAddNewRule,
	onOpenPage,
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
					<Tooltip label='Settings' placement='bottom'>
						<IconButton
							aria-label='Settings'
							icon={<SettingsIcon />}
							onClick={() => onOpenPage('settings')}
							size='sm'
							variant='outline'
							colorScheme='gray'
						/>
					</Tooltip>
					<Tooltip label='Environments' placement='bottom'>
						<IconButton
							aria-label='Environments'
							icon={<SiDotenv />}
							onClick={() => onOpenPage('environments')}
							size='sm'
							variant='outline'
							colorScheme='purple'
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
