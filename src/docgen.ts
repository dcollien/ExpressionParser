import { writeFile } from "fs";
import { resolve } from "path";

import { ExpressionParserOptions } from "./ExpressionParser";

import { formula } from "./index";

const generateDocs = (language: ExpressionParserOptions) => {
  return (
    "# Language Reference\n" +
    language.descriptions
      .map((op) => {
        const returnVal = op.sig[op.sig.length - 1];
        const args = op.sig.slice(0, op.sig.length - 1);

        let sigDoc;
        if (op.fix === "infix") {
          sigDoc = `(${args[0]} ${op.op} ${args[1]}): ${returnVal}`;
        } else if (op.fix === "prefix") {
          sigDoc = `${op.op}(${args.join(", ")}): ${returnVal}`;
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
console.log(formulaDocs);
writeFile(resolve(__dirname, "./languages/formula.md"), formulaDocs, (err) => {
  if (err) {
    throw err;
  }
  console.log("Done.");
});
