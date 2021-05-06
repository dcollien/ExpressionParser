import "mocha";
import { expect } from "chai";

import { init, formula } from "../index";
import { ExpressionValue } from "../ExpressionParser";

const termVals: { [key:string]: number | ((...args: any) => any) } = {
  'a': 12,
  'b': 9,
  'c': -3,
  _TEST: 42,
  'xadd': (a, b) => a + b,
  'xneg': (x) => -x,
  'isEven': (x) => x % 2 == 0,
};

const termTypes: { [key: string]: "number" | "function" } = {
  'xadd': "function",
  'xneg': "function",
  'isEven': "function"
};

const parser = init(formula, (term: string) => {
  if (term in termVals) {
    return termVals[term];
  } else {
    throw new Error(`Invalid term: ${term}`);
  }
}, (term: string) => {
  if (term in termTypes) {
    return termTypes[term];
  } else {
    return "number";
  }
});

const calc = (expression: string, terms?: Record<string, ExpressionValue>) => {
  return parser.expressionToValue(expression, terms);
};

describe("Infix Simple Arithmetic", () => {
  it("should result in 0", () => {
    const result = calc("1^1 - ((1 + 1) * 2) / 4");
    expect(result).to.equal(0);
  });
});

describe("Infix Modular Arithmetic", () => {
  it("should result in 3", () => {
    const result = calc("15 % 12");
    expect(result).to.equal(3);
  });
  it("should result in 4", () => {
    const result = calc("MOD(16, 12)");
    expect(result).to.equal(4);
  });
});

describe("Quadratic Formula", () => {
  it("should result in -1", () => {
    const result = calc("(-b - sqrt(b^2 - 4 * a * c))/(2 * a)");
    expect(result).to.equal(-1);
  })
});

describe("External Function", () => {
  it("should result in 2", () => {
    const result = calc("xadd(1,1)");
    expect(result).to.equal(2);
  });

  it("should result in 2", () => {
    const result = calc("xneg(-2)");
    expect(result).to.equal(2);
  });

  it("should result in [1, 2]", () => {
    const result = calc("map(xneg, [-1, -2])");
    expect(result).to.eql([1, 2]);
  });
});

describe("Additional Terms", () => {
  it("should result in 3", () => {
    const result = calc("x + y", { x: 1, y: 2 });
    expect(result).to.equal(3);
  });

  it("should result in true", () => {
    const result = calc("x = UNDEFINED", { x: undefined });
    expect(result).to.equal(true);
  });
});

describe("Simple Boolean Expression", () => {
  it("should result in true", () => {
    const result = calc("1 + 1 = 2");
    expect(result).to.equal(true);
  });
  it("should result in false", () => {
    const result = calc("!(1 + 1 = 2)");
    expect(result).to.equal(false);
  });
});

describe("Boolean Expression", () => {
  it("should result in true", () => {
    const result = calc(
      "(1 = 1) AND (1 != 2) AND (1 <> 2) AND (1 < 2) AND (2 > 1) AND (1 <= 1) AND ((1 >= 1) OR FALSE) AND (PI = PI)"
    );
    expect(result).to.equal(true);
  });

  it("should result in true", () => {
    const result = calc("(1 = 1) AND ISPRIME(5)");
    expect(result).to.equal(true);
  });
});

describe("Case Insensitive Expression", () => {
  it("should result in true", () => {
    const result = calc(
      "(E = E) and (LN2 != LN10) and (LOG2E <> LOG10E) and (ROUND(SQRTHALF) = ROUND(1/SQRT2)) and (TRUE != FALSE) and (LENGTH(EMPTY) = 0)"
    );
    expect(result).to.equal(true);
  });
});

describe("Terminal", () => {
  it("should result in 42", () => {
    const result = calc("_TEST + 1 - 1");
    expect(result).to.equal(42);
  });

  it("should raise error", () => {
    expect(() => {
      calc("_TEST + _INVALID");
    }).to.throw("Invalid term");
  });
});

