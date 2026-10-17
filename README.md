# Shahzad’s Learning Hub

Personal student website by Sir Shahzad Gullab Bhatti.

Website: https://shahzadgullabbhatti.github.io/

Repository: https://github.com/shahzadgullabbhatti/shahzadgullabbhatti.github.io

## Student flow

The homepage shows four class cards. Each opens `class.html?class=9` (or 10, 11, 12), with search restricted to that class and separate sections for its available Notes, Cards and MCQs. There is no global resource library or homepage search. Test-paper files are not published.

The Portfolio navigation link and homepage picture open `portfolio.html`, containing the biography, qualifications and all nine projects from the supplied portfolio. Hovering or focusing the picture reveals About your teacher; this label stays available on touch devices. The homepage has no teacher caption, Start here label or school branding.

## Resources

| Class | Chapter | Available |
| --- | --- | --- |
| 9 | Kinematics | 16 notes sections, 50 flip cards, 50 MCQs |
| 10 | Sound | 16 notes sections, 50 flip cards, 50 MCQs |
| 11 | Kinematics | 16 notes sections, 36 flip cards, 60 MCQs |
| 12 | First Law of Thermodynamics | 16 notes sections, 36 flip cards, 60 MCQs |
| 11 | Dynamics Chapter 3 | 29 notes sections, 40 flip cards, 138 MCQs, 5 activities |
| 12 | Second Law of Thermodynamics Chapter 3 | 32 notes sections, 44 flip cards, 142 MCQs, 5 activities |
| 11 | Rotational and Circular Motion Chapter 4 | 36 notes sections, 54 flip cards, 119 MCQs, 5 activities |
| 12 | Magnetic Fields Chapter 4 | 33 notes sections, 48 flip cards, 121 MCQs, 7 activities |

## Maintain

`site` is the only published folder. `content/resources.json` defines class resources. `scripts/sync-materials.cjs` refreshes the teaching copies, new personal logo, generated notes and separate portfolio. The original class files and portfolio remain untouched. Question prompts, answers and explanations are preserved when generating the study screens. Personal logo source: `../Educators-Master/assets/new-logo.png`.

Preview with `python -m http.server 8767 --bind 127.0.0.1 --directory site`. Run `node scripts/verify-static.cjs` and the browser checks after changing navigation or content. Commit and push to `origin/main` to publish at the root address; `legacy` retains the previous project-site repository. Publishing requires no application build or package installation.

The local `portfolio-reference` and `tmp` folders are excluded from Git. The original teacher test documents remain in their class folders. Student progress is stored only in the student's browser.

## Chapter cards

Navigation is Class card → numerically ordered chapter cards → resource cards for Notes, Cards and MCQs, plus Activities in Chapter 3. Each class has its own search, and each chapter shows only its relevant resources. Chapters are grouped by subject and chapter number and sorted by chapter number. Chapter 2 is available in each class; Chapter 3 is also available in Classes 11 and 12.

Run `node scripts/sync-chapter3.cjs` after updating the prepared Class 11 or 12 Chapter 3 files. This copies the complete interactive pages, assets and coverage documentation, and updates both catalogues. The other content builders also call this sync so subsequent builds preserve Chapter 3. Chapter 3 browser checks: `node scripts/browser-qa-chapter3.cjs http://127.0.0.1:8767/`.
