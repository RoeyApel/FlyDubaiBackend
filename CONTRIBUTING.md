# Contributing to the Platform

Welcome! Our team builds the shared infrastructure, modules, and tooling for the R&D group.
These repositories belong to Branch 100, and your contributions are exactly how we scale and improve this platform together.

We want to review and merge your code as quickly as possible.
To make that happen smoothly, we’ve set up a few pragmatic guidelines.
They exist to save _your_ time and keep our review cycles fast.

## How to Contribute Successfully

1. **Let's align first (Issues before PRs):** Except for critical hotfixes, please make sure there is an open issue before you start writing code.
   We want to agree on the approach with you early so you don't waste time building something that might conflict with the broader platform roadmap.

2. **Keep PRs small and focused:** We optimize for flow and fast feedback.
   Massive PRs are difficult to review and tend to sit in the queue longer.
   Aim for incremental, logical changes (ideally under 400 lines of code).
   If a feature is large, we encourage you to split it into smaller, easily digestible PRs.

3. **Conventional Commits:** Please format your PR title using the [Conventional Commits](https://www.conventionalcommits.org/) specification.
   This helps us automate changelogs and versioning so nobody has to do it manually!

   **Format:** `<type>(scope): <description>`

   | Type       | Description                                                 |
   | ---------- | ----------------------------------------------------------- |
   | `feat`     | A new feature                                               |
   | `fix`      | A bug fix                                                   |
   | `docs`     | Documentation changes                                       |
   | `style`    | Code style changes (formatting, missing semicolons, etc.)   |
   | `refactor` | Code refactoring (neither fixes a bug nor adds a feature)   |
   | `test`     | Adding or updating tests                                    |
   | `chore`    | Routine tasks like updating dependencies or build tools     |
   | `build`    | Changes affecting the build system or external dependencies |
   | `ci`       | Changes to CI configuration files or scripts                |
   | `perf`     | Performance improvements                                    |
   | `revert`   | Reverting a previous commit                                 |

   **Breaking changes:** a commit introduces a breaking API change when it has a `BREAKING CHANGE:` footer, or appends `!` after the type/scope. Breaking changes can be part of commits of any type.

   **Examples:**
   - `docs: correct spelling of CHANGELOG`
   - `feat(api)!: send an email to the customer when a product is shipped`
   - `feat!: drop support for Node 6` with a footer `BREAKING CHANGE: use JavaScript features not available in Node 6.`
   - `feat(lang): add Polish language`

4. **Leave it better than you found it:**
   - Please include tests for your changes to help us keep the platform stable for everyone.
   - Update the `README.md` or relevant documentation if you change an API.
   - Ensure CI is green before requesting a review.

## The RFC Process (For Major Changes)

For standard features and bug fixes, a regular GitHub Issue is perfect.
But if you are proposing a new architectural pattern, a major dependency swap, or a cross-cutting capability, we use a lightweight RFC (Request for Comments) process to hash out the details before anyone writes a line of code.

1. Open an issue proposing the idea.
2. Once we agree the problem is worth solving, copy the `docs/rfcs/0000-template.md` file in this repository.
3. Draft your RFC, rename it (e.g., `docs/rfcs/0001-new-caching-strategy.md`), and open a PR with _just_ the markdown file.
4. We will collaborate, debate, and refine the RFC together in the PR comments.
5. Once the RFC PR is merged, you have the green light to start implementing!

## Our Promise to You (The 2-Day SLA)

Your time is valuable. The Platform Team commits to providing an initial review on properly formatted PRs within **2 working days**.

To help us hit this SLA, please make sure your PR hits the quick checklist in the PR template (linked issue, tests included, green CI).
If something is missing, it delays the review process, so help us help you!
