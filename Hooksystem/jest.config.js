module.exports = {
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?)$",
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  moduleFileExtensions: ["js", "jsx", "json", "node"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
  ],
  coverageReporters: ["text-summary", "html"],
  setupFilesAfterEnv: ["jest-extended"],
  transformIgnorePatterns: [],
};
