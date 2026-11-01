export const projects = [
  {
    id: 'project-recipe',
    title: 'A recipe page',
    language: 'HTML',
    level: 'Beginner',
    minutes: 45,
    xp: 80,
    tokens: 20,
    summary: 'Build a semantic recipe with a header, two lists, a cook\'s note, and a link back to the top.',
    description:
      'A recipe is a useful first project because the content already has a shape: a name, ingredients, steps, and a note. You will write the page by hand and keep every part in a sensible element.',
    outcomes: [
      'Choose elements from the meaning of the content.',
      'Use an unordered list for ingredients and an ordered list for steps.',
      'Give a page a clear beginning, middle, and end.'
    ],
    steps: [
      {
        title: 'Set the document up',
        body: 'Give the page a title, a language, and one h1. Add a short intro under the h1 so a reader knows what they are making.'
      },
      {
        title: 'Write the ingredient list',
        body: 'Use a ul with one li per ingredient. Four or more items gives the page enough material to test its spacing.'
      },
      {
        title: 'Write the steps',
        body: 'Use an ol because the order matters. Keep each step to one action, and start each item with a verb.'
      },
      {
        title: 'Finish the page',
        body: 'Add a cook\'s note in an aside, then link back to the top of the page. Check the page at a narrow width.'
      }
    ],
    requirements: [
      'The page has a header with one h1 and a short intro paragraph.',
      'The ingredients use a ul with at least four li items.',
      'The steps use an ol with at least three li items.',
      'A cook\'s note sits in an aside.',
      'A same-page link returns to the top of the page.',
      'The head has a title that names the recipe.'
    ],
    related: [
      { course: 'html', lesson: 'html-01', label: 'A page is a tree' },
      { course: 'html', lesson: 'html-05', label: 'Lists, ordered and not' }
    ],
    starter: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Your recipe</title>
    <style>
      body {
        max-width: 42rem;
        margin: 2rem auto;
        padding: 0 1.25rem;
        background: #faf7f0;
        color: #1f1d1a;
        font-family: Georgia, serif;
        line-height: 1.65;
      }

      h1,
      h2 {
        line-height: 1.2;
      }

      .note {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid #b9b0a1;
        color: #4a463f;
      }
    </style>
  </head>
  <body id="top">
    <main>
      <h1>Your recipe</h1>
      <p>Write one sentence about the dish.</p>

      <h2>Ingredients</h2>
      <ul>
      </ul>

      <h2>Steps</h2>
      <ol>
      </ol>

      <aside class="note">
        <p>Add a cook's note here.</p>
      </aside>

      <p><a href="#top">Back to top</a></p>
    </main>
  </body>
</html>`
  },
  {
    id: 'project-reading',
    title: 'A reading room',
    language: 'CSS',
    level: 'Beginner',
    minutes: 60,
    xp: 100,
    tokens: 20,
    summary: 'Turn a plain article into a measured reading page with type, quotes, and a mobile step.',
    description:
      'This project is about the part of CSS that readers feel before they notice it: line length, line height, spacing, and a link that is easy to find. The HTML is already written. Your job is to make it comfortable to read.',
    outcomes: [
      'Set a readable maximum line length.',
      'Use line height and spacing to separate ideas.',
      'Add one responsive step without changing the content.'
    ],
    steps: [
      {
        title: 'Measure the line',
        body: 'Give the article a maximum width and center it. A line that runs too wide is tiring even when the type is large enough.'
      },
      {
        title: 'Set the reading rhythm',
        body: 'Increase the body line height, give the lede a little more size, and add space between sections.'
      },
      {
        title: 'Style the quote',
        body: 'Use rules above and below the blockquote instead of a decorative card. Keep the quotation itself quiet.'
      },
      {
        title: 'Add the narrow step',
        body: 'Below 640px, reduce the outer padding so the text keeps a useful width on a phone.'
      }
    ],
    requirements: [
      'The article has a maximum width of 38rem and is centered.',
      'The body line height is at least 1.65.',
      'The lede is larger than the body text.',
      'The blockquote has a top and bottom border and 1rem of vertical padding.',
      'Links use the accent color and a visible underline.',
      'A max-width 640px media query reduces the article padding to 1rem.'
    ],
    related: [
      { course: 'css', lesson: 'css-01', label: 'A rule has two parts' },
      { course: 'css', lesson: 'css-03', label: 'The cascade decides' }
    ],
    starter: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>A reading room</title>
    <style>
      :root {
        --paper: #f3efe6;
        --ink: #1f1d1a;
        --ink-soft: #4a463f;
        --accent: #b23a2f;
        --line: #b9b0a1;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: var(--paper);
        color: var(--ink);
        font-family: Georgia, serif;
      }

      article {
        max-width: 60rem;
        margin: 2rem auto;
        padding: 2rem;
      }

      .kicker {
        font-family: ui-monospace, monospace;
        font-size: 0.75rem;
        color: #6b655b;
      }

      h1 {
        max-width: 20ch;
        line-height: 1.1;
      }

      .lede {
        color: var(--ink-soft);
      }

      blockquote {
        font-size: 1.25rem;
      }

      a {
        color: var(--ink);
      }

      /* Make the reading column and the quote your own. */
    </style>
  </head>
  <body>
    <article>
      <header>
        <p class="kicker">Reading room</p>
        <h1>Notes on a quiet page</h1>
        <p class="lede">A good reading page gets out of the way.</p>
      </header>

      <p>Reading is a physical act on screen. The eye travels back to the start of the line more often than it travels down the page. A line that is too wide makes that return trip expensive.</p>

      <blockquote>A page should hold the reader's attention, not the interface.</blockquote>

      <p>Start with a comfortable measure, then adjust the space around it. A short line with generous spacing reads better than a long line squeezed to fit a wide screen.</p>

      <p><a href="#top">Back to the top</a></p>
    </article>
  </body>
</html>`
  },
  {
    id: 'project-counter',
    title: 'A field notes counter',
    language: 'JavaScript',
    level: 'Beginner',
    minutes: 60,
    xp: 100,
    tokens: 20,
    summary: 'Build a counter that adds notes, keeps the plural label correct, and resets cleanly.',
    description:
      'This is a small state machine with a page attached. You will keep one number in sync with a label, a list, and two buttons. The project is finished when every click leaves the page in a state you can explain.',
    outcomes: [
      'Keep a number, a label, and a list in sync.',
      'Handle more than one event without repeating code.',
      'Test the empty state as carefully as the happy path.'
    ],
    steps: [
      {
        title: 'Start with the state',
        body: 'Keep one count variable outside the click handlers. Read the page elements once, then use those references in the handlers.'
      },
      {
        title: 'Add a note',
        body: 'Increase the count, update the label, create an li, and append it. Use the count to write "Note 1", "Note 2", and so on.'
      },
      {
        title: 'Keep reset honest',
        body: 'Reset the count, restore "0 notes", remove the list items, and disable the Reset button again.'
      },
      {
        title: 'Test every path',
        body: 'Try one note, two notes, reset, and reset again. Check that the button state matches the list.'
      }
    ],
    requirements: [
      'Add note increases the count and appends an li that says "Note 1", "Note 2", and so on.',
      'The label says "1 note" or "2 notes" with the right plural.',
      'Reset returns the label to "0 notes" and removes every list item.',
      'Reset is disabled when the list is empty and enabled when a note exists.',
      'Both buttons use a click listener.'
    ],
    related: [
      { course: 'js', lesson: 'js-07', label: 'Events respond' },
      { course: 'js', lesson: 'js-08', label: 'Capstone: a field notes counter' }
    ],
    starter: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Field notes counter</title>
    <style>
      body {
        max-width: 38rem;
        margin: 2rem auto;
        padding: 0 1.25rem;
        background: #faf7f0;
        color: #1f1d1a;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.6;
      }

      h1 {
        line-height: 1.2;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin: 1.25rem 0;
      }

      button {
        min-height: 44px;
        padding: 0.55rem 0.9rem;
        border: 1px solid #b9b0a1;
        background: #f3efe6;
        color: #1f1d1a;
        cursor: pointer;
      }

      #notes {
        padding-left: 1.25rem;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Field notes</h1>
      <p id="count">0 notes</p>

      <div class="actions">
        <button id="add" type="button">Add note</button>
        <button id="reset" type="button" disabled>Reset</button>
      </div>

      <ul id="notes"></ul>
    </main>

    <script>
      // Add the behavior here.
    </script>
  </body>
</html>`
  },
  {
    id: 'project-studio',
    title: 'A small studio page',
    language: 'HTML, CSS, and JavaScript',
    level: 'Intermediate',
    minutes: 90,
    xp: 150,
    tokens: 20,
    summary: 'Build a one-page studio site with a responsive work grid, a skip link, and one working script.',
    description:
      'This is the capstone project. The page needs a clear structure, a layout that changes at a narrow width, visible focus, and one behavior that earns its place. The copy and the work cards are placeholders. Replace them with your own.',
    outcomes: [
      'Plan a page in sections before styling it.',
      'Build a layout that changes shape on a small screen.',
      'Connect one accessible interaction without a library.'
    ],
    steps: [
      {
        title: 'Build the structure first',
        body: 'Write the header, main, work section, contact section, and footer. Use real links to sections that exist.'
      },
      {
        title: 'Make the layout breathe',
        body: 'Set a reading width, a work grid, and a clear type scale. Add a skip link and a focus-visible outline.'
      },
      {
        title: 'Add one interaction',
        body: 'Make the Contact note button show and hide a short paragraph. Update aria-expanded and the button label, not only the hidden attribute.'
      },
      {
        title: 'Test the narrow page',
        body: 'Check 390px: no sideways scroll, the nav does not collide, and the last section is reachable. Then run the checklist.'
      }
    ],
    requirements: [
      'The page uses one header, one main, and one footer.',
      'The nav links point to #work and #contact, and both sections exist.',
      'The work grid has two columns on wide screens and one below 720px.',
      'A skip link moves focus to #main.',
      'Every focusable control has a visible focus outline.',
      'The Contact note button toggles a hidden paragraph and updates aria-expanded.',
      'The page has no horizontal overflow at 390px.'
    ],
    related: [
      { course: 'html', lesson: 'html-01', label: 'A page is a tree' },
      { course: 'css', lesson: 'css-03', label: 'The cascade decides' },
      { course: 'js', lesson: 'js-07', label: 'Events respond' }
    ],
    starter: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Your studio</title>
    <style>
      :root {
        --paper: #f3efe6;
        --ink: #1f1d1a;
        --ink-soft: #4a463f;
        --accent: #b23a2f;
        --line: #b9b0a1;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: var(--paper);
        color: var(--ink);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.6;
      }

      .skip-link {
        position: fixed;
        top: 0;
        left: 0;
        padding: 0.75rem 1rem;
        background: var(--ink);
        color: var(--paper);
        transform: translateY(-120%);
      }

      .skip-link:focus {
        transform: none;
      }

      .site-header,
      main,
      footer {
        width: min(100% - 2.5rem, 64rem);
        margin-inline: auto;
      }

      .site-header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding-block: 1.25rem;
        border-bottom: 1px solid var(--line);
      }

      .brand {
        margin: 0;
        font-weight: 600;
      }

      nav {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
      }

      nav a {
        color: var(--ink-soft);
        text-decoration: none;
      }

      .hero {
        padding-block: 3rem;
      }

      .kicker {
        color: var(--accent);
        font-family: ui-monospace, monospace;
        font-size: 0.75rem;
      }

      h1,
      h2 {
        line-height: 1.15;
      }

      .work-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .work-card {
        padding: 1rem;
        border: 1px solid var(--line);
        background: #faf7f0;
      }

      .contact {
        padding-block: 3rem;
      }

      /* Finish the layout and the narrow step. */
    </style>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>

    <header class="site-header">
      <p class="brand">Your studio</p>
      <nav aria-label="Main">
        <a href="#work">Work</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>

    <main id="main">
      <section class="hero">
        <p class="kicker">Independent studio</p>
        <h1>Small pages, made carefully.</h1>
        <p>Replace this line with one sentence about the work you want to do.</p>
      </section>

      <section id="work" aria-labelledby="work-heading">
        <h2 id="work-heading">Selected work</h2>
        <div class="work-grid">
          <article class="work-card">
            <h3>Project one</h3>
            <p>Replace this card with a real project, or remove it.</p>
          </article>
          <article class="work-card">
            <h3>Project two</h3>
            <p>Replace this card with a real project, or remove it.</p>
          </article>
        </div>
      </section>

      <section class="contact" id="contact" aria-labelledby="contact-heading">
        <h2 id="contact-heading">Contact</h2>
        <p>Replace this line with the best way to reach you.</p>
        <button id="contact-toggle" type="button" aria-expanded="false" aria-controls="contact-note">
          Contact note
        </button>
        <p id="contact-note" hidden>Add a short note about availability or the kind of work you take on.</p>
      </section>
    </main>

    <footer>
      <p>Built by you.</p>
    </footer>

    <script>
      // Wire the contact note here.
    </script>
  </body>
</html>`
  }
];

export function getProject(projectId) {
  return projects.find((project) => project.id === projectId) || null;
}
