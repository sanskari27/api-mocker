import { CloseIcon, SettingsIcon } from '@chakra-ui/icons';
import {
	Box,
	Button,
	Divider,
	FormControl,
	HStack,
	IconButton,
	Select,
	Text,
	VStack,
} from '@chakra-ui/react';
import React from 'react';
import { FiDownload, FiTrash2, FiUpload } from 'react-icons/fi';
import { getSystemTheme, getThemeClasses, useTheme } from '../contexts/ThemeContext';
import { getInputThemeProps } from '../utils/themeUtils';
import DeleteWarningDialog, { useDeleteDialogState } from './DeleteWarningDialog';

interface SettingsPageProps {
	onClose: () => void;
	onExportEnvironments: () => void;
	onImportEnvironments: () => void;
	onClearAllEnvironments: () => void;
	environmentCount: number;
	theme: 'light' | 'dark' | 'system';
	onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
	onClose,
	onExportEnvironments,
	onImportEnvironments,
	onClearAllEnvironments,
	environmentCount,
	theme,
	onThemeChange,
}) => {
	const { theme: currentTheme } = useTheme();
	const themeClasses = getThemeClasses(currentTheme);
	const inputThemeProps = getInputThemeProps(theme);

	const {
		isOpen: isDeleteDialogOpen,
		openDeleteDialog,
		closeDeleteDialog,
	} = useDeleteDialogState();

	const handleDeleteAllClick = () => {
		openDeleteDialog();
	};

	const handleDeleteConfirm = () => {
		onClearAllEnvironments();
		closeDeleteDialog();
	};

	const handleDeleteCancel = () => {
		closeDeleteDialog();
	};
	return (
		<Box className={`w-full h-full ${themeClasses.bg} ${themeClasses.text}`}>
			{/* Header with close button */}
			<Box className={`${themeClasses.bgHeader} p-4 border-b ${themeClasses.border}`}>
				<HStack justify='space-between' align='center'>
					<HStack spacing={3}>
						<SettingsIcon boxSize={6} color='gray.600' />
						<Text className={`font-bold text-xl ${themeClasses.text}`}>Settings</Text>
					</HStack>
					<IconButton
						aria-label='Close Settings'
						icon={<CloseIcon />}
						onClick={onClose}
						size='sm'
						variant='ghost'
						colorScheme='gray'
						color='gray.600'
						_hover={{ bg: 'gray.100' }}
					/>
				</HStack>
			</Box>

			{/* Settings content */}
			<Box className='p-4'>
				<VStack spacing={4} align='stretch'>
					{/* Appearance Section */}
					<Box>
						<Text className={`font-bold text-xl ${themeClasses.text} mb-2`}>Appearance</Text>
						<Text className={`${themeClasses.textSecondary} text-sm mb-3`}>
							Customize the look and feel of the extension.
						</Text>

						<Box
							className={`${themeClasses.bgCard} p-4 rounded border ${themeClasses.border} shadow-sm`}
						>
							<HStack justify='space-between' align='center'>
								<VStack align='start' spacing={1}>
									<Text className={`font-semibold ${themeClasses.text}`}>Theme</Text>
									<Text className={`text-xs ${themeClasses.textMuted} capitalize`}>
										{theme === 'system' ? `System (${getSystemTheme()})` : theme}
									</Text>
								</VStack>

								<FormControl className='!w-fit ml-auto rounded-md'>
									<Select
										value={theme}
										onChange={(e) => onThemeChange(e.target.value as 'light' | 'dark' | 'system')}
										size='sm'
										width='200px'
										rounded={'md'}
										className={`${themeClasses.input}`}
										{...inputThemeProps}
									>
										<option value='system'>System</option>
										<option value='light'>Light</option>
										<option value='dark'>Dark</option>
									</Select>
								</FormControl>
							</HStack>
						</Box>
					</Box>

					<Divider borderColor='gray.300' />

					{/* Data Management Section */}
					<Box>
						<Text className={`font-bold text-xl ${themeClasses.text} mb-2`}>Data Management</Text>
						<Text className={`${themeClasses.textSecondary} text-sm mb-3`}>
							Export and import your API mocking environments for backup or sharing.
						</Text>

						<Box
							className={`${themeClasses.bgCard} p-4 rounded border ${themeClasses.border} shadow-sm`}
						>
							<HStack justify='space-between' align='center'>
								<VStack align='start' spacing={1}>
									<Text className={`font-semibold ${themeClasses.text}`}>Export Rules</Text>
									<Text className={`${themeClasses.textSecondary} text-sm`}>
										Download all your environments as a JSON file
									</Text>
								</VStack>
								<Button
									leftIcon={<FiUpload />}
									onClick={onExportEnvironments}
									colorScheme='purple'
									variant='outline'
									size='sm'
									borderColor='purple.500'
									color='purple.600'
									_hover={{ bg: 'purple.50', borderColor: 'purple.600' }}
								>
									Export
								</Button>
							</HStack>
						</Box>

						<Box
							className={`${themeClasses.bgCard} p-4 rounded border ${themeClasses.border} shadow-sm mt-2`}
						>
							<HStack justify='space-between' align='center'>
								<VStack align='start' spacing={1}>
									<Text className={`font-semibold ${themeClasses.text}`}>Import Rules</Text>
									<Text className={`${themeClasses.textSecondary} text-sm`}>
										Upload a JSON file to restore your environments
									</Text>
								</VStack>
								<Button
									leftIcon={<FiDownload />}
									onClick={onImportEnvironments}
									colorScheme='purple'
									variant='outline'
									size='sm'
									borderColor='purple.500'
									color='purple.600'
									_hover={{ bg: 'purple.50', borderColor: 'purple.600' }}
								>
									Import
								</Button>
							</HStack>
						</Box>
					</Box>

					<Divider borderColor='gray.300' />

					{/* Danger Zone Section */}
					<Box>
						<Text className={`font-bold text-xl ${themeClasses.text} mb-1`}>Danger Zone</Text>

						<Box className={`border border-red-400 rounded p-4 ${themeClasses.bgCard} shadow-sm`}>
							<HStack justify='space-between' align='center'>
								<VStack align='start' spacing={1}>
									<Text className={`font-semibold ${themeClasses.text}`}>Delete All Rules</Text>
									<Text className={`${themeClasses.textSecondary} text-sm`}>
										This will permanently delete all {environmentCount} environments. This action
										cannot be undone.
									</Text>
								</VStack>
								<Button
									leftIcon={<FiTrash2 />}
									onClick={handleDeleteAllClick}
									colorScheme='red'
									variant='outline'
									size='sm'
									borderColor='red.500'
									color='red.600'
									_hover={{ bg: 'red.50', borderColor: 'red.600' }}
									isDisabled={environmentCount === 0}
								>
									Delete All
								</Button>
							</HStack>
						</Box>
					</Box>
				</VStack>
			</Box>

			{/* Delete Warning Dialog */}
			<DeleteWarningDialog
				isOpen={isDeleteDialogOpen}
				onClose={handleDeleteCancel}
				onConfirm={handleDeleteConfirm}
				title='Delete All Rules'
				description={`Are you sure you want to delete all ${environmentCount} environments? This action cannot be undone and will permanently remove all your API mocking environments.`}
				confirmText='Delete All Rules'
				cancelText='Cancel'
			/>
		</Box>
	);
};

export default SettingsPage;
