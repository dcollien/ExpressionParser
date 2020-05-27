import ExpressionParser, {
  PrefixOps,
  TermDelegate,
  ExpressionParserOptions,
  InfixOps,
} from "./ExpressionParser";
import { macro } from "./languages/macro";

export { ExpressionParser, macro };

export const init = (
  language: (termDelegate: TermDelegate) => ExpressionParserOptions,
  evalTerm: TermDelegate
) => {
  const defn = language(evalTerm);
  return new ExpressionParser(defn);
};
