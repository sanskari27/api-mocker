import { getResolvedTheme, Theme } from '../contexts/ThemeContext';

/**
 * Get theme-based input styling props for Chakra UI components
 */
export const getInputThemeProps = (theme: Theme) => {
	const isDark = getResolvedTheme(theme) === 'dark';

	return {
		borderColor: isDark ? 'gray.600' : 'gray.200',
		_focus: {
			borderColor: isDark ? 'gray.500' : 'gray.300',
		},
		_active: {
			borderColor: 'gray.400',
		},
		_focusVisible: {
			borderColor: 'gray.400',
		},
	};
};

/**
 * Get theme-based border styling for containers
 */
export const getBorderThemeProps = (theme: Theme) => {
	const isDark = getResolvedTheme(theme) === 'dark';

	return {
		borderColor: isDark ? 'gray.700' : 'gray.200',
	};
};

/**
 * Get theme-based text color for tabs and labels
 */
export const getTextThemeProps = (theme: Theme) => {
	const isDark = getResolvedTheme(theme) === 'dark';

	return {
		color: isDark ? 'gray.100' : 'gray.900',
	};
};
