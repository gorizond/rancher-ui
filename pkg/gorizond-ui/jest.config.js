module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'ts', 'json', 'vue'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }],
    '^.+\\.vue$': 'vue-jest',
    '^.+\\.js$': ['babel-jest', {
      presets: ['@babel/preset-env']
    }]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
    '^@rancher/auto-import$': '<rootDir>/tests/mocks/auto-import.js',
    '^@shell/core/types$': '<rootDir>/tests/mocks/shell-core-types.js',
    '^@shell/config/table-headers$': '<rootDir>/tests/mocks/table-headers.js',
    '^@shell/pages/c/_cluster/_product/_resource/index.vue$': '<rootDir>/tests/mocks/ListResource.vue',
    '^@shell/pages/c/_cluster/_product/_resource/create.vue$': '<rootDir>/tests/mocks/CreateResource.vue',
    '^@shell/pages/c/_cluster/_product/_resource/_id.vue$': '<rootDir>/tests/mocks/ViewResource.vue',
    '^@shell/pages/c/_cluster/_product/_resource/_namespace/_id.vue$': '<rootDir>/tests/mocks/ViewNamespacedResource.vue',
    '^@shell/components/(.*)$': '<rootDir>/tests/mocks/shell-components.js',
    '^@components/Banner$': '<rootDir>/tests/mocks/Banner.vue',
    '^@components/Card$': '<rootDir>/tests/mocks/Card.vue',
    '^@components/Form/LabeledInput$': '<rootDir>/tests/mocks/Form/LabeledInput.vue',
    '^@components/Form/LabeledSelect$': '<rootDir>/tests/mocks/Form/LabeledSelect.vue'
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.(js|ts|vue)',
    '<rootDir>/tests/**/*.spec.(js|ts|vue)'
  ],
  collectCoverageFrom: [
    'utils/**/*.{js,ts}',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/*.vue'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@vue|vue-jest)/)'
  ]
};
