const isInArray = <T>(array: T[], value: T) => {
  let i, len;
  for (i = 0, len = array.length; i !== len; ++i) {
    if (array[i] === value) {
      return true;
    }
  }
  return false;
};

const mapValues =
  <A, B>(mapper: (val: A) => B) =>
  (obj: { [key: string]: A }): { [key: string]: B } => {
    const result: { [key: string]: B } = {};
    Object.keys(obj).forEach((key) => {
      result[key] = mapper(obj[key]);
    });

    return result;
  };

const applyToValues =
  <T>(delegate: (val: T) => T) =>
  (obj: { [key: string]: T }) => {
    Object.keys(obj).forEach((key) => {
      obj[key] = delegate(obj[key]);
    });
  };

const convertKeys =
  <T>(converter: (key: string) => string) =>
  (obj: { [key: string]: T }) => {
    const newKeys = Object.keys(obj)
      .map((key) => (obj.hasOwnProperty(key) ? [key, converter(key)] : null))
      .filter((val) => val != null);

    newKeys.forEach(([oldKey, newKey]) => {
      if (oldKey !== newKey) {
        obj[newKey] = obj[oldKey];
        delete obj[oldKey];
      }
    });

    return obj;
  };

export interface ExpressionArray<T> extends Array<T> {
  isArgumentsArray?: boolean;
}

export interface ArgumentsArray extends ExpressionArray<ExpressionThunk> {
  isArgumentsArray: true;
}

export const isArgumentsArray = (
  args: ExpressionValue
): args is ArgumentsArray => Array.isArray(args) && args.isArgumentsArray;

export type ValuePrimitive = number | boolean | string;
export type Delegate = (...args: ExpressionValue[]) => ExpressionValue;
export type ExpressionFunction = Delegate;
export interface ExpressionObject {
  [key: string]: ExpressionValue;
}
export type ExpressionValue =
  | ValuePrimitive
  | ArgumentsArray
  | ExpressionArray<ExpressionValue>
  | ExpressionObject
  | ExpressionThunk
  | ExpressionFunction;
export type ExpressionThunk = () => ExpressionValue;
export type TermDelegate = (term: string) => ExpressionValue;
export type TermType =
  | "number"
  | "boolean"
  | "string"
  | "function"
  | "array"
  | "object"
  | "unknown";
export type TermTyper = (term: string) => TermType;

type Infixer<T> = (token: string, lhs: T, rhs: T) => T;
type Prefixer<T> = (token: string, rhs: T) => T;
type Terminator<T> = (
  token: string,
  terms?: Record<string, ExpressionValue>
) => T;

function isBasicDataObject(obj: any): obj is Record<string, ExpressionValue> {
  if (obj === null || typeof obj !== "object") return false;

  const proto = Object.getPrototypeOf(obj);

  // If the prototype is not Object.prototype, it's not a plain object
  if (proto !== Object.prototype) return false;

  // Optional: check the prototype doesn't have custom methods
  const methodNames = Object.getOwnPropertyNames(proto).filter(
    (key) => typeof (proto as any)[key] === "function" && key !== "constructor"
  );

  return methodNames.length === 0;
}

const thunkEvaluator = (val: ExpressionValue) => evaluate(val);
const objEvaluator = mapValues<ExpressionValue, ExpressionValue>(
  thunkEvaluator
);
const classObjEvaluator = (val: { [key: string]: ExpressionValue }) => {
  applyToValues<ExpressionValue>(thunkEvaluator)(val);
  return val;
};

const evaluate = (
  thunkExpression: ExpressionThunk | ExpressionValue
): ExpressionValue => {
  if (typeof thunkExpression === "function" && thunkExpression.length === 0) {
    return evaluate(thunkExpression());
  } else if (isArgumentsArray(thunkExpression)) {
    return thunkExpression.map((val) => evaluate(val()));
  } else if (Array.isArray(thunkExpression)) {
    return thunkExpression.map(thunkEvaluator);
  } else if (isBasicDataObject(thunkExpression)) {
    return objEvaluator(thunkExpression);
  } else if (typeof thunkExpression === "object") {
    return classObjEvaluator(thunkExpression);
  } else {
    return thunkExpression;
  }
};

const thunk =
  (delegate: Delegate, ...args: ExpressionValue[]) =>
  () =>
    delegate(...args);

