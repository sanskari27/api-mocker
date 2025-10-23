import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { HStack, IconButton, Input, Tooltip, VStack } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { getResolvedTheme, getThemeClasses, useTheme } from '../contexts/ThemeContext';

interface HeadersEditorProps {
	headers: Record<string, string>;
	onChange: (headers: Record<string, string>) => void;
}

const HeadersEditor: React.FC<HeadersEditorProps> = ({ headers, onChange }) => {
	const { theme } = useTheme();
	const themeClasses = getThemeClasses(theme);
	const [headerEntries, setHeaderEntries] = useState<Array<{ key: string; value: string }>>([]);

	useEffect(() => {
		const entries = Object.entries(headers).map(([key, value]) => ({ key, value }));
		if (entries.length === 0) {
			entries.push({ key: '', value: '' });
		}
		setHeaderEntries(entries);
	}, [headers]);

	const updateHeaders = (entries: Array<{ key: string; value: string }>) => {
		const newHeaders: Record<string, string> = {};
		entries.forEach(({ key, value }) => {
			if (key.trim() && value.trim()) {
				newHeaders[key.trim()] = value.trim();
			}
		});
		onChange(newHeaders);
	};

	const updateEntry = (index: number, field: 'key' | 'value', newValue: string) => {
		const newEntries = [...headerEntries];
		newEntries[index] = { ...newEntries[index], [field]: newValue };
		setHeaderEntries(newEntries);
		updateHeaders(newEntries);
	};

	const addEntry = () => {
		const newEntries = [...headerEntries, { key: '', value: '' }];
		setHeaderEntries(newEntries);
	};

	const removeEntry = (index: number) => {
		if (headerEntries.length > 1) {
			const newEntries = headerEntries.filter((_, i) => i !== index);
			setHeaderEntries(newEntries);
			updateHeaders(newEntries);
		}
	};

	return (
		<VStack spacing={1} align='stretch'>
			{headerEntries.map((entry, index) => (
				<HStack key={index} spacing={2}>
					<Input
						size='sm'
						placeholder='Header name'
						value={entry.key}
						rounded={'md'}
						onChange={(e) => updateEntry(index, 'key', e.target.value)}
						className={`text-xs ${themeClasses.input}`}
					/>
					<Input
						size='sm'
						placeholder='Header value'
						value={entry.value}
						rounded={'md'}
						onChange={(e) => updateEntry(index, 'value', e.target.value)}
						className={`text-xs ${themeClasses.input}`}
					/>
					{headerEntries.length > 1 && (
						<Tooltip label='Remove header' placement='top'>
							<IconButton
								size='sm'
								aria-label='Remove header'
								icon={<DeleteIcon />}
								onClick={() => removeEntry(index)}
								variant='ghost'
								colorScheme='red'
							/>
						</Tooltip>
					)}
				</HStack>
			))}
			<Tooltip label='Add Header' placement='top'>
				<IconButton
					size='xs'
					aria-label='Add Header'
					icon={<AddIcon color={getResolvedTheme(theme) === 'dark' ? 'gray.200' : 'gray.800'} />}
					onClick={addEntry}
					variant='outline'
					alignSelf='flex-start'
				/>
			</Tooltip>
		</VStack>
	);
};

export default HeadersEditor;
