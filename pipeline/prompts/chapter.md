Write the complete chapter file `src/lib/chapters/data/{{ID}}.ts` exporting `export const {{EXPORT}}: ChapterContent`.

- id "{{ID}}", taskId "{{TASK}}", grade "{{GRADE}}", subject "mathematiques", treeChapterId "{{TREE}}", curriculumVersion "2026-2027", title « {{TITLE}} ».
- officialObjectives: exactly the objectives listed below (same ids and texts), consolidation objectives marked as such in their `source`.
- Exercise ids start with "{{PREFIX}}" and are numbered 01, 02, …
- Imports must use the same relative paths as the example chapter.
- Follow the dossier for scope, progression and common mistakes.

Chapter specification (JSON):
{{SPEC}}

Official objectives (JSON):
{{OBJECTIVES}}

Research dossier:
{{DOSSIER}}

Return only the TypeScript file in a single ```ts code block, with no text before or after.
