# Expression Parser

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
        '+': function(a, b) {
          return a + b;
        },
        '-': function(a, b) {
          return a - b;
        },
        '*': function(a, b) {
          return a * b;
        },
        '/': function(a, b) {
          return a / b;
        },
        ',': function(a, b) {
          return [a] + b;
        }
      },
      PREFIX_OPS: {
        'SQRT': function(expr) {
          return Math.sqrt(expr);
        },
        'POW': function(expr) {
          return Math.pow(expr[0], expr[1]);
        }
      },
      PRECEDENCE: [['SQRT', 'POW'], ['*', '/'], ['+', '-'], [',']],
      GROUP_OPEN: '(',
      GROUP_CLOSE: ')',
      SEPARATOR: ' ',
      SYMBOLS: ['(', ')', '+', '-', '*', '/', ','],

      termDelegate: function(term) {
        return parseInt(term);
      }
    };

and evaluated as:
    const expr = 'pow(1 + 1 * 2 - (10 / 2) + sqrt(16), 2)'.toUpperCase();
    const result = new ExpressionParser(arithmeticLanguage).evaluateExpression(expr);

(which will result in 4)

## Tokeniser

This uses the built-in tokeniser (which is very simple), but you can write your own tokeniser (e.g. for differentiating between prefix minus and infix minus) and pass the tokens into:

    const result = new ExpressionParser(arithmeticLanguage).evaluateTokens(['1', '+', '1']);

(which will also result in 2)

## RPN

This parser will also convert between an expression and a Reverse Polish Notation (RPN) list:

    const parser = new ExpressionParser();

    parser.expressionToRpn(expr); // returns RPN list
    parser.tokensToRpn(exprTokenList); // returns RPN list
    parser.rpnToExpression(rpnList); // returns expression string
    parser.rpnToTokens(rpnList); // returns expression token list

## Further configuration

The SEPARATOR and SYMBOLS options are to assist the built-in tokeniser and expression string builder. By default terms used to define operators are words, separated by the SEPARATOR character. Those in the SYMBOLS list are not affected by the SEPARATOR.

e.g. If '!' is in SYMBOLS, with space as the SEPARATOR, we can use "!A" instead of "! A"

The termDelegate option is used to evaluate the terminal symbols in the parse tree (i.e. the values).
