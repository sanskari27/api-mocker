import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { getThemeClasses, useTheme } from '../contexts/ThemeContext';
import { getInputThemeProps } from '../utils/themeUtils';

interface SearchComponentProps {
	searchTerm: string;
	onSearchChange: (term: string) => void;
	placeholder?: string;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
	searchTerm,
	onSearchChange,
	placeholder = 'Search URLs...',
}) => {
	const { theme } = useTheme();
	const themeClasses = getThemeClasses(theme);
	const inputThemeProps = getInputThemeProps(theme);

	return (
		<InputGroup size='sm' maxW='300px' rounded='md'>
			<InputLeftElement pointerEvents='none'>
				<FaSearch className={`text-sm ${themeClasses.textMuted}`} />
			</InputLeftElement>
			<Input
				rounded='md'
				value={searchTerm}
				onChange={(e) => onSearchChange(e.target.value)}
				placeholder={placeholder}
				className={`${themeClasses.input} placeholder:${themeClasses.textMuted}`}
				{...inputThemeProps}
			/>
		</InputGroup>
	);
};

export default SearchComponent;
