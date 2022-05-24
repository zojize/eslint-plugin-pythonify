import type { TSESTree } from '@typescript-eslint/utils'

export type NodeOrToken = TSESTree.Node | TSESTree.Token

export const isSemi = (token: TSESTree.Token): token is TSESTree.PunctuatorToken =>
  token.value === ';' && token.type === 'Punctuator'

export const trim
= (s: string) => s
  .replace(/(const|var|let)\s*/, '')
  .replace(/([\s;\{\}])+$/, '')
  .trimEnd()

export const sameLine = (a: NodeOrToken | null, b: NodeOrToken | null) =>
  a && b && a.loc.start.line === b.loc.start.line

export const isPunctuator = (token?: TSESTree.Token | null): token is TSESTree.PunctuatorToken =>
  !!token && token.type === 'Punctuator'

export const isBracketOrSemi = (token?: TSESTree.Token | null): token is TSESTree.PunctuatorToken =>
  isPunctuator(token) && (token.value === ';' || token.value === '{' || token.value === '}')

export const isDeclarationKeyword = (token?: TSESTree.Token | null): token is TSESTree.KeywordToken =>
  !!token && token.type === 'Keyword' && (token.value === 'const' || token.value === 'let' || token.value === 'var')

export const id: <T>(x: T) => T = x => x
