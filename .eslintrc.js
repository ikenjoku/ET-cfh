module.exports = {
    "root": true,
  "extends": "airbnb-base",
  "env": {
    "node": true,
    "es6": true,
    "mocha": true,
    "jasmine": true
  },
<<<<<<< HEAD:.eslintrc.js
=======
  "parser": "babel-eslint",
  "parserOptions": {
    "sourceType": "module"
},
>>>>>>> Fixes(Hound and Eslint): Fixed linting error in controllers:.eslintrc
  "rules": {
    "one-var": 0,
    "import/extensions": 0,
    "one-var-declaration-per-line": 0,
    "new-cap": 0,
    "no-underscore-dangle":"off",
    "consistent-return": 0,
    "no-param-reassign": 0,
    "comma-dangle": 0,
    "curly": ["error", "multi-line"],
    "import/no-unresolved": [2, { commonjs: true }],
    "no-shadow": ["error", { "allow": ["req", "res", "err"] }],
    "valid-jsdoc": ["error", {
      "requireReturn": true,
      "requireReturnType": true,
      "requireParamDescription": false,
      "requireReturnDescription": true
    }],
    "require-jsdoc": ["error", {
        "require": {
            "FunctionDeclaration": true,
            "MethodDefinition": true,
            "ClassDeclaration": true
        }
    }]
  }
};
