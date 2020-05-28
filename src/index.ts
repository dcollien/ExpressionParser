import ExpressionParser, {
  TermDelegate,
  ExpressionParserOptions
} from "./ExpressionParser";
import { formula } from "./languages/formula";

export { ExpressionParser, formula };

export const init = (
  language: (termDelegate: TermDelegate) => ExpressionParserOptions,
  evalTerm: TermDelegate
) => {
  const defn = language(evalTerm);
  return new ExpressionParser(defn);
};
