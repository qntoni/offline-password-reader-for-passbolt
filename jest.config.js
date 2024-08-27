export default {
    transform: {
        "^.+\\.js$": "babel-jest"
    },
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.test.js"],
};
