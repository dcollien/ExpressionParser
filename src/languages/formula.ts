import {
  Delegate,
  ExpressionThunk,
  TermDelegate,
  InfixOps,
  ExpressionValue,
  ExpressionArray,
  isArgumentsArray,
  ArgumentsArray,
} from "../ExpressionParser";

export interface FunctionOps {
  [op: string]: (...args: ExpressionThunk[]) => ExpressionValue;
}

const unpackArgs = (f: Delegate) => (expr: ExpressionThunk) => {
  const result = expr();

  if (!isArgumentsArray(result)) {
    if (f.length > 1) {
      throw new Error(
        `Too few arguments. Expected ${f.length}, found 1 (${JSON.stringify(
          result
        )})`
      );
    }
    return f(() => result);
  } else if (result.length === f.length || f.length === 0) {
    return f.apply(null, result);
  } else {
    throw new Error(`Incorrect number of arguments. Expected ${f.length}`);
  }
};

const num = (result: ExpressionValue) => {
  if (typeof result !== "number") {
    throw new Error(`Expected number, found: ${typeof result}`);
  }

  return result;
};

const array = (result: ExpressionValue) => {
  if (!Array.isArray(result)) {
    throw new Error(`Expected array, found: ${typeof result}`);
  }

  if (isArgumentsArray(result)) {
    throw new Error(`Expected array, found: arguments`);
  }

  return result;
};

const evalArray = (arr: ExpressionValue) => {
  return array(arr).map((value) => {
    if (typeof value === "function" && value.length === 0) {
      return value();
    } else {
      return value;
    }
  });
};

const iterable = (result: ExpressionValue) => {
  if (!Array.isArray(result) && typeof result !== "string") {
    throw new Error(`Expected array or string, found: ${typeof result}`);
  }

  return result;
};

const string = (result: ExpressionValue) => {
  if (typeof result !== "string") {
    throw new Error(`Expected string, found: ${typeof result}`);
  }

  return result;
};

const char = (result: ExpressionValue) => {
  if (typeof result !== "string" || result.length !== 1) {
    throw new Error(`Expected char, found: ${typeof result}`);
  }

  return result;
};

type Callable = (...args: ExpressionArray<ExpressionThunk>) => ExpressionValue;

