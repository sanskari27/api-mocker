import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

// Extend Chakra UI theme to work well with TailwindCSS
const theme = extendTheme({
	styles: {
		global: {
			body: {
				bg: 'white',
				color: 'gray.800',
			},
		},
	},
});

const container = document.getElementById('root');
if (container) {
	const root = createRoot(container);
	root.render(
		<ChakraProvider theme={theme}>
			<App />
		</ChakraProvider>
	);
}