describe("Grouping", () => {
  it("should raise error", () => {
    expect(() => {
      calc("(TRUE AND FALSE");
    }).to.throw('Mismatched Grouping (unexpected "(")');
  });
  it("should raise error", () => {
    expect(() => {
      calc(")TRUE AND FALSE");
    }).to.throw('Mismatched Grouping (unexpected closing ")")');
  });
  it("should raise error", () => {
    expect(() => {
      calc("((TRUE) AND (FALSE)");
    }).to.throw('Mismatched Grouping (unexpected "(")');
  });
  it("should result in false", () => {
    expect(calc("((TRUE) AND (FALSE))")).to.equal(false);
  });
});

describe("Calls and Arrays", () => {
  it("should result in 4", () => {
    const result = calc("GCD(8, 12)");
    expect(result).to.equal(4);
  });

  it("should result in 5", () => {
    const result = calc("AVERAGE([4,5,6])");
    expect(result).to.equal(5);
  });

  it("should result in 5", () => {
    const result = calc("SUM(SORT(REVERSE([1,2,2])))");
    expect(result).to.equal(5);
  });

  it('should result in ABCDEFG"', () => {
    const result = calc('STRING(MAP("UPPER", CHARARRAY("abcdefg\\"")))');
    expect(result).to.equal('ABCDEFG"');
  });

  it("should result in [true, false, true]", () => {
    const result = calc('MAP("NOT", [FALSE, TRUE, FALSE])');
    expect(result).to.eql([true, false, true]);
  });

  it("should result in 6", () => {
    const result = calc('REDUCE("ADD", 0, [1, 2, 3])');
    expect(result).to.equal(6);
  });

  it("should result in -6", () => {
    const result = calc('REDUCE("SUB", 0, [3, 2, 1])');
    expect(result).to.equal(-6);
  });

  it("should result in 25", () => {
    const result = calc('REDUCE("DIV", 100, [2, 2, 1])');
    expect(result).to.equal(25);
  });

  it("should result in 4", () => {
    const result = calc('REDUCE("MUL", 1, [2, 2, 1])');
    expect(result).to.equal(4);
  });

  it("should result in [ 97, 98, 99, 100, 101, 102, 103 ]", () => {
    const result = calc('MAP("CODE", CHARARRAY("abcdefg"))');
    expect(result).to.eql([97, 98, 99, 100, 101, 102, 103]);
  });

  it("should result in 700", () => {
    const result = calc('REDUCE("+", 0, MAP("CODE", CHARARRAY("abcdefg")))');
    expect(result).to.equal(700);
  });

  it("should throw error", () => {
    expect(() => {
      calc('REDUCE("_TEST_", 0, [1, 2, 3])');
    }).to.throw("Unknown function: _TEST_");
  });
});

describe("More Functions", () => {
  it("should result in 10", () => {
    const result = calc("IF(7 < 5, 8, 10)");
    expect(result).to.equal(10);
  });

  it("should result in 8", () => {
    const result = calc("IF(7 > 5, 8, 10)");
    expect(result).to.equal(8);
  });

  it("should result in 8", () => {
    expect(() => {
      calc("IF(7 > 5, 8)");
    }).to.throw("Incorrect number of arguments. Expected 3");
  });

  it("should result in 10", () => {
    const result = calc("LENGTH(RANGE(0, 10))");
    expect(result).to.equal(10);
  });

  it("should result in 'A'", () => {
    const result = calc("CHAR(65)");
    expect(result).to.equal("A");
  });

  it("should result in 5", () => {
    const result = calc("MIN([5, 6, 7, 8])");
    expect(result).to.equal(5);
  });

  it("should result in 5", () => {
    const result = calc("MAX([5, 4, 3, 2])");
    expect(result).to.equal(5);
  });

  it("should result in 5", () => {
    const result = calc("INDEX([5, 4, 3, 2], 0)");
    expect(result).to.equal(5);
  });

  it('should result in "a,b"', () => {
    const result = calc('JOIN(",", ["a", "b"])');
    expect(result).to.equal("a,b");
  });

  it("should result in ['a', 'b']", () => {
    const result = calc('SPLIT(",", "a,b")');
    expect(result).to.eql(["a", "b"]);
  });
});

