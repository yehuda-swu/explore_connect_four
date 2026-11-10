# Explore Connect Four

An editable classroom game for the StandWithUs UK Explore programme. The original questions, answers and images have been restored from the files supplied on 10 November 2026.

## What is included

* **22 questions and answers** from `reference/Original_Questions.xlsx`.
* **22 working local images**, linked to their correct question. Some appear with the question and others are revealed with the answer.
* A Connect Four board, teacher controlled answers, two teams, different board sizes, optional gravity, undo and win detection.
* An image viewer link inside each question card for viewing the full image.
* An editor for question text, answer text and both image paths.
* A layout suitable for desktop screens and mobile devices.

The complete question bank and images are bundled with the site. No online spreadsheet and no external image hosting are required for normal gameplay.

## Upload the updated game to GitHub

1. Download and extract the ZIP.
2. Open your existing `explore_connect_four` repository on GitHub.
3. Upload the new `index.html`, `styles.css`, `game.js`, `questions.js`, `README.md` and the complete `assets` folder. Replace the old files when GitHub asks.
4. Uploading the `reference` folder is optional. It holds your original spreadsheet as a backup and is not needed by the game itself.
5. Select **Commit changes**.
6. Reload your GitHub Pages website. A hard refresh can help if your browser has cached an old version.

**Suggested GitHub commit message**

`Restore all 22 Explore Connect Four questions and images`

If you have a local clone of the repository, copy the extracted files into it and then run:

```bash
git add .
git commit
git push origin main
```

When the commit editor opens, enter the suggested commit message above and save.

## Where to change the design or content

| File or folder | Purpose |
| :--- | :--- |
| `index.html` | Main page, question card structure, headings and buttons |
| `styles.css` | Colours, layout, fonts, image presentation and mobile styling |
| `questions.js` | All original questions, answers, image paths, team names and game defaults |
| `game.js` | Game rules, random question logic, image display and the question editor |
| `assets/questions/` | The 22 local image files, optimised for a browser |
| `assets/IMAGE_MAP.md` | A table showing the image associated with each question |
| `reference/Original_Questions.xlsx` | Reference copy of the supplied spreadsheet |

### Editing questions in GitHub

In `questions.js`, each question is an object:

```js
{
  "id": 1,
  "question": "Who was falsely accused of spying in France?",
  "answer": "Alfred Dreyfus",
  "promptImage": "",
  "answerImage": "assets/questions/q01-answer.webp"
}
```

Set `promptImage` or `answerImage` to a path inside `assets/questions`. An empty string means no image on that side of the card. When adding your own image, upload the actual image file to the repository as well as updating the path.

### Using the teacher editor

The **Edit question bank** button lets you change questions without changing the GitHub files. One line is one question. Use four fields separated by `||`:

`Question || Answer || Prompt image path || Answer image path`

Leave an image field empty when there is no image. Changes made in the editor are saved only on that browser. They do not automatically update GitHub for other users. To publish permanent changes for everyone, edit `questions.js` in GitHub.

The teacher editor also supports CSV import and export, including both image path columns. The optional Google Sheet import is manual, not automatic. For the supplied question bank, it is safer to use the bundled questions, which already contain every image.

### A note about image formats

Images were converted to standard WebP, which is supported by current Chrome, Safari, Edge and Firefox browsers. This also makes the website significantly smaller. The original Question 10 JPEG had an incomplete file ending. It was successfully recovered and saved as a complete WebP image.

## How to play

1. Choose a board size and pick the first team.
2. Select any available square. A random question will appear, with an image if the question has one.
3. Discuss the question and choose **Reveal answer**. If the answer has an image, it appears at that point.
4. Award the square to the team that answered correctly or skip it.
5. The first team to connect four squares horizontally, vertically or diagonally wins. A three square line wins on the smallest board.

Turn on gravity to make pieces fall to the lowest empty position in the chosen column. Use Undo to reverse the most recent awarded square.

## Technical notes

This is a static HTML, CSS and JavaScript project suitable for GitHub Pages. There is no installation process and there are no paid dependencies. Image paths are relative so they also work in a repository subdirectory. The design and game code are independent of the original Flippity service.
