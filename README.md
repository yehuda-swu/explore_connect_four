# Explore Connect Four

An independent, editable classroom version of a Flippity Connecto style game, prepared for StandWithUs UK's Explore programme.

## Files

* `index.html`: the website layout and page content
* `styles.css`: colours, fonts, board appearance and responsive design
* `game.js`: turns, random questions, scorekeeping, win detection and the sheet importer
* `questions.js`: Google Sheet links, default options and example questions
* `assets/favicon.svg`: simple game icon

Everything is plain HTML, CSS and JavaScript. There are no external libraries, build tools, accounts or usage charges. The site is suitable for GitHub Pages.

## Upload to GitHub Pages

1. Create a **public** GitHub repository, for example `explore-connect-four`.
2. Extract this ZIP on your computer.
3. In the new repository choose **Add file**, then **Upload files**.
4. Upload `index.html`, `styles.css`, `game.js`, `questions.js` and the `assets` folder. `index.html` must be at the repository root.
5. Select **Commit changes**.
6. Open **Settings**, then **Pages**. Under **Build and deployment**, choose **Deploy from a branch**.
7. Select the `main` branch and `/ (root)` folder, then save.
8. GitHub will display your published website address under Pages.

Suggested commit message:

`Create Explore Connect Four classroom game`

Optional Git commands when working with a local clone:

```bash
git add .
git commit -m "Create Explore Connect Four classroom game"
git push origin main
```

## How to play

Two teams compete to connect four squares horizontally, vertically or diagonally. Choose an open square to display a random question. The teacher checks the answer and awards the square to either team, or leaves it free. The next team then takes a turn. The smallest 3 × 3 board requires three connected squares. The board includes a gravity option, as in classic Connect Four. Questions are shuffled. Once all have been used, the questions are shuffled again and reused. A winning line is detected automatically.

## Your original Google Sheet

The project is configured with the two links supplied in the conversation:

* Original Flippity spreadsheet ID: `1LNYvAKr4fljHzJX6vWXVzPoATXeDRd_GoZL_bVJHujw`
* Published Google Sheet: `https://docs.google.com/spreadsheets/d/e/2PACX-1vSRR9GnUrVD4O9j--UgoUm028vWLma3m06blQmeqm73LbAJjD64ZdQ-qgC72J5MqsHIR99rJHT7moi8/pubhtml`

The website **attempts to load questions from the published sheet automatically**. The source must remain published to the web. It first tries Google's published CSV endpoint and then Google's public table endpoint. Some sheets and browser configurations prevent these access methods. We could read the spreadsheet title but **could not verify and embed the actual question rows while preparing this ZIP**, so the initial `questions.js` contains clearly marked example questions only. The site will label those **DEMO QUESTIONS**, rather than implying they are your original content.

If the connection succeeds, the example questions are replaced with the original questions. The game marks the source **GOOGLE SHEET LOADED**.

If it fails, use the guaranteed manual import:

1. Open the original Google Sheet.
2. Select the tab containing the question list.
3. Choose **File**, **Download**, **Comma Separated Values (.csv)**. The file should have `Prompt` and `Answer` column headings. If you have an older Flippity template, this may require copying just the question and answer columns into a new sheet.
4. In the website, select **Edit question bank**, then **Import CSV**.
5. Check the questions in the editor, then select **Save question bank**.

Your imported questions are saved in that browser. They will not change the website for other visitors. To make your imported questions available to everyone, copy them into `questions.js` in the repository and commit the update, or keep the Google Sheet public so the live sync works.

## Editing questions directly

From the website choose **Edit question bank**. One line is one question, optionally followed by two vertical bars and the answer:

```text
In which year was Israel founded? || 1948
What is Israel's parliament called? || The Knesset
```

Choose **Save question bank**. You can also export a CSV for backup. The browser saves your changes using local storage.

To publish changes for every visitor, edit the `DEMO_QUESTIONS` array in `questions.js`, or use a published Google Sheet and the automatic loader. Changing `questions.js` is simplest if you want a self contained game without relying on Google.

## Change the design

Open `styles.css` and edit the variables at the top of the file. For example:

```css
--page: #071427;
--blue: #4daffd;
--orange: #ff8d6d;
--board: #17478e;
```

The HTML has a text treatment for EXPLORE and STANDWITHUS UK. No official brand image files are included. You can replace the `.brand` content in `index.html` with your own transparent logo images and style them through CSS.

Use `questions.js` to modify the default grid size, gravity setting, team names and Google source URLs. The game includes night mode and day mode, both of which can be redesigned in `styles.css`.

## Notes

* The teacher manually decides who answered correctly. There is no automatic marking of free text answers.
* The game runs in a browser. It does not require a server other than GitHub Pages.
* The history and win detection are local to each browser session. Undo works for the most recent claimed squares.
* The original Flippity site is a reference for the classroom game mechanic. This project has independently written code and a distinct design.
* The spreadsheet has been configured for loading, but its actual rows were not independently verified in the ZIP.
