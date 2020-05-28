import { writeFile } from "fs";
import { resolve } from "path";

import { ExpressionParserOptions } from "./ExpressionParser";

import { formula } from "./index";

const generateDocs = (language: ExpressionParserOptions) => {
  const prefixOps = new Set();
  const infixOps = new Set();

  language.descriptions.forEach((op) => {
    if (op.fix === "infix") {
      infixOps.add(op.op);
    } else if (op.fix === "prefix") {
      prefixOps.add(op.op);
    }
  });


  Object.keys(language.INFIX_OPS).forEach((op) => {
    if (!infixOps.has(op)) {
      console.error(op, "Missing from docs (infix)");
    }
  });

  Object.keys(language.PREFIX_OPS).forEach((op) => {
    if (!prefixOps.has(op)) {
      console.error(op, "Missing from docs (prefix)");
    }
  });

  return (
    "# Language Reference\n" +
    language.descriptions
      .map((op) => {
        const returnVal = op.sig[op.sig.length - 1];
        const args = op.sig.slice(0, op.sig.length - 1);

        let sigDoc;
        if (op.fix === "infix") {
          sigDoc = `(${args[0]} ${op.op} ${args[1]}): ${returnVal}`;

          if (!(op.op in language.INFIX_OPS)) {
            console.error(op.op, "not in INFIX_OPS");
          }
        } else if (op.fix === "prefix") {
          sigDoc = `${op.op}(${args.join(", ")}): ${returnVal}`;

          if (!(op.op in language.PREFIX_OPS)) {
            console.error(op.op, "not in PREFIX_OPS");
          }
        } else {
          sigDoc = `${op.op.replace("...", args[0])}: ${returnVal}`;
        }

        return `
## ${op.op}

\`${sigDoc}\`

${op.text}`;
      })
      .join("\n") +
    "\n"
  );
};

const formulaDocs = generateDocs(formula((term) => null));
writeFile(resolve(__dirname, "./languages/formula.md"), formulaDocs, (err) => {
  if (err) {
    throw err;
  }
});
