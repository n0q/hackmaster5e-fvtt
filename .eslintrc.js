module.exports = {
    'env': {
        'es6': true,
        'browser': true
    },
    'settings': {
        'react': {'version': '999.999.999'}
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
        'PIXI': false,
        'Color': false,
        'PoolTerm': false,
        'DOMPurify': false,
    },
    'rules': {
        'brace-style': ["error", "1tbs", { "allowSingleLine": true }],
        'import/extensions': 'off',
        'import/prefer-default-export': 'off',
        'import/newline-after-import': 'off',
        'indent': 'off',
        'key-spacing': 'off',
        'no-bitwise': 'off',
        'no-continue': 'warn',
        'no-extra-boolean-cast': 'off',
        'no-plusplus': 'off',
        'no-multi-spaces': 'off',
        'no-use-before-define': ["error", { "functions": false }],
        'no-console': ['error', { allow: ['warn', 'error'] }],
        'no-shadow': ['error', { 'builtinGlobals': true, 'hoist': 'all', 'allow': ['event'] }],
        'no-underscore-dangle': 'off',
        'no-unused-expressions': ['error', { 'allowTernary': true }],
        'object-curly-newline': 'off',
        'object-curly-spacing': 'off',
        'prefer-destructuring': ['error', { 'AssignmentExpression': { 'array': false }}],
        'quotes': ['warn', 'single'],
        'quote-props': 'off',
        'space-infix-ops': 'off',
    }
}