export type PrefixOp = (expr: ExpressionThunk) => ExpressionValue;

export interface PrefixOps {
  [op: string]: PrefixOp;
}

export type PrefixOpLookupFn = (op: string) => PrefixOp | undefined;

export type InfixOp = (
  a: ExpressionThunk,
  b: ExpressionThunk
) => ExpressionValue;

export interface InfixOps {
  [op: string]: InfixOp;
}

export type InfixOpLookupFn = (op: string) => InfixOp | undefined;

export interface Description {
  op: string;
  fix: "infix" | "prefix" | "surround";
  sig: string[];
  text: string;
}

interface ExpressionParserOptionsBase {
  AMBIGUOUS: {
    [op: string]: string;
  };
  PREFIX_OPS: PrefixOps | PrefixOpLookupFn;
  INFIX_OPS: InfixOps | InfixOpLookupFn;
  ESCAPE_CHAR: string;
  LITERAL_OPEN: string;
  LITERAL_CLOSE: string;
  GROUP_OPEN: string;
  GROUP_CLOSE: string;
  SYMBOLS: string[];
  PRECEDENCE: string[][];
  termDelegate: TermDelegate;
  termTyper?: TermTyper;
  SURROUNDING?: {
    [token: string]: {
      OPEN: string;
      CLOSE: string;
    };
  };

  isCaseInsensitive?: boolean;
  descriptions?: Description[];
}

interface ExpressionParserOptionsLegacy extends ExpressionParserOptionsBase {
  SEPARATOR: string;
}
interface ExpressionParserOptionsAmmended extends ExpressionParserOptionsBase {
  SEPARATORS: string[];
  WHITESPACE_CHARS: string[];
}

const isOptionsLegacy = (
  options: any
): options is ExpressionParserOptionsLegacy => {
  return options.hasOwnProperty("SEPARATOR");
};

const isOptionsAmmended = (
  options: any
): options is ExpressionParserOptionsAmmended => {
  return options.hasOwnProperty("SEPARATORS");
};

export type ExpressionParserOptions =
  | ExpressionParserOptionsLegacy
  | ExpressionParserOptionsAmmended;

class ExpressionParser {
  options: ExpressionParserOptions;
  surroundingOpen: {
    [token: string]: boolean;
  };
  surroundingClose: {
    [token: string]: {
      OPEN: string;
      ALIAS: string;
    };
  };
  symbols: {
    [token: string]: string;
  };
  LIT_CLOSE_REGEX?: RegExp;
  LIT_OPEN_REGEX?: RegExp;

  constructor(options: ExpressionParserOptions) {
    this.options = options;
    this.surroundingOpen = {};
    this.surroundingClose = {};

    if (this.options.SURROUNDING) {
      Object.keys(this.options.SURROUNDING).forEach((key) => {
        const item = this.options.SURROUNDING[key];

        let open = item.OPEN;
        let close = item.CLOSE;
        if (this.options.isCaseInsensitive) {
          key = key.toUpperCase();
          open = open.toUpperCase();
          close = close.toUpperCase();
        }

        this.surroundingOpen[open] = true;
        this.surroundingClose[close] = {
          OPEN: open,
          ALIAS: key,
        };
      });
    }

    if (this.options.isCaseInsensitive) {
      // convert all terms to uppercase
      const upperCaser = (key: string) => key.toUpperCase();
      const upperCaseKeys = convertKeys(upperCaser);
      const upperCaseVals = mapValues(upperCaser);

      if (!(this.options.PREFIX_OPS instanceof Function)) {
        upperCaseKeys(this.options.PREFIX_OPS);
      }

      if (!(this.options.INFIX_OPS instanceof Function)) {
        upperCaseKeys(this.options.INFIX_OPS);
      }

      upperCaseKeys(this.options.AMBIGUOUS);
      upperCaseVals(this.options.AMBIGUOUS);
      this.options.PRECEDENCE = this.options.PRECEDENCE.map((arr) =>
        arr.map((val) => val.toUpperCase())
      );
    }

    if (this.options.LITERAL_OPEN) {
      this.LIT_CLOSE_REGEX = new RegExp(`${this.options.LITERAL_OPEN}\$`);
    }

    if (this.options.LITERAL_CLOSE) {
      this.LIT_OPEN_REGEX = new RegExp(`^${this.options.LITERAL_CLOSE}`);
    }

    this.symbols = {};
    this.options.SYMBOLS.forEach((symbol) => {
      this.symbols[symbol] = symbol;
    });
  }

