Review the chapter below as an independent QA reviewer. The deterministic validator has already checked the data contract, 500 random draws per exercise, perfect answers, empty answers, diagnostics, duplicates, answer leakage and "vous" — do not re-check those. Focus on what a script cannot see:
- QA1 programme: scope versus the official objectives and scope notes; nothing out of programme presented as required.
- QA2 accuracy: definitions, properties, worked examples, illustrations.
- QA3 exercises: solve a sample of exercises yourself (at least one per level) before reading the key; ambiguity, missing equivalent answers, hints that give the answer, unrealistic data, level calibration.
- QA4 games: correctness of items and pedagogical value.
- QA6 language: French spelling and grammar, consistent "tu", terminology of the French programme.

Validator summary: {{VALIDATOR}}

Chapter specification (JSON):
{{SPEC}}

Chapter file:
```ts
{{FILE}}
```

Write the report in French Markdown: a table with a verdict per dimension (PASS / FAIL / NEEDS REVIEW), then numbered findings with exercise id, severity (BLOQUANT / MAJEUR / MINEUR), concrete example and proposed fix. Return only the report.
