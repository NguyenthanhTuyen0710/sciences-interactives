Review the chapter below as an independent QA reviewer and answer with the JSON object required by the output schema — nothing else.

The deterministic validator has already passed (summary below): data contract, 500 random draws per exercise, perfect and empty answers, diagnostics equal or equivalent to the right answer, duplicate options, answer leakage, "vous". Do not re-check those and do not restate the chapter content. Report only what a script cannot see:
- curriculum: scope versus the official objectives and scope notes; nothing out of programme presented as required.
- accuracy: definitions, properties, worked examples, illustrations.
- exercises: solve a sample yourself (at least one per level) before reading the key; ambiguity, missing equivalent answers, hints that give the answer away, unrealistic data, level calibration.
- games: correctness of items and pedagogical value.
- technical: code-level risks the validator cannot detect (e.g. a generator branch that can produce a misleading statement).
- language: French spelling and grammar, consistent "tu", terminology of the French programme.

Output rules (the answer has a hard length limit; the most important information must come first):
1. `verdict`: PASS only if there is no BLOQUANT or MAJEUR finding; FAIL if at least one BLOQUANT; otherwise NEEDS_REVIEW.
2. `criteria`: exactly one entry per criterion (curriculum, accuracy, exercises, games, technical, language).
3. `findings`: only real defects, sorted BLOQUANT, then MAJEUR, then MINEUR; at most 15, one defect per entry, no praise, no repetition. `exerciseId` = the exercise or game id, or "" if the finding is general. `issue` and `fix`: one or two short sentences in French, with the concrete value or wording involved.
4. If nothing is wrong: `verdict` PASS, every criterion PASS, `findings` empty.

Validator summary: {{VALIDATOR}}

Chapter specification (JSON):
{{SPEC}}

Chapter file:
```ts
{{FILE}}
```
