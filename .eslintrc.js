module.exports = {
    'env': {
        'es6': true,
        'browser': true
    },
    'settings': {
        'react': {'version': 'latest'}
        },
    'parserOptions': {
        'ecmaVersion': 2020,
        'sourceType': 'module',
        'ecmaFeatures': {'jsx': true}
    },
    'extends': ['airbnb', '@typhonjs-fvtt/eslint-config-foundry.js'],
    'rules': {
        'import/extensions': 'off',
        'indent': 'off',
        'no-plusplus': 'off',
        'no-multi-spaces': 'off',
        'no-console': ['error', { allow: ['warn', 'error'] }],
        'no-shadow': ['error', { 'builtinGlobals': true, 'hoist': 'all', 'allow': ['event'] }],
        'object-curly-spacing': 'off',
        'quote-props': 'warn'
    }
}
