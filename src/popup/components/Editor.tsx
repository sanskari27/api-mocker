import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import * as monaco from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getThemeClasses, useTheme } from '../contexts/ThemeContext';

interface EditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	height?: string;
}

const Editor: React.FC<EditorProps> = ({
	value,
	onChange,
	placeholder = 'Enter JSON...',
	height = '200px',
}) => {
	const [isValidJson, setIsValidJson] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');
	const [isExpanded, setIsExpanded] = useState(false);
	const editorRef = useRef<HTMLDivElement>(null);
	const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

	const { theme: currentTheme } = useTheme();
	const themeClasses = getThemeClasses(currentTheme);

	// Enable/disable handleMouseWheel based on mouse click inside/outside editor
	useEffect(() => {
		const handleClick = (event: MouseEvent) => {
			const editorNode = editorRef.current;
			const isInside = editorNode && editorNode.contains(event.target as Node);
			if (monacoEditorRef.current) {
				const editor = monacoEditorRef.current;
				const opts = editor.getRawOptions();
				if (isInside) {
					if (opts.scrollbar && opts.scrollbar.handleMouseWheel === false) {
						editor.updateOptions({ scrollbar: { ...opts.scrollbar, handleMouseWheel: true } });
					}
				} else {
					if (opts.scrollbar && opts.scrollbar.handleMouseWheel !== false) {
						editor.updateOptions({ scrollbar: { ...opts.scrollbar, handleMouseWheel: false } });
					}
				}
			}
		};
		document.addEventListener('mousedown', handleClick);
		return () => {
			document.removeEventListener('mousedown', handleClick);
		};
	}, []);

	// Validate JSON
	const validateJson = useCallback((jsonString: string) => {
		if (!jsonString || jsonString.trim() === '') {
			setIsValidJson(true);
			setErrorMessage('');
			return;
		}

		try {
			JSON.parse(jsonString);
			setIsValidJson(true);
			setErrorMessage('');
		} catch (error) {
			setIsValidJson(false);
			setErrorMessage(error instanceof Error ? error.message : 'Invalid JSON');
		}
	}, []);

	// Format JSON
	const formatJson = useCallback(() => {
		if (!value || value.trim() === '') return;

		try {
			const parsed = JSON.parse(value);
			const formatted = JSON.stringify(parsed, null, 2);
			onChange(formatted);
		} catch (error) {
			// If JSON is invalid, don't format
		}
	}, [value, onChange]);

	// Clear editor
	const clearEditor = useCallback(() => {
		onChange('');
		setIsValidJson(true);
		setErrorMessage('');
	}, [onChange]);

	// Toggle expanded view
	const toggleExpanded = useCallback(() => {
		setIsExpanded(!isExpanded);
	}, [isExpanded]);

	// Configure Monaco Editor
	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}
		// Set up Monaco Environment for Chrome extension
		(window as any).MonacoEnvironment = {
			getWorkerUrl: function (moduleId: string, label: string) {
				const baseUrl = chrome?.runtime?.getURL ? chrome.runtime.getURL('') : '';
				if (label === 'json') {
					return `${baseUrl}json.worker.js`;
				}
				return `${baseUrl}editor.worker.js`;
			},
		};

		// Configure JSON language features
		monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
			validate: true,
			allowComments: false,
			schemas: [],
		});
	}, []);

	// Initialize Monaco Editor
	useEffect(() => {
		if (!editorRef.current || monacoEditorRef.current) {
			return;
		}
		const editor = monaco.editor.create(editorRef.current, {
			value: value,
			language: 'json',
			selectOnLineNumbers: true,
			roundedSelection: false,
			readOnly: false,
			cursorStyle: 'line',
			automaticLayout: true,
			wordWrap: 'on',
			lineNumbers: 'on',
			folding: true,
			foldingStrategy: 'indentation',
			showFoldingControls: 'always',
			unfoldOnClickAfterEndOfLine: false,
			formatOnPaste: true,
			formatOnType: true,
			scrollBeyondLastLine: false,
			minimap: { enabled: true },
			fontSize: 12,
			fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
			theme: 'vs-light',
			tabSize: 2,
			insertSpaces: true,
			detectIndentation: true,
			renderWhitespace: 'all',
			renderControlCharacters: false,
			bracketPairColorization: {
				enabled: true,
			},
			guides: {
				bracketPairs: true,
				indentation: true,
			},
			// Enable find and replace functionality
			find: {
				seedSearchStringFromSelection: 'always',
				autoFindInSelection: 'multiline',
			},
			// Enable multi-cursor support
			multiCursorModifier: 'ctrlCmd',
			// Enable quick suggestions
			quickSuggestions: {
				other: true,
				comments: false,
				strings: true,
			},
			// Enable parameter hints
			parameterHints: {
				enabled: true,
			},
			// Enable hover provider
			hover: {
				enabled: true,
				delay: 300,
			},
			// Enable context menu
			contextmenu: true,
			// Enable color picker
			colorDecorators: true,
			scrollbar: {
				vertical: 'visible',
				horizontal: 'visible',
				handleMouseWheel: false,
			},
		});

		// Add format command with different shortcut
		editor.addCommand(
			monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
			formatJson
		);

		// Set up change handler
		editor.onDidChangeModelContent(() => {
			const model = editor.getModel();
			if (model) {
				const markers = monaco.editor.getModelMarkers({ resource: model.uri });
				if (markers.length > 0) {
					setIsValidJson(false);
					setErrorMessage(markers[0].message);
				} else {
					setIsValidJson(true);
					setErrorMessage('');
				}
			}
			const newValue = editor.getValue();
			onChange(newValue);
		});

		monacoEditorRef.current = editor;
	}, [value, onChange, formatJson]);

	// Update editor value when prop changes
	useEffect(() => {
		if (monacoEditorRef.current && monacoEditorRef.current.getValue() !== value) {
			monacoEditorRef.current.setValue(value);
		}
	}, [value]);

	// Cleanup Monaco Editor on unmount
	useEffect(() => {
		return () => {
			if (monacoEditorRef.current) {
				monacoEditorRef.current.dispose();
				monacoEditorRef.current = null;
			}
		};
	}, []);

	// Validate on value change
	useEffect(() => {
		validateJson(value);
	}, [value, validateJson]);

	// Auto-expand if JSON is valid and has nested structure
	useEffect(() => {
		if (!isValidJson || !value) {
			return;
		}
		try {
			const parsed = JSON.parse(value);
			const hasNestedStructure =
				typeof parsed === 'object' &&
				parsed !== null &&
				(Object.keys(parsed).length > 0 || Array.isArray(parsed));
			setIsExpanded(hasNestedStructure);
		} catch (error) {
			// Ignore parsing errors
		}
	}, [isValidJson, value]);

	return (
		<Box position='relative'>
			<VStack spacing={2} align='stretch'>
				<HStack justify='space-between' align='center'>
					<Text fontSize='xs' color='gray.600' fontWeight='medium'>
						JSON Editor
					</Text>
					<HStack spacing={1}>
						<Button
							className={themeClasses.buttonSecondary}
							size='xs'
							variant='outline'
							onClick={formatJson}
							isDisabled={!isValidJson || !value || value.trim() === ''}
						>
							Format
						</Button>
						<Button
							className={themeClasses.buttonSecondary}
							size='xs'
							variant='outline'
							onClick={toggleExpanded}
							isDisabled={!isValidJson || !value || value.trim() === ''}
						>
							{isExpanded ? 'Collapse' : 'Expand'}
						</Button>
						<Button size='xs' variant='outline' colorScheme='red' onClick={clearEditor} hidden>
							Clear
						</Button>
					</HStack>
				</HStack>

				{/* Monaco Editor */}
				<Box
					border='1px solid'
					borderColor={!isValidJson ? 'red.300' : 'gray.300'}
					borderRadius='md'
					overflow='hidden'
					height={isExpanded ? '400px' : height}
					transition='height 0.2s ease-in-out'
				>
					<Box ref={editorRef} height='100%' width='100%' />
				</Box>

				{/* Error Message */}
				{!isValidJson && errorMessage && (
					<Box
						bg='red.50'
						border='1px solid'
						borderColor='red.200'
						borderRadius='md'
						p={2}
						fontSize='xs'
						color='red.600'
					>
						<Text fontWeight='medium'>JSON Error:</Text>
						<Text>{errorMessage}</Text>
					</Box>
				)}
			</VStack>
		</Box>
	);
};

export default Editor;
