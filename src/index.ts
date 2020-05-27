import ExpressionParser, { PrefixOps, TermDelegate, ExpressionParserOptions } from "./ExpressionParser";
import { macro } from "./languages/macro";

export { ExpressionParser, macro };

export const init = (
  language: (termDelegate: TermDelegate) => ExpressionParserOptions,
  evalTerm: TermDelegate
) => {
  let funcs: PrefixOps = {};
  const termDelegate = (term: string) => {
      if (funcs[term.toUpperCase()]) {
          // Return a string reference to the function
          return term;
      } else {
        return evalTerm(term);
      }
  };
  const defn = language(termDelegate);
  funcs = defn.PREFIX_OPS;
  return new ExpressionParser(defn);
};
