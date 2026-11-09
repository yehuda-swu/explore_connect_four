/*
  EXPLORE CONNECT FOUR: EDITABLE DATA

  SOURCE_SHEET_ID is the original Google Sheet used by the Flippity game.
  SOURCE_PUBLISHED_URL is the published version provided by the user.
  The site tries to sync the sheet on startup. A successful sync replaces
  the demo questions. If it is blocked, use the CSV import in Teacher Tools.

  To permanently replace the demo questions in GitHub:
  edit the question/answer pairs in DEMO_QUESTIONS below and commit the file.

  The questions below are EXAMPLES only. They are NOT claimed to come from
  the user's Google Sheet.
*/
window.EXPLORE_CONFIG = {
  title: 'Explore Connect Four',
  sheetId: '1LNYvAKr4fljHzJX6vWXVzPoATXeDRd_GoZL_bVJHujw',
  publishedUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSRR9GnUrVD4O9j--UgoUm028vWLma3m06blQmeqm73LbAJjD64ZdQ-qgC72J5MqsHIR99rJHT7moi8/pubhtml',
  defaultBoard: '7x6',
  defaultGravity: false,
  defaultTheme: 'night',
  teamNames: ['BLUE TEAM', 'CORAL TEAM']
};
window.DEMO_QUESTIONS = [
  { question: 'In which year did the State of Israel declare independence?', answer: '1948' },
  { question: 'What is the name of Israel’s parliament?', answer: 'The Knesset' },
  { question: 'How many seats are there in the Knesset?', answer: '120' },
  { question: 'Which city is the seat of Israel’s parliament?', answer: 'Jerusalem' },
  { question: 'What does the Hebrew word “Shalom” mean?', answer: 'Peace, hello or goodbye, depending on context' },
  { question: 'What is the name of Israel’s national anthem?', answer: 'Hatikvah' },
  { question: 'Which sea lies between Israel and Jordan?', answer: 'The Dead Sea' },
  { question: 'In which year was the Six Day War?', answer: '1967' },
  { question: 'Which Israeli leader signed the peace treaty with Egypt in 1979?', answer: 'Prime Minister Menachem Begin' },
  { question: 'Which Egyptian president signed the 1979 peace treaty with Israel?', answer: 'President Anwar Sadat' },
  { question: 'What is the name of Israel’s main international airport?', answer: 'Ben Gurion Airport' },
  { question: 'Which two colours appear on the Israeli national flag?', answer: 'Blue and white' },
  { question: 'In what year were the Oslo Accords first signed?', answer: '1993' },
  { question: 'What is the usual minimum number of Knesset seats needed for a majority?', answer: '61' }
];
