import { CloseIcon, SettingsIcon } from '@chakra-ui/icons';
import { Box, Button, Divider, HStack, IconButton, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import { FiDownload, FiTrash2, FiUpload } from 'react-icons/fi';
import DeleteWarningDialog, { useDeleteDialogState } from './DeleteWarningDialog';

interface SettingsPageProps {
	onClose: () => void;
	onExportEnvironments: () => void;
	onImportEnvironments: () => void;
	onClearAllEnvironments: () => void;
	environmentCount: number;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
	onClose,
	onExportEnvironments,
	onImportEnvironments,
	onClearAllEnvironments,
	environmentCount,
}) => {
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
		<Box className='w-full h-full bg-gray-50 text-gray-800'>
			{/* Header with close button */}
			<Box className='bg-white p-4 border-b border-gray-200'>
				<HStack justify='space-between' align='center'>
					<HStack spacing={3}>
						<SettingsIcon boxSize={6} color='gray.600' />
						<Text className='font-bold text-xl text-gray-800'>Settings</Text>
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
					{/* Data Management Section */}
					<Box>
						<Text className='font-bold text-xl text-gray-800 mb-2'>Data Management</Text>
						<Text className='text-gray-600 text-sm mb-3'>
							Export and import your API mocking environments for backup or sharing.
						</Text>

						<Box className='bg-white p-4 rounded border border-gray-200 shadow-sm'>
							<HStack justify='space-between' align='center'>
								<VStack align='start' spacing={1}>
									<Text className='font-semibold text-gray-800'>Export Rules</Text>
									<Text className='text-gray-600 text-sm'>
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

						<Box className='bg-white p-4 rounded border border-gray-200 shadow-sm mt-2'>
							<HStack justify='space-between' align='center'>
								<VStack align='start' spacing={1}>
									<Text className='font-semibold text-gray-800'>Import Rules</Text>
									<Text className='text-gray-600 text-sm'>
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
						<Text className='font-bold text-xl text-gray-800 mb-1'>Danger Zone</Text>

						<Box className='border border-red-300 rounded p-4 bg-white shadow-sm'>
							<HStack justify='space-between' align='center'>
								<VStack align='start' spacing={1}>
									<Text className='font-semibold text-gray-800'>Delete All Rules</Text>
									<Text className='text-gray-600 text-sm'>
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
