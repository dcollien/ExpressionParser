import {
  Delegate,
  ExpressionThunk,
  ExpressionValue,
  isArgumentsArray,
} from "./ExpressionParser";

export const unpackArgs = (f: Delegate) => (expr: ExpressionThunk) => {
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

export const num = (result: ExpressionValue) => {
  if (typeof result !== "number") {
    throw new Error(
      `Expected number, found: ${typeof result} ${JSON.stringify(result)}`
    );
  }

  return result;
};

export const array = (result: ExpressionValue) => {
  if (!Array.isArray(result)) {
    throw new Error(
      `Expected array, found: ${typeof result} ${JSON.stringify(result)}`
    );
  }

  if (isArgumentsArray(result)) {
    throw new Error(`Expected array, found: arguments`);
  }

  return result;
};

export const bool = (value: ExpressionValue) => {
  if (typeof value !== "boolean") {
    throw new Error(
      `Expected boolean, found: ${typeof value} ${JSON.stringify(value)}`
    );
  }

  return value;
};

export const evalBool = (value: ExpressionValue): boolean => {
  let result;

  while (typeof value === "function" && value.length === 0) {
    result = value();
  }

  if (!result) {
    result = value;
  }

  return bool(result);
};

export const evalString = (value: ExpressionValue) => {
  let result;
  if (typeof value === "function" && value.length === 0) {
    result = value();
  } else {
    result = value;
  }

  return string(result);
};

export const evalArray = (
  arr: ExpressionValue,
  typeCheck?: (value: ExpressionValue) => ExpressionValue
) => {
  return array(arr).map((value) => {
    let result;
    if (typeof value === "function" && value.length === 0) {
      result = value();
    } else {
      result = value;
    }

    if (typeCheck) {
      try {
        result = typeCheck(result);
      } catch (err) {
        throw new Error(`In array; ${err.message}`);
      }
    }

    return result;
  });
};

export const obj = (obj: ExpressionValue) => {
  if (typeof obj !== "object" || obj === null) {
    throw new Error(
      `Expected object, found: ${typeof obj} ${JSON.stringify(obj)}`
    );
  } else if (Array.isArray(obj)) {
    throw new Error(`Expected object, found array`);
  }

  return obj;
};

export const iterable = (result: ExpressionValue) => {
  if (!Array.isArray(result) && typeof result !== "string") {
    throw new Error(
      `Expected array or string, found: ${typeof result} ${JSON.stringify(
        result
      )}`
    );
  }

  return result;
};

export const string = (result: ExpressionValue) => {
  if (typeof result !== "string") {
    throw new Error(
      `Expected string, found: ${typeof result} ${JSON.stringify(result)}`
    );
  }

  return result;
};

export const char = (result: ExpressionValue) => {
  if (typeof result !== "string" || result.length !== 1) {
    throw new Error(
      `Expected char, found: ${typeof result} ${JSON.stringify(result)}`
    );
  }

  return result;
};