  resolveCase(key: string) {
    return this.options.isCaseInsensitive ? key.toUpperCase() : key;
  }

  resolveAmbiguity(token: string) {
    return this.options.AMBIGUOUS[this.resolveCase(token)];
  }

  isSymbol(char: string) {
    return this.symbols[char] === char;
  }

  getPrefixOp(op: string) {
    if (this.options.termTyper && this.options.termTyper(op) === "function") {
      const termValue = this.options.termDelegate(op);

      if (typeof termValue !== "function") {
        throw new Error(`${op} is not a function.`);
      }
      const result: (...args: any) => ExpressionValue = termValue;

      return (argsThunk: ExpressionThunk | ExpressionValue) => {
        const args = evaluate(argsThunk);
        if (!Array.isArray(args)) {
          return () => result(args);
        } else {
          return () => result(...args);
        }
      };
    }

    if (this.options.PREFIX_OPS instanceof Function) {
      return this.options.PREFIX_OPS(op);
    } else {
      return this.options.PREFIX_OPS[this.resolveCase(op)];
    }
  }

  getInfixOp(op: string) {
    if (this.options.INFIX_OPS instanceof Function) {
      return this.options.INFIX_OPS(op);
    } else {
      return this.options.INFIX_OPS[this.resolveCase(op)];
    }
  }

  getPrecedence(op: string) {
    let i, len, casedOp;

    if (this.options.termTyper && this.options.termTyper(op) === "function") {
      return 0;
    }

    casedOp = this.resolveCase(op);

    for (i = 0, len = this.options.PRECEDENCE.length; i !== len; ++i) {
      if (isInArray(this.options.PRECEDENCE[i], casedOp)) {
        return i;
      }
    }
    return i;
  }

  isSeparator(char: string) {
    const options = this.options;

    let isSep = false;

    if (this.isWhitespace(char)) {
      isSep = true;
    } else if (isOptionsAmmended(options)) {
      isSep = options.SEPARATORS.includes(char);
    }

    return isSep;
  }

  isWhitespace(char: string) {
    const options = this.options;

    let isSpace = false;

    if (isOptionsAmmended(options)) {
      isSpace = options.WHITESPACE_CHARS.includes(char);
    } else {
      isSpace = char === options.SEPARATOR;
    }

    return isSpace;
  }

  defaultWhitespaceSeparator() {
    if (isOptionsLegacy(this.options)) {
      return this.options.SEPARATOR;
    } else {
      return this.options.WHITESPACE_CHARS[0];
    }
  }

  tokenize(expression: string) {
    let token = "";

    const EOF = 0;

    const tokens = [];

    const state = {
      startedWithSep: true,
      scanningLiteral: false,
      scanningSymbols: false,
      escaping: false,
    };

    const endWord = (endedWithSep: boolean) => {
      if (token !== "") {
        const disambiguated = this.resolveAmbiguity(token);
        if (disambiguated && state.startedWithSep && !endedWithSep) {
          // ambiguous operator is nestled with the RHS
          // treat it as a prefix operator
          tokens.push(disambiguated);
        } else {
          // TODO: break apart joined surroundingOpen/Close
          tokens.push(token);
        }
        token = "";
        state.startedWithSep = false;
      }
    };

    const chars = expression.split("");
    let currChar: string | typeof EOF;
    let i, len;
    for (i = 0, len = chars.length; i <= len; ++i) {
      if (i === len) {
        currChar = EOF;
      } else {
        currChar = chars[i];
      }

      if (currChar === this.options.ESCAPE_CHAR && !state.escaping) {
        state.escaping = true;
        continue;
      } else if (state.escaping) {
        token += currChar;
      } else if (
        currChar === this.options.LITERAL_OPEN &&
        !state.scanningLiteral
      ) {
        state.scanningLiteral = true;
        endWord(false);
      } else if (currChar === this.options.LITERAL_CLOSE) {
        state.scanningLiteral = false;
        tokens.push(
          this.options.LITERAL_OPEN + token + this.options.LITERAL_CLOSE
        );
        token = "";
      } else if (currChar === EOF) {
        endWord(true);
      } else if (state.scanningLiteral) {
        token += currChar;
      } else if (this.isSeparator(currChar)) {
        endWord(true);
        state.startedWithSep = true;

        if (!this.isWhitespace(currChar)) {
          tokens.push(currChar);
        }
      } else if (
        currChar === this.options.GROUP_OPEN ||
        currChar === this.options.GROUP_CLOSE
      ) {
        endWord(currChar === this.options.GROUP_CLOSE);
        state.startedWithSep = currChar === this.options.GROUP_OPEN;
        tokens.push(currChar);
      } else if (
        currChar in this.surroundingOpen ||
        currChar in this.surroundingClose
      ) {
        endWord(currChar in this.surroundingClose);
        state.startedWithSep = currChar in this.surroundingOpen;
        tokens.push(currChar);
      } else if (
        (this.isSymbol(currChar) && !state.scanningSymbols) ||
        (!this.isSymbol(currChar) && state.scanningSymbols)
      ) {
        endWord(false);
        token += currChar;
        state.scanningSymbols = !state.scanningSymbols;
      } else {
        token += currChar;
      }

      state.escaping = false;
    }

    return tokens;
  }

