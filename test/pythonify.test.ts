import { readFile, writeFile } from 'fs/promises'
import { resolve } from 'path'
import { TSESLint } from '@typescript-eslint/utils'
import * as parser from '@typescript-eslint/parser'
import { describe, expect, it } from 'vitest'
import rule, { RULE_NAME } from '../src/rules/pythonify'

describe('pythonify', async () => {
  const code = await readFile(resolve('test/assets/bubble.ts'), 'utf-8')

  const linter = new TSESLint.Linter()
  linter.defineRule(RULE_NAME, rule)
  linter.defineParser('@typescript-eslint/parser', parser)

  it('works', () => {
    const result = linter.verifyAndFix(
      code,
      {
        rules: {
          pythonify: ['error', {
            gap: 20,
            squishy: true,
          }],
        },
        // parser: '@typescript-eslint/parser',
        parserOptions: {
          ecmaVersion: 'latest',
        },
      },
      { fix: true },
    )

    writeFile(resolve('test/assets/bubble.output.ts'), result.output)

    expect(result.output).toMatchInlineSnapshot(`
      "function bubbleSort(arr)                          {const
        n = arr.length                                  ;let
        i = 0                                           ;let
        j = 0                                           ;
        while (i < n)                                   {
          while (j < n - 1 - i)                         {
            if (arr[j] > arr[j + 1])                    {const
              temp = arr[j + 1]                         ;
              arr[j + 1] = arr[j]                       ;
              arr[j] = temp                             ;}
            j += 1                                      ;}
          i += 1                                        ;;;;}
        return arr                                      ;}
      "
    `)
  })
})
