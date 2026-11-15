Write the complete chapter file `src/lib/chapters/data/{{ID}}.ts` exporting `export const {{EXPORT}}: ChapterContent`.

- id "{{ID}}", taskId "{{TASK}}", grade "{{GRADE}}", subject "{{SUBJECT}}", treeChapterId "{{TREE}}", curriculumVersion "2026-2027", title « {{TITLE}} ».
- officialObjectives: exactly the objectives listed below (same ids and texts), consolidation objectives marked as such in their `source`.
{{#lycee}}- parcours "{{PARCOURS}}" (required at lycée).
{{/lycee}}- Exercise ids start with "{{PREFIX}}" and are numbered 01, 02, …
- Imports must use the same relative paths as the example chapter.
- Follow the dossier for scope, progression and common mistakes.
{{#pc}}- Physique-chimie: no physique-chimie chapter exists yet; reuse only the TypeScript patterns of the mathematics example (helpers, `vary`, games), not its content. Every numeric answer carries its unit (`suffix` or `answer.unit`); measured data use `answer.sigFigs`.
{{/pc}}
Chapter specification (JSON):
{{SPEC}}

Official objectives (JSON):
{{OBJECTIVES}}

Research dossier:
{{DOSSIER}}

Return only the TypeScript file in a single ```ts code block, with no text before or after.