  tokensToRpn(tokens: string[]) {
    let token;
    let i, len;
    let isInfix, isPrefix, surroundingToken, lastInStack, tokenPrecedence;

    const output = [];
    const stack = [];
    const grouping = [];

    for (i = 0, len = tokens.length; i !== len; ++i) {
      token = tokens[i];

      isInfix = typeof this.getInfixOp(token) !== "undefined";
      isPrefix = typeof this.getPrefixOp(token) !== "undefined";

      if (isInfix || isPrefix) {
        tokenPrecedence = this.getPrecedence(token);
        lastInStack = stack[stack.length - 1];

        while (
          lastInStack &&
          ((!!this.getPrefixOp(lastInStack) &&
            this.getPrecedence(lastInStack) < tokenPrecedence) ||
            (!!this.getInfixOp(lastInStack) &&
              this.getPrecedence(lastInStack) <= tokenPrecedence))
        ) {
          output.push(stack.pop());
          lastInStack = stack[stack.length - 1];
        }
        stack.push(token);
      } else if (this.surroundingOpen[token]) {
        stack.push(token);
        grouping.push(token);
      } else if (this.surroundingClose[token]) {
        surroundingToken = this.surroundingClose[token];

        if (grouping.pop() !== surroundingToken.OPEN) {
          throw new Error(
            `Mismatched Grouping (unexpected closing "${token}")`
          );
        }

        token = stack.pop();
        while (
          token !== surroundingToken.OPEN &&
          typeof token !== "undefined"
        ) {
          output.push(token);
          token = stack.pop();
        }

        if (typeof token === "undefined") {
          throw new Error("Mismatched Grouping");
        }

        stack.push(surroundingToken.ALIAS);
      } else if (token === this.options.GROUP_OPEN) {
        stack.push(token);
        grouping.push(token);
      } else if (token === this.options.GROUP_CLOSE) {
        if (grouping.pop() !== this.options.GROUP_OPEN) {
          throw new Error(
            `Mismatched Grouping (unexpected closing "${token}")`
          );
        }

        token = stack.pop();
        while (
          token !== this.options.GROUP_OPEN &&
          typeof token !== "undefined"
        ) {
          output.push(token);
          token = stack.pop();
        }

        if (typeof token === "undefined") {
          throw new Error("Mismatched Grouping");
        }
      } else {
        output.push(token);
      }
    }

    for (i = 0, len = stack.length; i !== len; ++i) {
      token = stack.pop();
      surroundingToken = this.surroundingClose[token];

      if (surroundingToken && grouping.pop() !== surroundingToken.OPEN) {
        throw new Error(`Mismatched Grouping (unexpected closing "${token}")`);
      } else if (
        token === this.options.GROUP_CLOSE &&
        grouping.pop() !== this.options.GROUP_OPEN
      ) {
        throw new Error(`Mismatched Grouping (unexpected closing "${token}")`);
      }

      output.push(token);
    }

    if (grouping.length !== 0) {
      throw new Error(`Mismatched Grouping (unexpected "${grouping.pop()}")`);
    }

    return output;
  }

