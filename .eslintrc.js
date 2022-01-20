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
        'import/prefer-default-export': 'off',
        'import/newline-after-import': 'off',
        'indent': 'off',
        'key-spacing': 'off',
        'no-plusplus': 'off',
        'no-multi-spaces': 'off',
        'no-console': ['error', { allow: ['warn', 'error'] }],
        'no-shadow': ['error', { 'builtinGlobals': true, 'hoist': 'all', 'allow': ['event'] }],
        'no-underscore-dangle': 'off',
        'object-curly-spacing': 'off',
        'quotes': ['warn', 'single'],
        'quote-props': 'off',
        'space-infix-ops': 'off',
    }
}
