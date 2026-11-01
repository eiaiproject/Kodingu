import { cssHas, cssIncludes, cssRule, textOf, textsOf } from './data-helpers.js';

const ticketPreview = `<article class="ticket">
  <div>
    <p class="ticket-label">Admit one</p>
    <h2>Kodingu field day</h2>
    <p>Room 2 · 09:30</p>
  </div>
  <p class="ticket-code">K-0042</p>
</article>`;

const quotePreview = `<figure class="quote">
  <blockquote>A page should hold the reader's attention, not the interface.</blockquote>
  <figcaption>Kodingu field notes</figcaption>
</figure>`;

const tabsPreview = `<div class="tabs">
  <div role="tablist" aria-label="Project views">
    <button role="tab" id="tab-notes" aria-controls="panel-notes" aria-selected="true" type="button">Notes</button>
    <button role="tab" id="tab-list" aria-controls="panel-list" aria-selected="false" type="button">List</button>
  </div>
  <section role="tabpanel" id="panel-notes" aria-labelledby="tab-notes">
    <p>Notes are open by default.</p>
  </section>
  <section role="tabpanel" id="panel-list" aria-labelledby="tab-list" hidden>
    <ul><li>Read the brief</li><li>Write the page</li></ul>
  </section>
</div>`;

const wordCountPreview = `<label for="note">Note</label>
<textarea id="note" rows="4"></textarea>
<p id="count">0 words</p>`;