describe("Array Functions", () => {
  it("should result in [[1, 2], [3, 4]]", () => {
    const result = calc('ZIP([1, 3], [2, 4])');
    expect(result).to.eql([[1, 2], [3, 4]]);
  });

  it("should result in [1, 3], [2, 4]", () => {
    const result = calc('UNZIP([[1, 2], [3, 4]])');
    expect(result).to.eql([[1, 3], [2, 4]]);
  });

  it("should result in [42, 69]", () => {
    const result = calc('TAKE(2, [42, 69, 54])');
    expect(result).to.eql([42, 69]);
  });

  it("should result in [69, 54]", () => {
    const result = calc('DROP(2, [1, 42, 69, 54])');
    expect(result).to.eql([69, 54]);
  });

  it("should result in [42, 69]", () => {
    const result = calc('SLICE(1, 3, [1, 42, 69, 54])');
    expect(result).to.eql([42, 69]);
  });

  it("should result in [42, 69, 54]", () => {
    const result = calc('CONCAT([42, 69], [54])');
    expect(result).to.eql([42, 69, 54]);
  });

  it("should result in 42", () => {
    const result = calc('HEAD([42, 69, 54])');
    expect(result).to.equal(42);
  });

  it("should result in [69, 54]", () => {
    const result = calc('TAIL([42, 69, 54])');
    expect(result).to.eql([69, 54]);
  });

  it("should result in 54", () => {
    const result = calc('LAST([42, 69, 54])');
    expect(result).to.equal(54);
  });

  it("should result in [2,3,4]", () => {
    const result = calc('CONS(2, [3, 4])');
    expect(result).to.eql([2, 3, 4]);
  });

  it("should result in [2,4,6]", () => {
    const result = calc('FILTER(isEven, [1,2,3,4,5,6])');
    expect(result).to.eql([2,4,6]);
  });

  it("should result in [0,2,4]", () => {
    const result = calc('TAKEWHILE(isEven, [0,2,4,5,6,7,8])');
    expect(result).to.eql([0,2,4]);
  });

  it("should result in [5,6,7,8]", () => {
    const result = calc('DROPWHILE(isEven, [0,2,4,5,6,7,8])');
    expect(result).to.eql([5,6,7,8]);
  });
});

describe("Dictionaries", () => {
  it("should result in 5", () => {
    const result = calc('GET("b", DICT(["a", "b"], [1, 5]))');
    expect(result).to.equal(5);
  });

  it("should result in 5", () => {
    const result = calc('GET("b", PUT("b", 5, DICT(["a", "b"], [1, 4])))');
    expect(result).to.equal(5);
  });

  it("should result in 5", () => {
    const result = calc('GET("b", UNZIPDICT([["a", 1], ["b", 5]]))');
    expect(result).to.equal(5);
  });

  it("should result in [\"a\", \"b\"]", () => {
    const result = calc('KEYS(UNZIPDICT([["b", 1], ["a", 5]]))');
    expect(result).to.eql(["a", "b"]);
  });

  it("should result in [5, 1]", () => {
    const result = calc('VALUES(UNZIPDICT([["b", 1], ["a", 5]]))');
    expect(result).to.eql([5, 1]);
  });
});

