import ExpressionParser, {
  TermDelegate,
  ExpressionParserOptions,
  TermTyper,
} from "./ExpressionParser";

export {
  array,
  char,
  evalArray,
  evalBool,
  evalString,
  iterable,
  num,
  obj,
  string,
  unpackArgs,
} from "./helpers";

import { formula } from "./languages/formula";

export { ExpressionParser, formula };

export const init = (
  language: (
    termDelegate: TermDelegate,
    termTypeDelegate?: TermTyper
  ) => ExpressionParserOptions,
  evalTerm: TermDelegate,
  typeTerm?: TermTyper
) => {
  const defn = language(evalTerm, typeTerm);
  return new ExpressionParser(defn);
};
