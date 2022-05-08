module.exports = {
    'env': {
        'es6': true,
        'browser': true
    },
    'settings': {
        'react': {'version': 'latest'}
        },
    'parser': '@babel/eslint-parser',
    'parserOptions': {
        'requireConfigFile': false,
        'ecmaVersion': 2020,
        'sourceType': 'module',
        'ecmaFeatures': {'jsx': true}
    },
    'extends': ['airbnb', '@typhonjs-fvtt/eslint-config-foundry.js'],
    'globals': {
        '$': false,
        'game': false,
        'PoolTerm': false,
        'DOMPurify': false,
    },
    'rules': {
        'import/extensions': 'off',
        'import/prefer-default-export': 'off',
        'import/newline-after-import': 'off',
        'indent': 'off',
        'key-spacing': 'off',
        'no-continue': 'warn',
        'no-plusplus': 'off',
        'no-multi-spaces': 'off',
        'no-console': ['error', { allow: ['warn', 'error'] }],
        'no-shadow': ['error', { 'builtinGlobals': true, 'hoist': 'all', 'allow': ['event'] }],
        'no-underscore-dangle': 'off',
        'no-unused-expressions': ['error', { 'allowTernary': true }],
        'object-curly-newline': 'off',
        'object-curly-spacing': 'off',
        'quotes': ['warn', 'single'],
        'quote-props': 'off',
        'space-infix-ops': 'off',
    }
}
