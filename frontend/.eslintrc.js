module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    // Add any custom rules here if needed
  },
  overrides: [
    {
      files: ['**/*.js', '**/*.jsx'],
      rules: {
        // Ensure consistent React plugin usage
        'react/react-in-jsx-scope': 'off'
      }
    }
  ]
};
