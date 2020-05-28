import "mocha";
import { expect } from "chai";

import { init, formula } from "../index";

const parser = init(formula, (term: string) => {
  if (term === "_TEST") {
    return 42;
  } else {
    throw new Error(`Invalid term: ${term}`);
  }
});

const calc = (expression: string) => {
  return parser.expressionToValue(expression);
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
    const result = calc("INDEX(0, [5, 4, 3, 2])");
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
