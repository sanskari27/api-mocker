const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
    entry: {
        popup: './src/popup/index.tsx',
        background: './src/background.ts',
        content: './src/content.ts',
        'main-world': './src/main-world.ts'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    require('tailwindcss'),
                                    require('autoprefixer')
                                ]
                            }
                        }
                    }
                ]
            }, {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: "file-loader",
                    },
                ],
                exclude: /node_modules/,
            },
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/popup/popup.html',
            filename: 'popup.html',
            chunks: ['popup']
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/manifest.json', to: 'manifest.json' },
                { from: 'src/assets/api-enabled.png', to: 'api-enabled.png' },
                { from: 'src/assets/api-disabled.png', to: 'api-disabled.png' }
            ]
        }),
        new MonacoWebpackPlugin({
            languages: ["json"], // only include JSON to reduce bundle size
            features: [
                "folding",
                "bracketMatching",
                "wordHighlighter",
                "find",
                "findWidget",
                "replace",
                "format",
                "indentation",
                "suggest",
                "multiCursor",
                "codeAction",
                "parameterHints",
                "quickOpen",
                "snippet",
                "hover",
                "contextmenu",
                "colorPicker"
            ],
            publicPath: '',
        }),
    ]
};
