var ExpressionParser = (function() {
  var defaults = {
    // Example Boolean Condition Expression Language

    INFIX_OPS: {
      'AND': function(a, b) {
        return a && b;
      },
      'OR': function(a, b) {
        return a || b;
      }
    },
    PREFIX_OPS: {
      'NOT': function(expr) {
        return !expr;
      }
    },
    PRECEDENCE: [['NOT'], ['AND', 'OR']],
    GROUP_OPEN: '(',
    GROUP_CLOSE: ')',
    SEPARATOR: ' ',
    SYMBOLS: ['(', ')'],

    termDelegate: function(term) {
      if (term.toLowerCase() === 'true') {
        return true;
      } else {
        return false;
      }
    }
  };

  var isInArray = function(array, value) {
    var i, len;
    for (i = 0, len = array.length; i !== len; ++i) {
      if (array[i] === value) {
        return true;
      }
    }
    return false;
  };

  var Parser = function(options) {
    var key;
    this.options = options || {};
    this.options.OPS = {};

    for (key in defaults) {
      if (defaults.hasOwnProperty(key) && typeof(this.options[key]) === 'undefined') {
        this.options[key] = defaults[key];
      }
    }

    for (key in this.options.INFIX_OPS) {
      if (this.options.INFIX_OPS.hasOwnProperty(key)) {
        this.options.OPS[key] = this.options.INFIX_OPS[key];
      }
    }

    for (key in this.options.PREFIX_OPS) {
      if (this.options.PREFIX_OPS.hasOwnProperty(key)) {
        this.options.OPS[key] = this.options.PREFIX_OPS[key];
      }
    }
  };

  Parser.prototype.tokenize = function(expressionString) {
    var chars = expressionString.split('');
    var i, len, currChar, isSymbol;
    var tokens = [];
    var word = '';

    for (i = 0, len = chars.length; i <= len; ++i) {
      if (i === len) {
        currChar = 'EOF';
      } else {
        currChar = chars[i];
      }

      isSymbol = isInArray(this.options.SYMBOLS, currChar);
      if (isSymbol || currChar === this.options.SEPARATOR || currChar === 'EOF') {
        if (word !== '') {
          tokens.push(word);
          word = '';
        }
        if (isSymbol) {
          tokens.push(currChar);
        }
      } else {
        word += currChar;
      }
    }
    return tokens;
  };
  
  Parser.prototype.getTermExpression = function(term) {
    var termExpression;

    if (isInArray(this.options.SYMBOLS, term)) {
      termExpression = term;
    } else {
      if (this.options.INFIX_OPS[term]) {
        termExpression = this.options.SEPARATOR + term + this.options.SEPARATOR;
      } else {
        termExpression = term + this.options.SEPARATOR;
      }
    }

    return termExpression;
  };

  Parser.prototype.parseTerms = function(terms, asTokens) {
    var lhs, rhs, subExpression;
    var expression = '';
    var termExpression;

    var term = terms.pop();

    if (this.options.INFIX_OPS[term]) {
      rhs = this.parseTerms(terms, asTokens);
      lhs = this.parseTerms(terms, asTokens);
      if (asTokens) {
        expression = [this.options.GROUP_OPEN].concat(lhs).concat([term]).concat(rhs).concat([this.options.GROUP_CLOSE]);
      } else {
        expression = this.options.GROUP_OPEN + lhs + this.getTermExpression(term) + rhs + this.options.GROUP_CLOSE;
      }
    } else if (this.options.PREFIX_OPS[term]) {
      subExpression = this.parseTerms(terms, asTokens);
      if (asTokens) {
        expression = [term, this.options.GROUP_OPEN].concat(subExpression).concat([this.options.GROUP_CLOSE]);
      } else {
        expression = this.getTermExpression(term) + this.options.GROUP_OPEN + subExpression + this.options.GROUP_CLOSE;
      }
    } else {
      if (asTokens) {
        expression = [term];
      } else {
        expression = term;
      }
    }

    return expression;
  };

  Parser.prototype.getPrecedence = function(op) {
    var i, len;

    for (i = 0, len = this.options.PRECEDENCE.length; i !== len; ++i) {
      if (isInArray(this.options.PRECEDENCE[i], op)) {
        return i;
      }
    }
    return i;
  };

  Parser.prototype.tokensToRpn = function(expressionTokens) {
    var token, i, len, lastInStack, tokenPrecedence;
    var output = [];
    var stack = [];
    var isInfix, isPrefix;

    for (i = 0, len = expressionTokens.length; i !== len; ++i) {
      token = expressionTokens[i];

      isInfix = typeof(this.options.INFIX_OPS[token]) !== 'undefined';
      isPrefix = typeof(this.options.PREFIX_OPS[token]) !== 'undefined';
      if (isInfix || isPrefix) {
        tokenPrecedence = this.getPrecedence(token);
        lastInStack = stack[stack.length-1];
        while (
          (!!this.options.PREFIX_OPS[lastInStack] && this.getPrecedence(lastInStack) <  tokenPrecedence) ||
          (!!this.options.INFIX_OPS[lastInStack]  && this.getPrecedence(lastInStack) <= tokenPrecedence)
        ) {
          output.push(stack.pop());
          lastInStack = stack[stack.length-1];
        }
        stack.push(token);
      } else if (token === this.options.GROUP_OPEN) {
        stack.push(token);
      } else if (token === this.options.GROUP_CLOSE) {
        token = stack.pop();
        while (token !== this.options.GROUP_OPEN && typeof(token) !== 'undefined') {
          output.push(token);
          token = stack.pop();
        }

        if (typeof(token) === 'undefined') {
          throw "Mismatched Grouping";
        }
      } else {
        output.push(token);
      }
    }

    for (i = 0, len = stack.length; i !== len; ++i) {
      output.push(stack.pop());
    }

    return output;
  };
  
  Parser.prototype.expressionToRpn = function(expression) {
    var tokens = this.tokenize(expression);
    return this.tokensToRpn(tokens);
  };

  Parser.prototype.rpnToExpression = function(rpnStack) {
    return this.parseTerms(rpnStack);
  };

  Parser.prototype.rpnToTokens = function(rpnStack) {
    return this.parseTerms(rpnStack, true);
  };

  Parser.prototype.evaluateRPN = function(rpnStack) {
    var lhs, rhs, term, infixDelegate, prefixDelegate;
    
    term = rpnStack.pop();

    infixDelegate  = this.options.INFIX_OPS[term];
    prefixDelegate = this.options.PREFIX_OPS[term];

    if (infixDelegate) {
      rhs = this.evaluateRPN(rpnStack);
      lhs = this.evaluateRPN(rpnStack);
      return infixDelegate(lhs, rhs);
    } else if (prefixDelegate) {
      return prefixDelegate(this.evaluateRPN(rpnStack));
    } else {
      return this.options.termDelegate(term);
    }
  };

  Parser.prototype.evaluateTokens = function(tokens) {
    return this.evaluateRPN(this.tokensToRpn(tokens));
  };

  Parser.prototype.evaluateExpression = function(expression) {
    return this.evaluateRPN(this.expressionToRpn(expression));
  };

  return Parser;
})();

if (typeof(module) !== 'undefined') {
  module.exports = ExpressionParser;
}
