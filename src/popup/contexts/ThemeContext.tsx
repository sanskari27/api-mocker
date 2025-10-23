import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
	theme: Theme;
	setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
	children: ReactNode;
	theme: Theme;
	onThemeChange: (theme: Theme) => void;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, theme, onThemeChange }) => {
	const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme());

	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

		const handleChange = (e: MediaQueryListEvent) => {
			setSystemTheme(e.matches ? 'dark' : 'light');
		};

		mediaQuery.addEventListener('change', handleChange);

		return () => {
			mediaQuery.removeEventListener('change', handleChange);
		};
	}, []);

	const setTheme = (newTheme: Theme) => {
		onThemeChange(newTheme);
	};

	return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
};

// Theme utility functions
export const getSystemTheme = (): 'light' | 'dark' => {
	if (typeof window !== 'undefined' && window.matchMedia) {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	return 'light';
};

export const getResolvedTheme = (theme: Theme): 'light' | 'dark' => {
	if (theme === 'system') {
		return getSystemTheme();
	}
	return theme;
};

export const getThemeClasses = (theme: Theme) => {
	const resolvedTheme = getResolvedTheme(theme);

	return {
		// Background colors
		bg: resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50',
		bgCard: resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white',
		bgHeader: resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white',

		// Text colors
		text: resolvedTheme === 'dark' ? 'text-gray-100' : 'text-gray-800',
		textSecondary: resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600',
		textMuted: resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500',

		// Border colors
		border: resolvedTheme === 'dark' ? 'border-gray-700' : 'border-gray-200',
		borderLight: resolvedTheme === 'dark' ? 'border-gray-600' : 'border-gray-300',

		// Hover states
		hover: resolvedTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
		hoverCard: resolvedTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50',

		// Input styles
		input:
			resolvedTheme === 'dark'
				? 'bg-gray-700 border-gray-600 text-gray-100'
				: 'bg-white border-gray-300 text-gray-800',

		// Button styles
		buttonPrimary:
			resolvedTheme === 'dark'
				? '!bg-blue-600 hover:!bg-blue-700 text-white'
				: '!bg-blue-500 hover:!bg-blue-600 !text-white',
		buttonSecondary:
			resolvedTheme === 'dark'
				? '!bg-gray-700 hover:!bg-gray-600 !text-gray-100'
				: '!bg-gray-100 hover:!bg-gray-200 !text-gray-800',
	};
};
