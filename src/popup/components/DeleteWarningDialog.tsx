import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Button,
	Text,
} from '@chakra-ui/react';
import React, { useRef, useState } from 'react';

interface DeleteWarningDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	description: string;
	confirmText?: string;
	cancelText?: string;
	isLoading?: boolean;
}

type DeleteDialogState<T> = {
	isOpen: boolean;
	id: string | null;
	data: T | null;
};

type UseDeleteDialogStateReturn<T> = {
	isOpen: boolean;
	id: string | null;
	data: T | null;
	openDeleteDialog: (id?: string, data?: T) => void;
	closeDeleteDialog: () => void;
};

const DeleteWarningDialog: React.FC<DeleteWarningDialogProps> = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	description,
	confirmText = 'Delete',
	cancelText = 'Cancel',
	isLoading = false,
}) => {
	const cancelRef = useRef<HTMLButtonElement>(null);

	return (
		<AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
			<AlertDialogOverlay>
				<AlertDialogContent>
					<AlertDialogHeader fontSize='lg' fontWeight='bold'>
						{title}
					</AlertDialogHeader>

					<AlertDialogBody>
						<Text>{description}</Text>
					</AlertDialogBody>

					<AlertDialogFooter>
						<Button ref={cancelRef} onClick={onClose} isDisabled={isLoading}>
							{cancelText}
						</Button>
						<Button
							colorScheme='red'
							onClick={onConfirm}
							ml={3}
							isLoading={isLoading}
							loadingText='Deleting...'
						>
							{confirmText}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialogOverlay>
		</AlertDialog>
	);
};

export function useDeleteDialogState<T>(): UseDeleteDialogStateReturn<T> {
	const [state, setState] = useState<DeleteDialogState<T>>({
		isOpen: false,
		id: null,
		data: null,
	});

	const openDeleteDialog = (id?: string, data?: T) => {
		setState({
			isOpen: true,
			id: id ?? null,
			data: data ?? null,
		});
	};

	const closeDeleteDialog = () => {
		setState({
			isOpen: false,
			id: null,
			data: null,
		});
	};

	return {
		isOpen: state.isOpen,
		id: state.id,
		data: state.data,
		openDeleteDialog,
		closeDeleteDialog,
	};
}

export default DeleteWarningDialog;
