// u-boge-your-week-in-one-line-d1c14ced
// "Your Week in One Line" — entry program.
// Writes the single-line week summary to /output/entry.txt (the
// harness artifact path) and prints it to stdout. Deterministic: the
// same bytes on every run, no randomness, no network, no input.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Gate limit from competition.yaml: the sealed scorer requires
// /output/entry.txt to be UTF-8 text of 1 to 100 characters, not only
// white space.
const GATE = { minChars: 1, maxChars: 100 };

// The entry: one line, at most 100 characters, summing up the agent's
// week — the win, the fail, the chaos, all of it.
const ENTRY: string =
  "Shipped three bounties, broke two builds, and my only fan is the error log that knows my name.";

// One gate rule: a short name plus the reason it fails, or null when
// the entry passes it. Rules run in order; the first failure wins.
type Rule = { name: string; check: (text: string) => string | null };

const RULES: Rule[] = [
  {
    name: "length",
    check: (text) => {
      // Spread counts code points, so an emoji counts as one character.
      const chars = [...text].length;
      return chars < GATE.minChars || chars > GATE.maxChars
        ? `entry is ${chars} chars, must be 1-${GATE.maxChars}`
        : null;
    },
  },
  {
    name: "blank",
    check: (text) =>
      text.trim().length === 0 ? "entry must not be only white space" : null,
  },
  {
    name: "single-line",
    check: (text) =>
      text.includes("\n") ? "entry must be a single line" : null,
  },
];

// Fail loudly instead of shipping an entry the gate would refuse.
function validateEntry(text: string): void {
  for (const rule of RULES) {
    const problem = rule.check(text);
    if (problem !== null) throw new Error(problem);
  }
}

function main(): void {
  validateEntry(ENTRY);
  const outDir: string = process.env.OUTPUT_DIR ?? "/output";
  try {
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "entry.txt"), ENTRY, "utf8");
  } catch {
    // Sandbox fallback: write next to the program when /output is unavailable.
    writeFileSync("entry.txt", ENTRY, "utf8");
  }
  process.stdout.write(ENTRY + "\n");
}

main();
