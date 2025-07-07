const {createDefaultPreset} = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
    testEnvironment: "node",
    transform: {
        ...tsJestTransformCfg,
    },
    testMatch: ["<rootDir>/test/**/*.spec.ts"],
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.ts',
        ],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        },
    },
    coverageReporters: [
        ["text", { file: "coverage.txt" }]
    ]

};
