module.exports = {
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import', 'jest'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    'prettier/prettier': [
      'error',
      {
        trailingComma: 'all',
        singleQuote: true,
        printWidth: 100,
        arrowParens: 'avoid',
      },
    ],
    'no-param-reassign': 0,
    'no-debugger': 0,
    'import/named': ['error'],
    'import/no-cycle': 'error',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          './config/**',
          '**/*.story.jsx',
          '**/*.story.tsx',
          '**/test.js',
          '**/*.test.js',
          '**/*.test.jsx',
          '**/*.test.ts',
          '**/*.test.ts?(x)',
          '**/*.spec.ts',
          '**/*.spec.tsx',
          '**/*.spec.ts?(x)',
          '**/*.tz-test.ts?(x)',
        ],
      },
    ],
    'import/prefer-default-export': 0,
    'import/order': [
      'error',
      {
        groups: [
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'builtin',
        ],
        'newlines-between': 'always',
      },
    ],
    'lines-between-class-members': [
      2,
      'always',
      {
        exceptAfterSingleLine: true,
      },
    ],
    'jsx-a11y/anchor-is-valid': 0,
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        mjs: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'type',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    '@typescript-eslint/camelcase': 0,
    '@typescript-eslint/no-unsafe-argument': 1,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/explicit-member-accessibility': 0,
    '@typescript-eslint/no-explicit-any': 2,
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/FAQ.md#i-am-using-a-rule-from-eslint-core-and-it-doesnt-work-correctly-with-typescript-code
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': [
      'error',
      {
        functions: false,
      },
    ],
    '@typescript-eslint/unbound-method': 0,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-var-requires': 0,
    // use TS-aware rule instead
    'default-case': 0,
    '@typescript-eslint/switch-exhaustiveness-check': 2,
    'no-console': 'error',
    'no-restricted-imports': 'error',
    // disallow certain syntax forms
    // https://eslint.org/docs/rules/no-restricted-syntax
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message:
          'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message:
          'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message:
          '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
  },
  overrides: [
    {
      files: ['*.js', '*.jsx'],
      rules: {
        '@typescript-eslint/require-await': 0,
        '@typescript-eslint/unbound-method': 0,
        '@typescript-eslint/no-empty-function': 0,
        '@typescript-eslint/prefer-includes': 0,
        '@typescript-eslint/prefer-regexp-exec': 0,
      },
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'error',
      },
    },
  ],
  env: {
    browser: true,
    node: true,
    'jest/globals': true,
  },
};
