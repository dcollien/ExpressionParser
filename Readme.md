# Expression Parser

Parse simple expressions, in a language of your own description, such as:

    (A AND B) OR NOT (C OR D)

or

    1 + 1 * 2 - (10 / 2) + SQRT 16


The latter language can be configured as follows:

    var arithmeticLanguage = {
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
        }
      },
      PREFIX_OPS: {
        'SQRT': function(expr) {
          return Math.sqrt(expr);
        }
      },
      PRECEDENCE: [['SQRT'], ['*', '/'], ['+', '-']],
      GROUP_OPEN: '(',
      GROUP_CLOSE: ')',
      SEPARATOR: ' ',
      SYMBOLS: ['(', ')', '+', '-', '*', '/'],

      termDelegate: function(term) {
        return parseInt(term);
      }
    };

and evaluated as:

    var result = new ExpressionParser(arithmeticLanguage).evaluateExpression('1 + 1 * 2 - (10 / 2) + SQRT 16');

(which will result in 2)

This uses the built-in tokeniser (which is very simple), but you can write your own tokeniser (e.g. for differentiating between prefix minus and infix minus) and pass the tokens into:

    var result = new ExpressionParser(arithmeticLanguage).evaluateTokens(['1', '+', '1']);

(which will also result in 2)

This parser will also convert between an expression and a Reverse Polish Notation (RPN) list:

    var parser = new ExpressionParser();

    parser.expressionToRpn(expr); // returns RPN list
    parser.tokensToRpn(exprTokenList); // returns RPN list
    parser.rpnToExpression(rpnList); // returns expression string
    parser.rpnToTokens(rpnList); // returns expression token list


The SEPARATOR and SYMBOLS options are to assist the built-in tokeniser and expression string builder. By default terms used to define operators are words, separated by the SEPARATOR character. Those in the SYMBOLS list are not affected by the SEPARATOR.

e.g. If '!' is in SYMBOLS, with space as the SEPARATOR, we can use "!A" instead of "! A"

The termDelegate option is used to evaluate the terminal symbols in the parse tree (i.e. the values).

