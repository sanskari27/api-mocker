import { AddIcon, CloseIcon, DeleteIcon } from '@chakra-ui/icons';
import {
	Box,
	FormControl,
	HStack,
	IconButton,
	Input,
	Switch,
	Text,
	Tooltip,
	VStack,
} from '@chakra-ui/react';
import React from 'react';
import { Environment } from '../../types';
import DeleteWarningDialog, { useDeleteDialogState } from './DeleteWarningDialog';

interface EnvironmentPageProps {
	environments: Environment[];
	onAddEnvironment: () => void;
	onDeleteEnvironment: (envId: string) => void;
	onUpdateEnvironment: (envId: string, name: string) => void;
	onEnvironmentStatusUpdate: (envId: string, enabled: boolean) => void;
	onClose: () => void;
}

const EnvironmentPage: React.FC<EnvironmentPageProps> = ({
	environments,
	onEnvironmentStatusUpdate,
	onAddEnvironment,
	onDeleteEnvironment,
	onUpdateEnvironment,
	onClose,
}) => {
	const {
		isOpen: isDeleteDialogOpen,
		id: deleteId,
		data: deleteDialogName,
		openDeleteDialog,
		closeDeleteDialog,
	} = useDeleteDialogState<string>();

	const handleDeleteClick = (envId: string, envName: string) => {
		openDeleteDialog(envId, envName);
	};

	const handleDeleteConfirm = () => {
		if (deleteId) {
			onDeleteEnvironment(deleteId);
		}
		closeDeleteDialog();
	};

	const handleDeleteCancel = () => {
		closeDeleteDialog();
	};
	return (
		<Box className='w-full h-full bg-gray-50 text-gray-800'>
			{/* Header with close button and add button */}
			<Box className='bg-white p-4 border-b border-gray-200'>
				<HStack justify='space-between' align='center'>
					<Text className='font-bold text-xl text-gray-800'>Environments</Text>
					<HStack spacing={2}>
						<Tooltip label='Add New Environment' placement='bottom'>
							<IconButton
								aria-label='Add New Environment'
								icon={<AddIcon />}
								onClick={onAddEnvironment}
								size='sm'
								colorScheme='blue'
							/>
						</Tooltip>

						<IconButton
							aria-label='Close Environments'
							icon={<CloseIcon />}
							onClick={onClose}
							size='sm'
							variant='ghost'
							colorScheme='gray'
							color='gray.600'
							_hover={{ bg: 'gray.100' }}
						/>
					</HStack>
				</HStack>
			</Box>

			{/* Environments content */}
			<Box className='p-4'>
				<VStack spacing={4} align='stretch'>
					<VStack spacing={2} align='stretch' className=''>
						{environments.map((env) => (
							<Box key={env.id} className='bg-white p-3 rounded border border-gray-200 shadow-sm'>
								<HStack justify='space-between' align='center'>
									<FormControl>
										<Input
											size='sm'
											variant={'flushed'}
											value={env.name}
											onChange={(e) => onUpdateEnvironment(env.id, e.target.value)}
											placeholder='Environment name'
											className='font-mono text-xs flex-1 mr-3'
										/>
									</FormControl>
									<HStack spacing={2}>
										<Switch
											isChecked={env.enabled}
											onChange={(e) => onEnvironmentStatusUpdate(env.id, e.target.checked)}
											colorScheme='green'
											size='sm'
										/>
										{env.id !== 'default' && (
											<Tooltip label='Delete Environment' placement='bottom'>
												<IconButton
													aria-label='Delete Environment'
													icon={<DeleteIcon />}
													onClick={() => handleDeleteClick(env.id, env.name)}
													size='sm'
													variant='ghost'
													colorScheme='red'
													color='red.500'
													_hover={{ bg: 'red.50' }}
												/>
											</Tooltip>
										)}
									</HStack>
								</HStack>
							</Box>
						))}
					</VStack>
				</VStack>
			</Box>

			{/* Delete Warning Dialog */}
			<DeleteWarningDialog
				isOpen={isDeleteDialogOpen}
				onClose={handleDeleteCancel}
				onConfirm={handleDeleteConfirm}
				title='Delete Environment'
				description={`Are you sure you want to delete "${deleteDialogName}"? This action cannot be undone.`}
				confirmText='Delete Environment'
				cancelText='Cancel'
			/>
		</Box>
	);
};

export default EnvironmentPage;
