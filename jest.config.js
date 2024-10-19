module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  setupFiles: ["dotenv/config"],
  testPathIgnorePatterns: ["/node_modules/", "/frontend/"],
  collectCoverage: true,
  coverageReporters: ["text", "html"],
  coverageDirectory: "<rootDir>/coverage/",
};
