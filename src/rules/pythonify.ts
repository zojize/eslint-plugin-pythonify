import type { RuleFixer } from '@typescript-eslint/utils/dist/ts-eslint'
import type { TSESTree } from '@typescript-eslint/utils/dist/ts-estree'
import { createEslintRule } from '../createRule'
import { isBracketOrSemi, isDeclarationKeyword, isSemi, sameLine, trim } from '../utils'

export const RULE_NAME = 'pythonify'
export type MessageIds
  = 'semiTooClose'
  | 'bracketTooClose'
  | 'noDeclaration'

export interface PythonifyOptions {
  gap: number
}

export default createEslintRule<[PythonifyOptions], MessageIds>(
  {
    name: RULE_NAME,
    meta: {
      type: 'problem',
      docs: {
        description: 'todo',
        recommended: 'error',
      },
      schema: [],
      messages: {
        semiTooClose: 'I don\'t wanna see these semicolons!',
        bracketTooClose: 'I don\'t wanna see these brackets!',
        noDeclaration: 'Eww, {{ kind }} keyword!',
      },
      fixable: 'code',
    },
    defaultOptions: [{
      gap: 20,
    }],
    create(context) {
      const defaultOptions = this.defaultOptions[0]

      const {
        gap = defaultOptions.gap,
      } = context.options[0]
        ?? defaultOptions

      const sourceCode = context.getSourceCode()
      const maxColNo = sourceCode.lines.reduce((max, line) => Math.max(max, trim(line).length), 0)
      const targetCol = maxColNo + gap

      const squish = (fixer: RuleFixer, token: TSESTree.Token) => {
        const tokenBefore = sourceCode.getTokenBefore(token)

        if (!tokenBefore || !token)
          return []

        if ([
          !(isBracketOrSemi(tokenBefore) || isDeclarationKeyword(tokenBefore)),
          tokenBefore.range[1] === token.range[0],
          token.loc.start.line - tokenBefore.loc.end.line > 1,
        ].includes(true))
          return []

        return [fixer.removeRange([tokenBefore.range[1], token.range[0]])]
      }

      const pushSemi = (node: TSESTree.Node) => {
        const token = sourceCode.getLastToken(node)!
        const tokenBefore = sourceCode.getTokenBefore(token)

        if (
          sourceCode.isSpaceBetween!(token, sourceCode.getTokenBefore(token)!)
          && token.loc.start.column >= targetCol
          && !isBracketOrSemi(tokenBefore)
        )
          return

        if (isSemi(token)) {
          context.report({
            node: token,
            messageId: 'semiTooClose',
            *fix(fixer) {
              const gapNo = targetCol - token.loc.start.column

              let pad = true
              const fixes = squish(fixer, token)
              if (fixes.length) {
                pad = false
                yield* fixes
              }
              if (pad && gapNo > 0)
                yield fixer.insertTextBefore(token, ' '.repeat(gapNo))
            },
          })
        }
      }

      const pushBrackets = (node: TSESTree.BlockStatement | TSESTree.ClassBody) => {
        const bracketBegin = sourceCode.getFirstToken(node) as TSESTree.PunctuatorToken
        const bracketEnd = sourceCode.getLastToken(node) as TSESTree.PunctuatorToken

        ;[bracketBegin, bracketEnd].forEach(token => {
          if (
            sourceCode.isSpaceBetween!(token, sourceCode.getTokenBefore(token)!)
            && token.loc.start.column >= targetCol
          )
            return

          context.report({
            node: token,
            messageId: 'bracketTooClose',
            *fix(fixer) {
              const gapNo = targetCol - token.loc.start.column

              let pad = true
              const fixes = squish(fixer, token)
              if (fixes.length) {
                pad = false
                yield* fixes
              }
              if (pad && gapNo > 0)
                yield fixer.insertTextBefore(token, ' '.repeat(gapNo))
            },
          })
        })
      }

      const pushDeclarationKeyword = (node: TSESTree.VariableDeclaration) => {
        const keyword = sourceCode.getFirstToken(node)!

        const tokenBefore = sourceCode.getTokenBefore(keyword)
        const tokenAfter = sourceCode.getTokenAfter(keyword)!
        const isSameLine = sameLine(keyword, tokenAfter)

        if (!isSameLine)
          return

        if (
          tokenBefore
          && sourceCode.isSpaceBetween!(keyword, tokenBefore)
          && keyword.loc.start.column >= targetCol
          && !isBracketOrSemi(tokenBefore)
        )
          return

        context.report({
          node: keyword,
          messageId: 'noDeclaration',
          data: { kind: keyword.value },
          *fix(fixer) {
            if (isSameLine) {
              const tab = keyword.loc.start.column
              yield fixer.insertTextAfter(keyword, `\n${tab > 0 ? ' '.repeat(tab) : ''}`)
              yield fixer.removeRange([tokenAfter.range[0] - 1, tokenAfter.range[0]])
            }

            if (keyword.loc.start.column < targetCol) {
              if (isBracketOrSemi(tokenBefore))
                yield* squish(fixer, keyword)
              else
                yield fixer.insertTextBefore(keyword, ' '.repeat(targetCol - keyword.loc.start.column))
            }
          },
        })
      }

      return {
        ExpressionStatement: pushSemi,
        VariableDeclaration: node => {
          pushDeclarationKeyword(node)
          pushSemi(node)
        },
        ReturnStatement: pushSemi,
        EmptyStatement: pushSemi,
        BlockStatement: pushBrackets,
        ClassBody: pushBrackets,
      }
    },
  },
)
