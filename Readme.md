# Expression Parser

A no-dependency, easy-to-extend interpreter for parsing and evaluating expressions.

This project is just a single file, aiming to be easy to understand, extend, and build upon.

## Install

`npm install expressionparser`

## Built-in Languages

A built-in language called ["formula"](src/languages/formula.md) is provided as the default.

Evaluating an expression:

    import { init, formula } from 'expressionparser'

    const parser = init(formula, (term: string) => {
      if (term === "MY_VARIABLE") {
        return 42;
      } else {
        throw new Error(`Invalid term: ${term}`);
      }
    });

    parser.expressionToValue("(1 + 1) + 40 = MY_VARIABLE"); // true

## Custom Language

Parse simple expressions, in a language of your own description, such as:

    (A AND B) OR NOT (C OR D)

or

    1 + 1 * 2 - (10 / 2) + SQRT 16

The latter language can be configured as follows:

    const arithmeticLanguage = {
      INFIX_OPS: {
        '+': function(args) {
          const [a, b] = args();
          return a() + b();
        },
        '-': function(args) {
          const [a, b] = args();
          return a() - b();
        },
        '*': function(args) {
          const [a, b] = args();
          return a() * b();
        },
        '/': function(args) {
          const [a, b] = args();
          return a() / b();
        },
        ',': function(args) {
          const [a, b] = args();
          return [a()] + b();
        }
      },
      PREFIX_OPS: {
        'SQRT': function(arg) {
          const val = arg()
          return Math.sqrt(val);
        },
        'POW': function(args) {
          const [a, b] = args();
          return Math.pow(a(), b());
        }
      },
      PRECEDENCE: [['SQRT', 'POW'], ['*', '/'], ['+', '-'], [',']],
      GROUP_OPEN: '(',
      GROUP_CLOSE: ')',
      SEPARATORS: [','],
      WHITESPACE_CHARS: [" "],
      SYMBOLS: ['(', ')', '+', '-', '*', '/', ','],

      termDelegate: function(term) {
        return parseInt(term);
      }
    };

and evaluated as:
const expr = 'pow(1 + 1 \* 2 - (10 / 2) + sqrt(16), 2)'.toUpperCase();
const result = new ExpressionParser(arithmeticLanguage).expressionToValue(expr);

(which will result in 4)

Note: the `unpackArgs` helper function can be used to avoid doing `const [a, b] = args();` in every function. This also checks for the correct number of arguments. See the implementation in ["formula.ts"](src/languages/formula.ts).

e.g.

    const arithmeticLanguage = {
      INFIX_OPS: {
        '+': unpackArgs(function(a, b) {
          return a() + b();
        }),
        // ...etc.
      }
    }

## Tokeniser

This uses the built-in tokeniser (which is very simple), but you can write your own tokeniser and pass the tokens into:

    const result = new ExpressionParser(arithmeticLanguage).evaluateTokens(['1', '+', '1']);

(which will also result in 2)

If you get fancy, you can specify `INFIX_OPS` and `PREFIX_OPS` as functions (of key to value) instead of objects.

## RPN

This parser will also convert between an expression and a Reverse Polish Notation (RPN) list:

    const parser = new ExpressionParser();

    parser.expressionToRpn(expr); // returns RPN list
    parser.tokensToRpn(exprTokenList); // returns RPN list
    parser.rpnToExpression(rpnList); // returns expression string
    parser.rpnToTokens(rpnList); // returns expression token list

## Further configuration

The `SEPARATORS`, `WHITESPACE_CHARS`, and `SYMBOLS` options are to assist the built-in tokeniser and expression string builder.

There are 3 types of token:

- By default tokens are made up of any contiguous string of characters separated by any member of `WHITESPACE_CHARS`.
- Characters in `SYMBOLS` will be collected as a separate category to other characters, so they can exist adjacent to other characters but be separated into another token.
- `SEPARATORS` are put into a single-character token of their own.

e.g. assuming ' ' in `WHITESPACE_CHARS`:

- If there are no `SYMBOLS` or `SEPARATORS`: `"!! A"` will be tokenized as `["!!", "A"]`, but `"!!A"` will be tokenized as `["!!A"]`
- If '!' is in `SYMBOLS`: `"!! A"` and `"!!A"` will both be tokenized as `["!!", "A"]`
- If '!' is instead in `SEPARATORS`: `"!! A"` and `"!!A"` will both be tokenized as `["!", "!", "A"]`

The `termDelegate` option is used to evaluate the terminal symbols in the parse tree (i.e. the values).