  evaluateRpn<T>(
    stack: string[],
    infixer: Infixer<T>,
    prefixer: Prefixer<T>,
    terminator: Terminator<T>,
    terms?: Record<string, ExpressionValue>
  ): T {
    let lhs, rhs;

    const token = stack.pop();

    if (typeof token === "undefined") {
      throw new Error("Parse Error: unexpected EOF");
    }

    const infixDelegate = this.getInfixOp(token);
    const prefixDelegate = this.getPrefixOp(token);

    const isInfix = infixDelegate && stack.length > 1;
    const isPrefix = prefixDelegate && stack.length > 0;

    if (isInfix || isPrefix) {
      rhs = this.evaluateRpn<T>(stack, infixer, prefixer, terminator, terms);
    }

    if (isInfix) {
      lhs = this.evaluateRpn<T>(stack, infixer, prefixer, terminator, terms);
      return infixer(token, lhs, rhs);
    } else if (isPrefix) {
      return prefixer(token, rhs);
    } else {
      return terminator(token, terms);
    }
  }

  rpnToExpression(stack: string[]) {
    const infixExpr: Infixer<string> = (term, lhs, rhs) =>
      this.options.GROUP_OPEN +
      lhs +
      this.defaultWhitespaceSeparator() +
      term +
      this.defaultWhitespaceSeparator() +
      rhs +
      this.options.GROUP_CLOSE;
    const prefixExpr: Prefixer<string> = (term, rhs) =>
      (this.isSymbol(term) ? term : term + this.defaultWhitespaceSeparator()) +
      this.options.GROUP_OPEN +
      rhs +
      this.options.GROUP_CLOSE;
    const termExpr: Terminator<string> = (term) => term;

    return this.evaluateRpn(stack, infixExpr, prefixExpr, termExpr);
  }

  rpnToTokens(stack: string[]) {
    const infixExpr: Infixer<string[]> = (term, lhs, rhs) =>
      [this.options.GROUP_OPEN]
        .concat(lhs)
        .concat([term])
        .concat(rhs)
        .concat([this.options.GROUP_CLOSE]);
    const prefixExpr: Prefixer<string[]> = (term, rhs) =>
      [term, this.options.GROUP_OPEN]
        .concat(rhs)
        .concat([this.options.GROUP_CLOSE]);
    const termExpr: Terminator<string[]> = (term) => [term];

    return this.evaluateRpn(stack, infixExpr, prefixExpr, termExpr);
  }

  rpnToThunk(stack: string[], terms?: Record<string, ExpressionValue>) {
    const infixExpr: Infixer<ExpressionThunk> = (term, lhs, rhs) =>
      thunk(this.getInfixOp(term), lhs, rhs);
    const prefixExpr: Prefixer<ExpressionThunk> = (term, rhs) =>
      thunk(this.getPrefixOp(term), rhs);
    const termExpr: Terminator<ExpressionThunk> = (term, terms) => {
      if (
        this.options.LITERAL_OPEN &&
        term.startsWith(this.options.LITERAL_OPEN)
      ) {
        // Literal string
        return () =>
          term
            .replace(this.LIT_OPEN_REGEX, "")
            .replace(this.LIT_CLOSE_REGEX, "");
      } else {
        return terms && term in terms
          ? () => terms[term]
          : thunk(this.options.termDelegate, term);
      }
    };

    return this.evaluateRpn(stack, infixExpr, prefixExpr, termExpr, terms);
  }

  rpnToValue(
    stack: string[],
    terms?: Record<string, ExpressionValue>
  ): ExpressionValue {
    return evaluate(this.rpnToThunk(stack, terms));
  }

  thunkToValue(thunk: ExpressionThunk) {
    return evaluate(thunk);
  }

  expressionToRpn(expression: string) {
    return this.tokensToRpn(this.tokenize(expression));
  }

  expressionToThunk(
    expression: string,
    terms?: Record<string, ExpressionValue>
  ) {
    return this.rpnToThunk(this.expressionToRpn(expression), terms);
  }

  expressionToValue(
    expression: string,
    terms?: Record<string, ExpressionValue>
  ) {
    return this.rpnToValue(this.expressionToRpn(expression), terms);
  }

  tokensToValue(tokens: string[]) {
    return this.rpnToValue(this.tokensToRpn(tokens));
  }

  tokensToThunk(tokens: string[]) {
    return this.rpnToThunk(this.tokensToRpn(tokens));
  }
}

export default ExpressionParser;
