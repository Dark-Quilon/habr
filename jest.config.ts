import type { Config } from 'jest'
import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const require = createRequire(import.meta.url)
const nextJest = require('./frontend/node_modules/next/jest.js')

const createJestConfig = nextJest({ dir: path.join(__dirname, 'frontend') })

const config: Config = {
  testEnvironment: path.join(__dirname, 'frontend/node_modules/jest-environment-jsdom'),
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/frontend/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  collectCoverageFrom: ['frontend/src/components/**/*.{ts,tsx}'],
  modulePaths: [path.join(__dirname, 'frontend/node_modules')],
}

export default createJestConfig(config)
