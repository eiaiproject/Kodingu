import {
  challenge,
  code,
  css,
  cssIncludes,
  lesson,
  lessonModule,
  note,
  p,
  quiz
} from './lesson-builder.js';

const notesPreview = `<main>
  <h1 id="title">Field notes</h1>
  <p class="note">A quiet page.</p>
</main>`;

const badgePreview = `<div class="wrap">
  <p class="note">Field notes</p>
  <span class="badge">New</span>
</div>`;

const cardPreview = `<article class="card">
  <h2>Field notes</h2>
  <p>Short notes about the web.</p>
</article>`;

export const cssModern = [
  lessonModule(
    'css-m3',
    'Modern CSS',
    'Three lessons on custom properties, positioning, and motion that respects the reader.',
    [
      lesson(
        'css-13',
        'Values with names',
        8,
        'Store colors in custom properties and use them with var().',
        [
          p('A custom property is a value with a name. Declare it on :root and every rule on the page can use it. Change it once and the whole page follows.'),
          code(
            'css',
            `:root {
  --ink: #1f1d1a;
  --paper: #f3efe6;
}

body {
  color: var(--ink);
  background: var(--paper);
}`
          ),
          p('Custom properties start with two dashes. The var() function reads one. The name is case sensitive, so --ink and --Ink are different properties.'),
          note('A fallback is the second argument: var(--ink, black). It is used when the property has not been declared anywhere.')
        ],
        quiz(
          'Where should a page-wide custom property be declared?',
          [':root', 'body', 'html:hover'],
          0,
          ':root matches the html element and inherits everywhere, so it is the usual home for shared tokens.'
        ),
        challenge(
          'Declare --ink as #1f1d1a and --paper as #f3efe6 on :root, then use them for the body color and background.',
          [
            'Declare --ink: #1f1d1a on :root.',
            'Declare --paper: #f3efe6 on :root.',
            'Set the body color to var(--ink).',
            'Set the body background to var(--paper).'
          ],
          `body {
  color: #1f1d1a;
  background: #f3efe6;
}`,
          `:root {
  --ink: #1f1d1a;
  --paper: #f3efe6;
}

body {
  color: var(--ink);
  background: var(--paper);
}`,
          'Declare both tokens in a :root rule, then replace the hex values in body with var().',
          [
            css(':root declares --ink as #1f1d1a.', ':root', '--ink', '#1f1d1a'),
            css(':root declares --paper as #f3efe6.', ':root', '--paper', '#f3efe6'),
            css('The body color reads var(--ink).', 'body', 'color', 'var(--ink)'),
            css('The body background reads var(--paper).', 'body', 'background', 'var(--paper)')
          ]
        ),
        { language: 'css', preview: notesPreview }
      ),
      lesson(
        'css-14',
        'Positioning a badge',
        9,
        'Place a badge in the corner of a container with relative and absolute positioning.',
        [
          p('Normal flow places one block under the next. Positioning takes an element out of that flow when it needs to sit on top of something, like a badge on a card.'),
          code(
            'css',
            `.wrap {
  position: relative;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
}`
          ),
          p('An absolutely positioned element is placed against its nearest positioned ancestor. Without position: relative on the container, the badge escapes to the page itself.'),
          note('Absolute positioning removes the element from flow, so reserve space for it another way. A badge in a corner is safe because it sits over the padding.')
        ],
        quiz(
          'Which position value makes a container the reference for an absolute child?',
          ['static', 'relative', 'absolute'],
          1,
          'A positioned ancestor is the reference. relative keeps the element in flow and makes it that reference.'
        ),
        challenge(
          'Make .wrap the positioning reference, then place .badge in its top right corner with absolute positioning.',
          [
            'Set .wrap to position: relative.',
            'Set .badge to position: absolute.',
            'Set the badge top to 0.',
            'Set the badge right to 0.'
          ],
          `.wrap {
  padding: 1rem;
}

.badge {
  background: #b23a2f;
  color: #ffffff;
}`,
          `.wrap {
  position: relative;
  padding: 1rem;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #b23a2f;
  color: #ffffff;
}`,
          'The container needs relative and the badge needs absolute, then top and right place it in the corner.',
          [
            css('.wrap is a positioning reference.', '.wrap', 'position', 'relative'),
            css('.badge is absolutely positioned.', '.badge', 'position', 'absolute'),
            css('The badge sits at the top edge.', '.badge', 'top', '0'),
            css('The badge sits at the right edge.', '.badge', 'right', '0')
          ]
        ),
        { language: 'css', preview: badgePreview }
      ),
      lesson(
        'css-15',
        'Motion that respects the reader',
        9,
        'Add a short hover transition and remove it for people who ask for less motion.',
        [
          p('A transition moves a property from one value to another over time. One hundred and fifty milliseconds is enough to feel smooth without delaying the reader.'),
          code(
            'css',
            `.card {
  transition: transform 150ms ease;
}

.card:hover {
  transform: translateY(-2px);
}

@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none;
  }
}`
          ),
          p('The hover rule only applies while the pointer is over the card. The media query applies when the operating system reports that the reader prefers less motion.'),
          note('Transition the property that changes, not all of them. transition: all hides which properties are animating and can surprise the reader.')
        ],
        quiz(
          'What does prefers-reduced-motion: reduce report?',
          [
            'The browser cannot animate',
            'The reader asked the system for less motion',
            'The page is on a slow connection'
          ],
          1,
          'It reflects a system setting. Motion is still available; the page should offer a calmer version.'
        ),
        challenge(
          'Transition the transform of .card over 150ms, lift it 2px on hover, and remove the transition when the reader prefers reduced motion.',
          [
            'Give .card a transition on transform of 150ms.',
            'Lift .card:hover with translateY(-2px).',
            'Inside a prefers-reduced-motion: reduce query, set .card transition to none.'
          ],
          `.card {
  padding: 1rem;
  border: 1px solid #d6cfc2;
}

.card:hover {
  transform: none;
}`,
          `.card {
  padding: 1rem;
  border: 1px solid #d6cfc2;
  transition: transform 150ms ease;
}

.card:hover {
  transform: translateY(-2px);
}

@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none;
  }
}`,
          'The transition belongs on the base rule. The media query wraps a second .card rule that turns it off.',
          [
            cssIncludes('The card transitions transform over 150ms.', '.card', 'transition', '150ms'),
            css('The hover state lifts the card by 2px.', '.card:hover', 'transform', 'translateY(-2px)'),
            css(
              'Reduced motion removes the transition.',
              '.card',
              'transition',
              'none',
              'prefers-reduced-motion: reduce'
            )
          ]
        ),
        { language: 'css', preview: cardPreview }
      )
    ]
  )
];
