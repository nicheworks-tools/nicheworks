# Execution Plan - Form Tool Selector Improvement

This plan outlines the improvements to the Form Tool Selector to provide combination-aware setup guidance, complexity assessment, and specific attention rules.

## 1. Create Execution Plan
- Create this file: `.agent/plans/form-tool-selector-improvement.md`
- Verify creation with `ls -l .agent/plans/form-tool-selector-improvement.md`

## 2. Enhance Data Structures in `app.js`
- Update `toolList` to include more relevant tags for better matching.
- Define `setupDirectionRules`: A list of rules that match requirement combinations to specific setup directions (e.g., "form + specialist payment layer").
- Define `combinationAttentionRules`: A list of rules for operational notes when specific requirements are selected together (e.g., "upload + privacy").
- Implement `getComplexity(requirements)`: A deterministic function to assess complexity (Simple/Moderate/High) and provide a reason.
- Verify changes by reading the modified `app.js`.

## 3. Improve Scoring Logic in `app.js`
- Update `scoreTool` to handle multi-requirement selections more meaningfully.
- Update `buildRecommendationData` to clearly distinguish matched from missing requirements and ensure deterministic ranking.
- Verify logic changes by reading `app.js`.

## 4. Update UI in `index.html`
- Add a new container `<div id="setupDirectionSection"></div>` before the candidate list.
- Ensure proper `data-i18n` attributes for static labels if any.
- Verify `index.html` changes.

## 5. Implement Rendering and Output Logic in `app.js`
- Update `render()` to include the new Setup Direction, Complexity, and Attention Notes in the UI.
- Update `makeText()`, `makeMemo()`, and `toMarkdown()` to include all new information in generated outputs (copied text, TXT, Markdown).
- Ensure JA/EN switching correctly regenerates all content.
- Verify `app.js` changes.

## 6. Update Styles in `style.css`
- Add CSS classes for the new setup direction section, complexity badges, and attention note boxes.
- Ensure the layout remains responsive and consistent with NicheWorks specs.
- Verify `style.css` changes.

## 7. Comprehensive Validation
- Verify the 20 scenarios listed in the task description:
    1. No requirements selected
    2. One simple requirement selected
    3. upload + privacy
    4. payments + privacy
    5. payments + free-first
    6. upload + free-first
    7. multilingual + notifications/integrations
    8. upload + payments + notifications
    9. All requirements selected
    10. JA → EN switching after generating results
    11. EN → JA switching after generating results
    12. Copy results
    13. Copy memo
    14. TXT export
    15. Markdown export
    16. Quick Start sample
    17. Desktop-width layout
    18. Mobile-width layout
    19. Console has no errors
    20. Final changed-files review

## 8. Complete pre-commit steps
- Ensure proper testing, verification, review, and reflection are done.

## 9. Submit
- Commit and submit the changes.
