# Prompt commands:

The commands and numbers below are shorthand references to the corresponding prompts.

1. `_clear_logs`: "Delete all console.logs in the repo, keep all console.warns and console.errors"

2. `_add_logs`: "Add stringified, minified diagnostic console logging to the referenced files or functions"

3. `_build_plan`: "run `npm run build`, then create a plan to fix the build errors"

4. `_build_fix`: "run `npm run build` and fix the build errors"

5. `_test_plan`: "run `npm run test`, then create a plan to fix the fail cases"

6. `_test_fix`: "run `npm run test` and fix the fail cases"

7. `_test_focus_plan`: "run `npm run test` and make a plan to add unit test(s) to isolate the failing functinonality into more specific test(s)"

8. `_test_focus_fix`: "run `npm run test` and then add and run unit test(s) to isolate the failing functinonality into more specific test(s)"

9. `_test_doc`: "compare `docs/Test.md` with all tests in the repo and update the Test document to align with the actual tests. Each test case should be listed in a single line with an indented line below with the pass condition. The test document should include a numbered index at the top of the file, with an item for each of the tests in the repo, with the test command in the index item."

10. `_test_doc_fix`: "compare `docs/Test.md` with all tests in the repo and update the tests to align with the `docs/Test.md` document"

11. `_roadmap_continue`: "continue to follow the roadmap"

12. `_roadmap_commit`: "Updte the roadmap to document the completed and remaining tasks, and push a commit"
