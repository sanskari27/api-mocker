import { Alert, AlertDescription, AlertIcon, Box } from '@chakra-ui/react';
import React from 'react';

const EmptyState: React.FC = () => {
	return (
		<Alert status='info' rounded='md'>
			<AlertIcon />
			<Box>
				<AlertDescription>
					No rules configured. Click "Add Rule" to get started.
				</AlertDescription>
			</Box>
		</Alert>
	);
};

export default EmptyState;
