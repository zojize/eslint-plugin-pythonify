import type { ESLintUtils } from '@typescript-eslint/utils'
import { id } from './utils'

export const createEslintRule = id as ReturnType<typeof ESLintUtils.RuleCreator>