export const formula = function (termDelegate: TermDelegate) {
  const call = (name: string): Callable => {
    const upperName = name.toUpperCase();
    if (prefixOps.hasOwnProperty(upperName)) {
      return (...args) => {
        args.isArgumentsArray = true;
        return prefixOps[upperName](() => args);
      };
    } else if (infixOps.hasOwnProperty(upperName)) {
      return (...args) => infixOps[upperName](args[0], args[1]);
    } else {
      throw new Error(`Unknown function: ${name}`);
    }
  };

  const infixOps: InfixOps = {
    "+": (a, b) => num(a()) + num(b()),
    "-": (a, b) => num(a()) - num(b()),
    "*": (a, b) => num(a()) * num(b()),
    "/": (a, b) => num(a()) / num(b()),
    ",": (a, b): ArgumentsArray => {
      const aVal = a();
      const aArr: ExpressionArray<ExpressionValue> = isArgumentsArray(aVal)
        ? aVal
        : [() => aVal];
      const args: ExpressionArray<ExpressionValue> = aArr.concat([b]);
      args.isArgumentsArray = true;
      return args as ArgumentsArray;
    },
    "%": (a, b) => num(a()) % num(b()),
    "=": (a, b) => a() === b(),
    "!=": (a, b) => a() !== b(),
    "<>": (a, b) => a() !== b(),
    "~=": (a, b) => Math.abs(num(a()) - num(b())) < Number.EPSILON,
    ">": (a, b) => a() > b(),
    "<": (a, b) => a() < b(),
    ">=": (a, b) => a() >= b(),
    "<=": (a, b) => a() <= b(),
    AND: (a, b) => a() && b(),
    OR: (a, b) => a() || b(),
    "^": (a, b) => Math.pow(num(a()), num(b())),
  };

  const prefixOps: FunctionOps = {
    NEG: (arg) => -num(arg()),
    ADD: (a, b) => num(a()) + num(b()),
    SUB: (a, b) => num(a()) - num(b()),
    MUL: (a, b) => num(a()) * num(b()),
    DIV: (a, b) => num(a()) / num(b()),
    MOD: (a, b) => num(a()) % num(b()),
    ISPRIME: (arg) => {
      const val = num(arg());
      for (let i = 2, s = Math.sqrt(val); i <= s; i++) {
        if (val % i === 0) return false;
      }
      return val !== 1;
    },
    GCD: (arg1, arg2) => {
      let a = num(arg1());
      let b = num(arg2());
      a = Math.abs(a);
      b = Math.abs(b);
      if (b > a) {
        var temp = a;
        a = b;
        b = temp;
      }
      while (true) {
        if (b === 0) return a;
        a %= b;
        if (a === 0) return b;
        b %= a;
      }
    },
    NOT: (arg) => !arg(),
    "!": (arg) => !arg(),
    ABS: (arg) => Math.abs(num(arg())),
    ACOS: (arg) => Math.acos(num(arg())),
    ACOSH: (arg) => Math.acosh(num(arg())),
    ASIN: (arg) => Math.asin(num(arg())),
    ASINH: (arg) => Math.asinh(num(arg())),
    ATAN: (arg) => Math.atan(num(arg())),

    ATAN2: (arg1, arg2) => Math.atan2(num(arg1()), num(arg2())),

    ATANH: (arg) => Math.atanh(num(arg())),
    CUBEROOT: (arg) => Math.cbrt(num(arg())),
    CEIL: (arg) => Math.ceil(num(arg())),

    COS: (arg) => Math.cos(num(arg())),
    COSH: (arg) => Math.cos(num(arg())),
    EXP: (arg) => Math.exp(num(arg())),
    FLOOR: (arg) => Math.floor(num(arg())),
    LN: (arg) => Math.log(num(arg())),
    LOG: (arg) => Math.log10(num(arg())),
    LOG2: (arg) => Math.log2(num(arg())),
    SIN: (arg) => Math.sin(num(arg())),
    SINH: (arg) => Math.sinh(num(arg())),
    SQRT: (arg) => Math.sqrt(num(arg())),
    TAN: (arg) => Math.tan(num(arg())),
    TANH: (arg) => Math.tanh(num(arg())),
    ROUND: (arg) => Math.round(num(arg())),
    SIGN: (arg) => Math.sign(num(arg())),
    TRUNC: (arg) => Math.trunc(num(arg())),

    IF: (arg1, arg2, arg3) => {
      const condition = arg1;
      const thenStatement = arg2;
      const elseStatement = arg3;

      if (condition()) {
        return thenStatement();
      } else {
        return elseStatement();
      }
    },

    AVERAGE: (arg) => {
      const arr = evalArray(arg());

      const sum = arr.reduce(
        (prev: number, curr): number => prev + num(curr),
        0
      );
      return num(sum) / arr.length;
    },

    SUM: (arg) =>
      evalArray(arg()).reduce((prev: number, curr) => prev + num(curr), 0),
    CHAR: (arg) => String.fromCharCode(num(arg())),
    CODE: (arg) => char(arg()).charCodeAt(0),

    DEC2BIN: (arg) => arg().toString(2),
    DEC2HEX: (arg) => arg().toString(16),
    BIN2DEC: (arg) => Number.parseInt(string(arg()), 2),
    HEX2DEC: (arg) => Number.parseInt(string(arg()), 16),
    DEGREES: (arg) => (num(arg()) * 180) / Math.PI,
    RADIANS: (arg) => (num(arg()) * Math.PI) / 180,

    MIN: (arg) =>
      evalArray(arg()).reduce(
        (prev: number, curr) => Math.min(prev, num(curr)),
        Number.POSITIVE_INFINITY
      ),
    MAX: (arg) =>
      evalArray(arg()).reduce(
        (prev: number, curr) => Math.max(prev, num(curr)),
        Number.NEGATIVE_INFINITY
      ),
    SORT: (arg) => {
      const arr = array(arg()).slice();
      arr.sort();
      return arr;
    },
    REVERSE: (arg) => {
      const arr = array(arg()).slice();
      arr.reverse();
      return arr;
    },
    INDEX: (arg1, arg2) => iterable(arg2())[num(arg1())],
    LENGTH: (arg) => {
      return iterable(arg()).length;
    },
    JOIN: (arg1, arg2) => evalArray(arg2()).join(string(arg1())),
    STRING: (arg) => evalArray(arg()).join(""),
    SPLIT: (arg1, arg2) => string(arg2()).split(string(arg1())),
    CHARARRAY: (arg) => {
      const str = string(arg());
      return str.split("");
    },
    ARRAY: (arg) => {
      const val = arg();
      return isArgumentsArray(val) ? val.slice() : [val];
    },
    ISNAN: (arg) => isNaN(num(arg())),
    MAP: (arg1, arg2) => {
      const name = string(arg1());
      const arr = evalArray(arg2());
      return arr.map((val) => call(name)(() => val));
    },
    REDUCE: (arg1, arg2, arg3) => {
      const name = string(arg1());
      const start = arg2();
      const arr = evalArray(arg3());
      return arr.reduce((prev, curr) => {
        const args: ExpressionArray<ExpressionThunk> = [() => prev, () => curr];
        return call(name)(...args);
      }, start);
    },
    RANGE: (arg1, arg2) => {
      const start = num(arg1());
      const limit = num(arg2());
      const result = [];
      for (let i = start; i < limit; i++) {
        result.push(i);
      }
      return result;
    },
    UPPER: (arg) => string(arg()).toUpperCase(),
    LOWER: (arg) => string(arg()).toLowerCase(),
  };

  // Ensure arguments are unpacked accordingly
  // Except for the ARRAY constructor
  Object.keys(prefixOps).forEach((key) => {
    if (key !== "ARRAY") {
      prefixOps[key] = unpackArgs(prefixOps[key]);
    }
  });

  return {
    ESCAPE_CHAR: "\\",
    INFIX_OPS: infixOps,
    PREFIX_OPS: prefixOps,
    PRECEDENCE: [
      Object.keys(prefixOps),
      ["^"],
      ["*", "/", "%", "MOD"],
      ["+", "-"],
      ["<", ">", "<=", ">="],
      ["=", "!=", "<>", "~="],
      ["AND", "OR"],
      [","],
    ],
    LITERAL_OPEN: '"',
    LITERAL_CLOSE: '"',
    GROUP_OPEN: "(",
    GROUP_CLOSE: ")",
    SEPARATOR: " ",
    SYMBOLS: [
      "^",
      "*",
      "/",
      "%",
      "+",
      "-",
      "<",
      ">",
      "=",
      "!",
      ",",
      '"',
      "(",
      ")",
      "[",
      "]",
      "~",
    ],
    AMBIGUOUS: {
      "-": "NEG",
    },
    SURROUNDING: {
      ARRAY: {
        OPEN: "[",
        CLOSE: "]",
      },
    },

    termDelegate: function (term: string) {
      const numVal = parseFloat(term);
      if (Number.isNaN(numVal)) {
        switch (term) {
          case "E":
            return Math.E;
          case "LN2":
            return Math.LN2;
          case "LN10":
            return Math.LN10;
          case "LOG2E":
            return Math.LOG2E;
          case "LOG10E":
            return Math.LOG10E;
          case "PI":
            return Math.PI;
          case "SQRTHALF":
            return Math.SQRT1_2;
          case "SQRT2":
            return Math.SQRT2;
          case "FALSE":
            return false;
          case "TRUE":
            return true;
          case "EMPTY":
            return [];
          case "INFINITY":
            return Number.POSITIVE_INFINITY;
          case "EPSILON":
            return Number.EPSILON;
          default:
            return termDelegate(term);
        }
      } else {
        return numVal;
      }
    },

    isCaseInsensitive: true,

    descriptions: [
      {
        op: "+",
        fix: "infix",
        sig: ["a: Number", "b: Number", "Number"],
        text: "Performs addition: a + b",
      },
      {
        op: "-",
        fix: "infix",
        sig: ["a: Number", "b: Number", "Number"],
        text: "Performs subtraction: a - b",
      },
      {
        op: "/",
        fix: "infix",
        sig: ["a: Number", "b: Number", "Number"],
        text: "Performs division: a / b",
      },
      {
        op: ",",
        fix: "infix",
        sig: ["a", "b", "Arguments"],
        text:
          "Returns an array of arguments with b appended to a. If a is not an argument array, it is automatically appended to an empty array.",
      },
      {
        op: "MOD",
        fix: "infix",
        sig: ["a: Number", "b: Number", "Number"],
        text: "Performs modulo operation: a MOD b. (equivalent to %)",
      },
      {
        op: "%",
        fix: "infix",
        sig: ["a: Number", "b: Number", "Number"],
        text: "Performs modulo operation: a % b. (equivalent to MOD)",
      },
      {
        op: "=",
        fix: "infix",
        sig: ["a", "b", "Boolean"],
        text: "Returns TRUE if a = b. Otherwise returns FALSE.",
      },
      {
        op: "!=",
        fix: "infix",
        sig: ["a: Number", "b: Number", "Number"],
        text:
          "Returns FALSE if a = b. Otherwise returns TRUE. (equivalent to <>)",
      },
      {
        op: "<>",
        fix: "infix",
        sig: ["a: Number", "b: Number", "Number"],
        text:
          "Returns FALSE if a = b. Otherwise returns TRUE. (equivalent to !=)",
      },
      {
        op: ">",
        fix: "infix",
        sig: ["a: Number", "b: Number", "Boolen"],
        text: "Performs greater-than operation: a > b",
      },
      {
        op: "<",
        fix: "infix",
        sig: ["a: Number", "b: Number", "Boolen"],
        text: "Performs less-than operation: a < b",
      },
      {
        op: ">=",
        fix: "infix",
        sig: ["a: Number", "b: Number", "Boolen"],
        text: "Performs greater-than-or-equal operation: a >= b",
      },
      {
        op: "<=",
        fix: "infix",
        sig: ["a: Number", "b: Number", "Boolen"],
        text: "Performs less-than-or-equal operation: a <= b",
      },
      {
        op: "AND",
        fix: "infix",
        sig: ["a: Boolean", "b: Boolean", "Boolen"],
        text: "Performs logical AND: a AND b.",
      },
      {
        op: "OR",
        fix: "infix",
        sig: ["a: Boolean", "b: Boolean", "Boolen"],
        text: "Performs logical OR: a OR b.",
      },
      {
        op: "^",
        fix: "infix",
        sig: ["a: Number", "b: Number", "Number"],
        text: "Performs exponentiation (a to the power of b): a ^ b",
      },
      {
        op: "NEG",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text:
          "Performs negation of the value: NEG(value). (equivalent to -value)",
      },
      {
        op: "-",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text:
          'Performs negation of the value: -value. Note: no space can be present before "value". (equivalent to NEG(value))',
      },
      {
        op: "ISPRIME",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text: "Returns TRUE if value is prime, FALSE otherwise.",
      },
      {
        op: "GCD",
        fix: "prefix",
        sig: ["a: Number", "b: Number", "Number"],
        text: "Returns the greatest common divisor of a and b.",
      },
      {
        op: "NOT",
        fix: "prefix",
        sig: ["value: Boolean", "Boolean"],
        text:
          "Performs logical NOT of the value: NOT(value). (equivalent to !value)",
      },
      {
        op: "!",
        fix: "prefix",
        sig: ["value: Boolean", "Boolean"],
        text:
          "Performs logical NOT of the value: !value. (equivalent to NOT(value))",
      },
      {
        op: "ABS",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text: "Returns the absolute value of the number: ABS(value).",
      },
      {
        op: "ACOS",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text:
          "Returns the arc cosine (inverse cosine) of the number: ACOS(value).",
      },
      {
        op: "ACOSH",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text:
          "Returns the inverse hyperbolic cosine of the number: ACOSH(value).",
      },
      {
        op: "ASIN",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text: "Returns the arcsine of the number: ASIN(value).",
      },
      {
        op: "ASINH",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text:
          "Returns the inverse hyperbolic sine of the number: ASINH(value).",
      },
      {
        op: "ATAN",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text: "Returns the arctangent of the number: ATAN(value).",
      },
      {
        op: "ATAN2",
        fix: "prefix",
        sig: ["y: Number", "x: Number", "Number"],
        text:
          "Returns the angle (radians) from the X-axis to a point, given a cartesian y-coordinate and x-coordinate: ATAN2(y, x).",
      },
      {
        op: "ATANH",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text:
          "Returns the inverse hyperbolic tangent of the number: ATANH(value).",
      },
      {
        op: "CUBEROOT",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text:
          "Returns an approximation of the cubed root of the number: CUBEROOT(value).",
      },
      {
        op: "COS",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text: "Returns the cosine of the number: COS(value).",
      },
      {
        op: "COSH",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text: "Returns the hyperbolic cosine of the number: COSH(value).",
      },
      {
        op: "EXP",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text:
          "Returns the natural logarithm (e) raised to this value: EXP(value).",
      },
      {
        op: "LN",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text:
          "Returns the natural logarithm (base e) of the number: LN(value).",
      },
      {
        op: "LOG",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text: "Returns the base 10 logarithm of the number: LOG(value).",
      },
      {
        op: "LOG2",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text: "Returns the base 2 logarithm of the number: LOG2(value).",
      },
      {
        op: "SIN",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text: "Returns the sine of the number: SIN(value).",
      },
      {
        op: "SINH",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text: "Returns the hyperbolic sine of the number: SINH(value).",
      },
      {
        op: "SQRT",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text: "Returns the square root of the number: SQRT(value).",
      },
      {
        op: "TAN",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text: "Returns the tangent of the number: TAN(value).",
      },
      {
        op: "TANH",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text: "Returns the hyperbolic tangent of the number: TANH(value).",
      },
      {
        op: "DEGREES",
        fix: "prefix",
        sig: ["radians: Number", "Number"],
        text: "Performs a conversion of radians to degrees: DEGREES(radians).",
      },
      {
        op: "RADIANS",
        fix: "prefix",
        sig: ["degrees: Number", "Number"],
        text: "Performs a conversion of radians to degrees: RADIANS(degrees).",
      },
      {
        op: "CEIL",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text:
          "Returns the smallest integer greater-than or equal-to the number: CEIL(value).",
      },
      {
        op: "FLOOR",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text:
          "Returns the greatest integer less-than or equal-to the number: CEIL(value).",
      },
      {
        op: "ROUND",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text: "Returns the value rounded to the nearest integer: ROUND(value).",
      },
      {
        op: "TRUNC",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text:
          "Returns the integral part of the number, truncating any fractional digits: TRUNC(value).",
      },
      {
        op: "SIGN",
        fix: "prefix",
        sig: ["value: Number", "Number"],
        text:
          "Returns the sign of the value, indicating whether the number is positive (1) or negative (-1): SIGN(value).",
      },
      {
        op: "ISNAN",
        fix: "prefix",
        sig: ["value", "Boolean"],
        text:
          "Returns TRUE if a value is not a number (e.g. the result of an invalid mathematical operation), otherwise returns FALSE: ISNAN(value).",
      },
      {
        op: "IF",
        fix: "prefix",
        sig: ["condition: Boolean", "then", "else", "result"],
        text:
          'Tests the condition and returns the "then" value if the condition is TRUE, otherwise returns the "else" value: IF(condition, then, else).',
      },
      {
        op: "AVERAGE",
        fix: "prefix",
        sig: ["values: Array of Numbers", "Number"],
        text:
          "Returns the average (mean) of an array of numbers. AVERAGE(array).",
      },
      {
        op: "SUM",
        fix: "prefix",
        sig: ["values: Array of Numbers", "Number"],
        text: "Returns the sum of an array of numbers. SUM(array).",
      },
      {
        op: "MIN",
        fix: "prefix",
        sig: ["values: Array of Numbers", "Number"],
        text: "Returns the minimum value in an array of numbers. MIN(array).",
      },
      {
        op: "MAX",
        fix: "prefix",
        sig: ["values: Array of Numbers", "Number"],
        text: "Returns the maximum value in an array of numbers. MAX(array).",
      },
      {
        op: "CHAR",
        fix: "prefix",
        sig: ["code: Integer", "String"],
        text:
          "Returns a single-character string with a unicode character representing the value of the given code. CHAR(code)",
      },
      {
        op: "CODE",
        fix: "prefix",
        sig: ["string: String", "Integer"],
        text:
          "Returns the unicode value of the first character of a string: CODE(string)",
      },
      {
        op: "UPPER",
        fix: "prefix",
        sig: ["string: String", "String"],
        text: "Converts a string to uppercase: UPPER(string).",
      },
      {
        op: "LOWER",
        fix: "prefix",
        sig: ["string: String", "String"],
        text: "Converts a string to lowercase: LOWER(string).",
      },
      {
        op: "DEC2BIN",
        fix: "prefix",
        sig: ["decimal: Integer", "binary: String"],
        text:
          'Returns a string of "1" and "0" characters representing the binary representation of the decimal value. DEC2BIN(decimal)',
      },
      {
        op: "DEC2HEX",
        fix: "prefix",
        sig: ["decimal: Integer", "hex: String"],
        text:
          "Returns a string of characters representing the hexadecimal representation of the decimal value. DEC2HEX(decimal)",
      },
      {
        op: "BIN2DEC",
        fix: "prefix",
        sig: ["binary: String", "decimal: Integer"],
        text:
          'Returns the base 10 value of a binary string of "1" and "0" characters. BIN2DEC(binary)',
      },
      {
        op: "HEX2DEC",
        fix: "prefix",
        sig: ["hex: String", "decimal: Integer"],
        text:
          "Returns the base 10 value of a hexadecimal string. HEX2DEC(hex)",
      },
      {
        op: "SORT",
        fix: "prefix",
        sig: ["array: Array", "Array"],
        text: "Returns a sorted array: SORT(array).",
      },
      {
        op: "REVERSE",
        fix: "prefix",
        sig: ["array: Array", "Array"],
        text: "Returns a reversed array: REVERSE(array).",
      },
      {
        op: "INDEX",
        fix: "prefix",
        sig: ["array: Array", "Array"],
        text: "Returns a reversed array: REVERSE(array).",
      },
      {
        op: "LENGTH",
        fix: "prefix",
        sig: ["array: Array", "Integer"],
        text: "Returns the length of an array: LENGTH(array).",
      },
      {
        op: "JOIN",
        fix: "prefix",
        sig: ["array: Array", "separator: String", "String"],
        text:
          "Joins each array element into a string, using a separator: JOIN(array, separator).",
      },
      {
        op: "SPLIT",
        fix: "prefix",
        sig: ["string: String", "separator: String", "Array"],
        text:
          "Splits a string into an array of characters, using a separator: SPLIT(string, separator).",
      },
      {
        op: "STRING",
        fix: "prefix",
        sig: ["array: Array", "String"],
        text: "Converts an array into a string: STRING(array).",
      },
      {
        op: "CHARARRAY",
        fix: "prefix",
        sig: ["string: String", "Array"],
        text:
          "Converts a string into an array of characters: CHARARRAY(string)",
      },
      {
        op: "ARRAY",
        fix: "prefix",
        sig: ["arguments...", "Array"],
        text: "Converts arguments into an array: ARRAY(a, b, c, ...).",
      },
      {
        op: "MAP",
        fix: "prefix",
        sig: ["mapper: Reference", "array: Array", "Array"],
        text:
          "Performs a mapper function on each element of the array: MAP(mapper, array).",
      },
      {
        op: "REDUCE",
        fix: "prefix",
        sig: ["reducer: Reference", "start", "array: Array", "Array"],
        text:
          'Performs a reducer function on each pair of array elements, using "start" as its starting value: REDUCE(reducer, array).',
      },
      {
        op: "RANGE",
        fix: "prefix",
        sig: ["start: Integer", "limit: Integer", "Array"],
        text:
          "Creates an array of integers, incrementing from start (included) to the limit (excluded): RANGE(start, limit)",
      },
      {
        op: "[...]",
        fix: "surround",
        sig: ["arguments...", "Array"],
        text: "Converts arguments into an array: [a, b, c, ...].",
      },
    ],
  };
};
