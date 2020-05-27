import "mocha";
import { expect } from "chai";

import { init, macro } from "../index";


const parser = init(macro, (term: string) => {
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
    }).to.throw("Mismatched Grouping (unexpected \"(\")");
  });
  it("should raise error", () => {
    expect(() => {
      calc(")TRUE AND FALSE");
    }).to.throw("Mismatched Grouping (unexpected closing \")\")");
  });
  it("should raise error", () => {
    expect(() => {
      calc("((TRUE) AND (FALSE)");
    }).to.throw("Mismatched Grouping (unexpected \"(\")");
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

  it("should result in ABCDEFG", () => {
    const result = calc("STRING(MAP(\"UPPER\", CHARARRAY(\"abcdefg\")))");
    expect(result).to.equal("ABCDEFG");
  });

  it("should result in [true, false, true]", () => {
    const result = calc("MAP(\"NOT\", [FALSE, TRUE, FALSE])");
    expect(result).to.eql([true, false, true]);
  });

  it("should result in 6", () => {
    const result = calc("REDUCE(\"ADD\", 0, [1, 2, 3])");
    expect(result).to.equal(6);
  });

  it("should result in [ 97, 98, 99, 100, 101, 102, 103 ]", () => {
    const result = calc("MAP(\"CODE\", CHARARRAY(\"abcdefg\"))");
    expect(result).to.eql([ 97, 98, 99, 100, 101, 102, 103 ]);
  })

  it("should result in 700", () => {
    const result = calc("REDUCE(\"+\", 0, MAP(\"CODE\", CHARARRAY(\"abcdefg\")))");
    expect(result).to.equal(700);
  });

  it("should throw error", () => {
    expect(() => {
      calc("REDUCE(\"_TEST_\", 0, [1, 2, 3])");
    }).to.throw('Unknown function: _TEST_');
  });
});

// TODO: IFTHENELSE / RANGE, Math funcs