export const extraChallenges = [
  {
    id: 'extra-html-01',
    language: 'html',
    title: 'A session card',
    minutes: 12,
    xp: 30,
    tokens: 10,
    summary: 'Build a small conference card with a time element and a real link.',
    objective: 'Mark up one event card with a heading, a machine-readable date, and a same-page link.',
    prompt:
      'Build an article for a session called "A quieter web". It takes place on November 14, 2026 in Room 2. Add a time element with a datetime attribute, and a link to #schedule that says "See the schedule".',
    requirements: [
      'Use an article element.',
      'The card has an h2 that says "A quieter web".',
      'Use a time element with datetime="2026-11-14" and the text "November 14".',
      'Include the text "Room 2".',
      'Add a link to #schedule with the text "See the schedule".'
    ],
    starter: `<!-- Build the session card here. -->\n`,
    solution: `<article class="session">
  <p class="session-track">Design</p>
  <h2>A quieter web</h2>
  <p><time datetime="2026-11-14">November 14</time> · Room 2 · 09:30</p>
  <p>A session about interfaces that leave room for the work.</p>
  <a href="#schedule">See the schedule</a>
</article>`,
    hint: 'The datetime attribute carries the machine-readable date. The visible text can be shorter and more readable.',
    tests: [
      {
        label: 'There is an article element.',
        run: ({ doc }) => doc.querySelectorAll('article').length === 1
      },
      {
        label: 'The card heading says "A quieter web".',
        run: ({ doc }) => textOf(doc, 'article h2') === 'A quieter web'
      },
      {
        label: 'The time element has datetime="2026-11-14".',
        run: ({ doc }) => Boolean(doc.querySelector('time[datetime="2026-11-14"]'))
      },
      {
        label: 'The time element says "November 14".',
        run: ({ doc }) => textOf(doc, 'time') === 'November 14'
      },
      {
        label: 'The card mentions Room 2.',
        run: ({ doc }) => textOf(doc, 'article').includes('Room 2')
      },
      {
        label: 'The link points to #schedule and says "See the schedule".',
        run: ({ doc }) =>
          Boolean(doc.querySelector('a[href="#schedule"]')) &&
          textOf(doc, 'a[href="#schedule"]') === 'See the schedule'
      }
    ]
  },
  {
    id: 'extra-html-02',
    language: 'html',
    title: 'A data table',
    minutes: 14,
    xp: 30,
    tokens: 10,
    summary: 'Turn three real course counts into a table with a caption and row headers.',
    objective: 'Build an accessible table with a caption, column headers, and row headers.',
    prompt:
      'Build a table titled "Lessons by course". The columns are Course and Lessons. Add three rows: HTML with 20, CSS with 12, and JavaScript with 8. Use scope on the headers.',
    requirements: [
      'Use one table element.',
      'Add a caption that says "Lessons by course".',
      'Add two column headers with scope="col": "Course" and "Lessons".',
      'Add three body rows.',
      'Use row headers with scope="row" for HTML, CSS, and JavaScript.',
      'The lesson counts are 20, 12, and 8.'
    ],
    starter: `<table>\n</table>\n`,
    solution: `<table>
  <caption>Lessons by course</caption>
  <thead>
    <tr>
      <th scope="col">Course</th>
      <th scope="col">Lessons</th>
    </tr>
  </thead>
  <tbody>
    <tr><th scope="row">HTML</th><td>20</td></tr>
    <tr><th scope="row">CSS</th><td>12</td></tr>
    <tr><th scope="row">JavaScript</th><td>8</td></tr>
  </tbody>
</table>`,
    hint: 'A caption belongs directly inside the table. Scope tells a screen reader whether a header names a column or a row.',
    tests: [
      {
        label: 'There is one table.',
        run: ({ doc }) => doc.querySelectorAll('table').length === 1
      },
      {
        label: 'The caption says "Lessons by course".',
        run: ({ doc }) => textOf(doc, 'caption') === 'Lessons by course'
      },
      {
        label: 'The column headers are "Course" and "Lessons".',
        run: ({ doc }) => {
          const headers = textsOf(doc, 'th[scope="col"]');
          return headers.length === 2 && headers[0] === 'Course' && headers[1] === 'Lessons';
        }
      },
      {
        label: 'There are three body rows.',
        run: ({ doc }) => doc.querySelectorAll('tbody tr').length === 3
      },
      {
        label: 'The row headers are HTML, CSS, and JavaScript.',
        run: ({ doc }) => {
          const headers = textsOf(doc, 'tbody th[scope="row"]');
          return headers.join('|') === 'HTML|CSS|JavaScript';
        }
      },
      {
        label: 'The lesson counts are 20, 12, and 8.',
        run: ({ doc }) => {
          const counts = textsOf(doc, 'tbody td');
          return counts.join('|') === '20|12|8';
        }
      }
    ]
  },
  {
    id: 'extra-css-01',
    language: 'css',
    title: 'A ticket stub',
    minutes: 14,
    xp: 30,
    tokens: 10,
    summary: 'Style a two-part ticket with a custom property, a strong edge, and a mobile stack.',
    objective: 'Use grid, a custom property, and one media query to build a ticket layout.',
    prompt:
      'Style the ticket. Use a grid with the code on the right, set a custom property --ticket-ink to #1f1d1a, give the left edge a 4px solid #b23a2f border, and space the code with 0.2em letter spacing. Below 480px, stack the ticket into one column.',
    preview: ticketPreview,
    requirements: [
      'Set --ticket-ink to #1f1d1a on .ticket.',
      'Make .ticket a grid with two columns.',
      'Add a 4px solid #b23a2f left border.',
      'Set .ticket-code letter spacing to 0.2em.',
      'Inside a max-width 480px media query, make .ticket one column.'
    ],
    starter: `.ticket {\n  padding: 1rem;\n}\n\n`,
    solution: `.ticket {
  --ticket-ink: #1f1d1a;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid #b9b0a1;
  border-left: 4px solid #b23a2f;
  color: var(--ticket-ink);
}

.ticket-code {
  font-family: "IBM Plex Mono", monospace;
  letter-spacing: 0.2em;
}

@media (max-width: 480px) {
  .ticket {
    grid-template-columns: 1fr;
  }
}`,
    hint: 'A custom property is declared like any other declaration, but its name starts with two dashes. The media query lives after the base rules.',
    tests: [
      {
        label: 'The ticket declares --ticket-ink as #1f1d1a.',
        run: ({ css }) => cssHas(css, '.ticket', '--ticket-ink', '#1f1d1a')
      },
      {
        label: 'The ticket is a grid.',
        run: ({ css }) => cssHas(css, '.ticket', 'display', 'grid')
      },
      {
        label: 'The ticket has a 4px solid left border.',
        run: ({ css }) => cssIncludes(css, '.ticket', 'border-left', '4px solid')
      },
      {
        label: 'The ticket code has 0.2em letter spacing.',
        run: ({ css }) => cssHas(css, '.ticket-code', 'letter-spacing', '0.2em')
      },
      {
        label: 'Below 480px the ticket has one column.',
        run: ({ css }) => cssHas(css, '.ticket', 'grid-template-columns', '1fr', '(max-width: 480px)')
      }
    ]
  },
  {
    id: 'extra-css-02',
    language: 'css',
    title: 'A responsive quote',
    minutes: 12,
    xp: 30,
    tokens: 10,
    summary: 'Give a quotation a measured line, a quiet rule, and a smaller mobile step.',
    objective: 'Style a figure and its quote, then tune the spacing at a narrow width.',
    prompt:
      'Center the quote at a maximum width of 34rem. Give it 1.5rem of padding and rules above and below. Remove the default blockquote margin, set the caption to #6b655b, and reduce the padding to 1rem below 640px.',
    preview: quotePreview,
    requirements: [
      'Set .quote max-width to 34rem and margin-inline to auto.',
      'Give .quote 1.5rem padding and a top and bottom border.',
      'Set the blockquote margin to 0.',
      'Set the figcaption color to #6b655b.',
      'Inside a max-width 640px media query, set .quote padding to 1rem.'
    ],
    starter: `.quote {\n  padding: 1rem;\n}\n\n`,
    solution: `.quote {
  max-width: 34rem;
  margin-inline: auto;
  padding: 1.5rem;
  border-top: 1px solid #b9b0a1;
  border-bottom: 1px solid #b9b0a1;
}

.quote blockquote {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.5;
}

.quote figcaption {
  margin-top: 0.75rem;
  color: #6b655b;
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.75rem;
}

@media (max-width: 640px) {
  .quote {
    padding: 1rem;
  }
}`,
    hint: 'The border properties are separate: border-top and border-bottom. Use margin-inline: auto to center a block with a maximum width.',
    tests: [
      {
        label: 'The quote has a maximum width of 34rem.',
        run: ({ css }) => cssHas(css, '.quote', 'max-width', '34rem')
      },
      {
        label: 'The quote is centered with margin-inline: auto.',
        run: ({ css }) => cssHas(css, '.quote', 'margin-inline', 'auto')
      },
      {
        label: 'The quote has top and bottom borders.',
        run: ({ css }) =>
          cssRule(css, '.quote')?.declarations['border-top'] &&
          cssRule(css, '.quote')?.declarations['border-bottom']
      },
      {
        label: 'The blockquote margin is 0.',
        run: ({ css }) => cssHas(css, '.quote blockquote', 'margin', '0')
      },
      {
        label: 'The caption color is #6b655b.',
        run: ({ css }) => cssHas(css, '.quote figcaption', 'color', '#6b655b')
      },
      {
        label: 'Below 640px the quote padding is 1rem.',
        run: ({ css }) => cssHas(css, '.quote', 'padding', '1rem', '(max-width: 640px)')
      }
    ]
  },
  {
    id: 'extra-js-01',
    language: 'js',
    title: 'A tab switcher',
    minutes: 16,
    xp: 35,
    tokens: 10,
    summary: 'Make two tab buttons swap their panels without reloading the page.',
    objective: 'Connect click events to aria-selected and the hidden property.',
    prompt:
      'Make the tabs switch. Clicking a tab sets aria-selected on both tabs and shows only its panel. The Notes tab starts selected. Use addEventListener.',
    preview: tabsPreview,
    requirements: [
      'Select every element with role="tab".',
      'Select every element with role="tabpanel".',
      'On click, set aria-selected to true on the clicked tab and false on the other.',
      'Show the matching panel and hide the other one with the hidden property.',
      'Keep the Notes tab selected on first load.'
    ],
    starter: `// Make the tabs switch.\n\n`,
    solution: `const tabs = document.querySelectorAll('[role="tab"]');
const panels = document.querySelectorAll('[role="tabpanel"]');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      const panel = document.querySelector('#' + item.getAttribute('aria-controls'));
      panel.hidden = !selected;
    });
  });
});`,
    hint: 'Each tab already has aria-controls pointing at its panel id. Use that attribute instead of hard-coding the panel names.',
    tests: [
      {
        label: 'The script runs without errors.',
        run: ({ error }) => !error
      },
      {
        label: 'The Notes tab starts selected.',
        run: ({ doc }) =>
          doc.querySelector('#tab-notes')?.getAttribute('aria-selected') === 'true' &&
          doc.querySelector('#panel-notes')?.hidden === false
      },
      {
        label: 'Clicking List selects it and hides the notes panel.',
        run: ({ doc }) => {
          doc.querySelector('#tab-list').click();
          return (
            doc.querySelector('#tab-list').getAttribute('aria-selected') === 'true' &&
            doc.querySelector('#tab-notes').getAttribute('aria-selected') === 'false' &&
            doc.querySelector('#panel-list').hidden === false &&
            doc.querySelector('#panel-notes').hidden === true
          );
        }
      },
      {
        label: 'Clicking Notes switches back.',
        run: ({ doc }) => {
          doc.querySelector('#tab-list').click();
          doc.querySelector('#tab-notes').click();
          return (
            doc.querySelector('#tab-notes').getAttribute('aria-selected') === 'true' &&
            doc.querySelector('#panel-list').hidden === true &&
            doc.querySelector('#panel-notes').hidden === false
          );
        }
      },
      {
        label: 'The source uses addEventListener.',
        run: ({ raw }) => raw.includes('addEventListener')
      }
    ]
  },
  {
    id: 'extra-js-02',
    language: 'js',
    title: 'A word count',
    minutes: 14,
    xp: 30,
    tokens: 10,
    summary: 'Count words as the learner types, with the right singular and plural label.',
    objective: 'Listen for input events, split text into words, and write a live count.',
    prompt:
      'Count the words in the textarea. The count starts at "0 words". Typing "one two three" should show "3 words", and one word should show "1 word". Ignore extra spaces.',
    preview: wordCountPreview,
    requirements: [
      'Select the textarea and the count paragraph.',
      'Listen for the input event on the textarea.',
      'Split the trimmed value on whitespace.',
      'Show "1 word" for one word and "3 words" for three.',
      'Show "0 words" when the textarea is empty.'
    ],
    starter: `// Update the count when the note changes.\n\n`,
    solution: `const note = document.querySelector('#note');
const count = document.querySelector('#count');

note.addEventListener('input', () => {
  const words = note.value.trim().split(/\\s+/).filter(Boolean);
  count.textContent = \`\${words.length} \${words.length === 1 ? 'word' : 'words'}\`;
});`,
    hint: 'Trim the value first, then split on whitespace. A filter that removes empty strings keeps extra spaces from becoming words.',
    tests: [
      {
        label: 'The script runs without errors.',
        run: ({ error }) => !error
      },
      {
        label: 'The count starts at "0 words".',
        run: ({ doc }) => textOf(doc, '#count') === '0 words'
      },
      {
        label: 'Typing three words shows "3 words".',
        run: ({ doc }) => {
          const note = doc.querySelector('#note');
          note.value = 'one two three';
          note.dispatchEvent(new Event('input', { bubbles: true }));
          return textOf(doc, '#count') === '3 words';
        }
      },
      {
        label: 'One word shows "1 word".',
        run: ({ doc }) => {
          const note = doc.querySelector('#note');
          note.value = 'one';
          note.dispatchEvent(new Event('input', { bubbles: true }));
          return textOf(doc, '#count') === '1 word';
        }
      },
      {
        label: 'An empty note shows "0 words".',
        run: ({ doc }) => {
          const note = doc.querySelector('#note');
          note.value = '   ';
          note.dispatchEvent(new Event('input', { bubbles: true }));
          return textOf(doc, '#count') === '0 words';
        }
      },
      {
        label: 'The source listens for the input event.',
        run: ({ raw }) => raw.includes('addEventListener') && raw.includes('input')
      }
    ]
  }
];

export function getChallenge(challengeId) {
  return extraChallenges.find((challenge) => challenge.id === challengeId) || null;
}