describe("Maths", () => {
  it("should be false", () => {
    const result = calc("ISNAN(1/0)");
    expect(result).to.equal(false);
  });

  it("should be true", () => {
    const result = calc("(1/0) = INFINITY");
    expect(result).to.equal(true);
  });

  it("should be false", () => {
    const result = calc("ISNAN(0)");
    expect(result).to.equal(false);
  });

  it("should be -1", () => {
    const result = calc("(-1)");
    expect(result).to.equal(-1);
  });

  it("should be true", () => {
    const result = calc("isNaN(sqrt(-1))");
    expect(result).to.equal(true);
  });

  it("should be false", () => {
    const result = calc("isNaN(sqrt(abs(-1)))");
    expect(result).to.equal(false);
  });

  it("should be true", () => {
    const result = calc("TAN(ATAN(1)) ~= 1");
    expect(result).to.equal(true);
  });

  it("should be true", () => {
    const result = calc("COS(ACOS(1)) ~= 1");
    expect(result).to.equal(true);
  });

  it("should be true", () => {
    const result = calc("SIN(ASIN(1)) ~= 1");
    expect(result).to.equal(true);
  });

  it("should be true", () => {
    const result = calc("TANH(ATANH(1)) ~= 1");
    expect(result).to.equal(true);
  });

  it("should be true", () => {
    const result = calc("COSH(ACOSH(1)) ~= 1");
    expect(result).to.equal(true);
  });

  it("should be true", () => {
    const result = calc("SINH(ASINH(1)) ~= 1");
    expect(result).to.equal(true);
  });

  it("should result in PI/4", () => {
    const result = calc("ATAN2(2,2)");
    expect(result).to.equal(Math.PI / 4);
  });

  it("should result in 1", () => {
    const result = calc("LN(E)");
    expect(result).to.equal(1);
  });

  it("should result in 1", () => {
    const result = calc("LOG(10)");
    expect(result).to.equal(1);
  });

  it("should result in 1", () => {
    const result = calc("LOG2(2)");
    expect(result).to.equal(1);
  });

  it("should result in 1", () => {
    const result = calc("FLOOR(1.9)");
    expect(result).to.equal(1);
  });

  it("should result in 1", () => {
    const result = calc("CEIL(0.1)");
    expect(result).to.equal(1);
  });

  it("should result in 1", () => {
    const result = calc("ROUND(0.6)");
    expect(result).to.equal(1);
  });

  it("should result in 1", () => {
    const result = calc("ROUND(1.1)");
    expect(result).to.equal(1);
  });

  it("should result in 1", () => {
    const result = calc("TRUNC(1.9)");
    expect(result).to.equal(1);
  });

  it("should result in 1", () => {
    const result = calc("SIGN(5)");
    expect(result).to.equal(1);
  });

  it("should result in -1", () => {
    const result = calc("FLOOR(-0.1)");
    expect(result).to.equal(-1);
  });

  it("should result in -1", () => {
    const result = calc("CEIL(-1.1)");
    expect(result).to.equal(-1);
  });

  it("should result in -1", () => {
    const result = calc("ROUND(-0.6)");
    expect(result).to.equal(-1);
  });

  it("should result in -1", () => {
    const result = calc("ROUND(-1.1)");
    expect(result).to.equal(-1);
  });

  it("should result in -1", () => {
    const result = calc("TRUNC(-1.9)");
    expect(result).to.equal(-1);
  });

  it("should result in -1", () => {
    const result = calc("SIGN(-5)");
    expect(result).to.equal(-1);
  });

  it("should be true", () => {
    const result = calc("EXP(1) = E");
    expect(result).to.equal(true);
  });

  it("should be true", () => {
    const result = calc("CUBEROOT(27) = 3");
    expect(result).to.equal(true);
  });

  it("should result in 90", () => {
    const result = calc("DEGREES(RADIANS(90))");
    expect(result).to.equal(90);
  });

  it("should result in '100'", () => {
    const result = calc("DEC2BIN(4)");
    expect(result).to.equal("100");
  });

  it("should result in 4", () => {
    const result = calc('BIN2DEC("100")');
    expect(result).to.equal(4);
  });

  it("should result in 'f'", () => {
    const result = calc("LOWER(UPPER(DEC2HEX(15)))");
    expect(result).to.equal("f");
  });

  it("should result in 16", () => {
    const result = calc('HEX2DEC("F")');
    expect(result).to.equal(15);
  });

  it("should be true", () => {
    const result = calc("0.99999999999999999 + EPSILON > 1");
    expect(result).to.equal(true);
  });
});

describe("Exceptions", () => {
  it("should throw 'Too few arguments'", () => {
    expect(() => {
      calc("GCD(2)");
    }).to.throw("Too few arguments. Expected 2, found 1 (2)");
  });

  it("should throw 'Expected number'", () => {
    expect(() => {
      calc('add("A", "B")');
    }).to.throw("Expected number, found: string");
  });

  it("should throw 'Expected array'", () => {
    expect(() => {
      calc('sort("ABC")');
    }).to.throw("Expected array, found: string");
  });

  it("should throw 'Expected array or string'", () => {
    expect(() => {
      calc("index(1, 1)");
    }).to.throw("Expected array or string, found: number");
  });

  it("should throw 'Expected string'", () => {
    expect(() => {
      calc("BIN2DEC(10)");
    }).to.throw("Expected string, found: number");
  });

  it("should throw 'Expected char'", () => {
    expect(() => {
      calc('CODE("FOO")');
    }).to.throw("Expected char, found: string");
  });
});
