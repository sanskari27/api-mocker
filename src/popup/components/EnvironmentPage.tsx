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
import { FiDownload, FiServer, FiUpload } from 'react-icons/fi';
import { Environment } from '../../types';
import { getThemeClasses, useTheme } from '../contexts/ThemeContext';
import DeleteWarningDialog, { useDeleteDialogState } from './DeleteWarningDialog';

interface EnvironmentPageProps {
	environments: Environment[];
	onAddEnvironment: () => void;
	onDeleteEnvironment: (envId: string) => void;
	onUpdateEnvironment: (envId: string, name: string) => void;
	onEnvironmentStatusUpdate: (envId: string, enabled: boolean) => void;
	onExportEnvironmentRules: (envId: string) => void;
	onImportEnvironmentRules: (envId: string) => void;
	onClose: () => void;
}

const EnvironmentPage: React.FC<EnvironmentPageProps> = ({
	environments,
	onEnvironmentStatusUpdate,
	onAddEnvironment,
	onDeleteEnvironment,
	onUpdateEnvironment,
	onClose,
	onExportEnvironmentRules,
	onImportEnvironmentRules,
}) => {
	const { theme } = useTheme();
	const themeClasses = getThemeClasses(theme);

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
		<Box className={`w-full h-full ${themeClasses.bg} ${themeClasses.text}`}>
			{/* Header with close button and add button */}
			<Box className={`${themeClasses.bgHeader} p-4 border-b ${themeClasses.border}`}>
				<HStack justify='space-between' align='center'>
					<HStack spacing={3}>
						<FiServer size={24} className={themeClasses.textSecondary} />
						<Text className={`font-bold text-xl ${themeClasses.text}`}>Environments</Text>
					</HStack>
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
							<Box
								key={env.id}
								className={`${themeClasses.bgCard} p-3 rounded border ${themeClasses.border} shadow-sm`}
							>
								<HStack justify='space-between' align='center'>
									<FormControl>
										<Input
											size='sm'
											variant={'flushed'}
											value={env.name}
											onChange={(e) => onUpdateEnvironment(env.id, e.target.value)}
											placeholder='Environment name'
											className={`font-mono text-xs flex-1 mr-3 ${themeClasses.input}`}
										/>
									</FormControl>
									<HStack spacing={2}>
										<Switch
											isChecked={env.enabled}
											onChange={(e) => onEnvironmentStatusUpdate(env.id, e.target.checked)}
											colorScheme='green'
											size='sm'
										/>

										<Tooltip label='Import Environment' placement='bottom'>
											<IconButton
												aria-label='Import Rules'
												icon={<FiDownload />}
												onClick={() => onImportEnvironmentRules(env.id)}
												size='sm'
												variant='outline'
												colorScheme='purple'
											/>
										</Tooltip>
										<Tooltip label='Export Environment' placement='bottom'>
											<IconButton
												aria-label='Export Rules'
												icon={<FiUpload />}
												onClick={() => onExportEnvironmentRules(env.id)}
												size='sm'
												variant='outline'
												colorScheme='purple'
											/>
										</Tooltip>
										<Tooltip label='Delete Environment' placement='bottom'>
											<IconButton
												aria-label='Delete Environment'
												icon={<DeleteIcon />}
												onClick={() => handleDeleteClick(env.id, env.name)}
												size='sm'
												disabled={env.id === 'default'}
												variant='ghost'
												colorScheme='red'
												color='red.500'
												_hover={{ bg: 'red.50' }}
											/>
										</Tooltip>
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
