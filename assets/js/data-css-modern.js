import { cssHas, cssIncludes } from './data-helpers.js';

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
  {
    id: 'css-m3',
    title: 'Modern CSS',
    description:
      'Three lessons on custom properties, positioning, and motion that respects the reader.',
    lessons: [
      {
        id: 'css-13',
        title: 'Values with names',
        minutes: 8,
        xp: 25,
        language: 'css',
        preview: notesPreview,
        objective: 'Store colors in custom properties and use them with var().',
        theory: [
          {
            type: 'p',
            text: 'A custom property is a value with a name. Declare it on :root and every rule on the page can use it. Change it once and the whole page follows.'
          },
          {
            type: 'code',
            lang: 'css',
            code: `:root {
  --ink: #1f1d1a;
  --paper: #f3efe6;
}

body {
  color: var(--ink);
  background: var(--paper);
}`
          },
          {
            type: 'p',
            text: 'Custom properties start with two dashes. The var() function reads one. The name is case sensitive, so --ink and --Ink are different properties.'
          },
          {
            type: 'note',
            text: 'A fallback is the second argument: var(--ink, black). It is used when the property has not been declared anywhere.'
          }
        ],
        quiz: {
          question: 'Where should a page-wide custom property be declared?',
          options: [':root', 'body', 'html:hover'],
          answer: 0,
          explanation:
            ':root matches the html element and inherits everywhere, so it is the usual home for shared tokens.'
        },
        challenge: {
          prompt:
            'Declare --ink as #1f1d1a and --paper as #f3efe6 on :root, then use them for the body color and background.',
          requirements: [
            'Declare --ink: #1f1d1a on :root.',
            'Declare --paper: #f3efe6 on :root.',
            'Set the body color to var(--ink).',
            'Set the body background to var(--paper).'
          ],
          starter: `body {
  color: #1f1d1a;
  background: #f3efe6;
}`,
          solution: `:root {
  --ink: #1f1d1a;
  --paper: #f3efe6;
}

body {
  color: var(--ink);
  background: var(--paper);
}`,
          hint: 'Declare both tokens in a :root rule, then replace the hex values in body with var().',
          tests: [
            {
              label: ':root declares --ink as #1f1d1a.',
              run: ({ css }) => cssHas(css, ':root', '--ink', '#1f1d1a')
            },
            {
              label: ':root declares --paper as #f3efe6.',
              run: ({ css }) => cssHas(css, ':root', '--paper', '#f3efe6')
            },
            {
              label: 'The body color reads var(--ink).',
              run: ({ css }) => cssHas(css, 'body', 'color', 'var(--ink)')
            },
            {
              label: 'The body background reads var(--paper).',
              run: ({ css }) => cssHas(css, 'body', 'background', 'var(--paper)')
            }
          ]
        }
      },
      {
        id: 'css-14',
        title: 'Positioning a badge',
        minutes: 9,
        xp: 25,
        language: 'css',
        preview: badgePreview,
        objective: 'Place a badge in the corner of a container with relative and absolute positioning.',
        theory: [
          {
            type: 'p',
            text: 'Normal flow places one block under the next. Positioning takes an element out of that flow when it needs to sit on top of something, like a badge on a card.'
          },
          {
            type: 'code',
            lang: 'css',
            code: `.wrap {
  position: relative;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
}`
          },
          {
            type: 'p',
            text: 'An absolutely positioned element is placed against its nearest positioned ancestor. Without position: relative on the container, the badge escapes to the page itself.'
          },
          {
            type: 'note',
            text: 'Absolute positioning removes the element from flow, so reserve space for it another way. A badge in a corner is safe because it sits over the padding.'
          }
        ],
        quiz: {
          question: 'Which position value makes a container the reference for an absolute child?',
          options: ['static', 'relative', 'absolute'],
          answer: 1,
          explanation:
            'A positioned ancestor is the reference. relative keeps the element in flow and makes it that reference.'
        },
        challenge: {
          prompt:
            'Make .wrap the positioning reference, then place .badge in its top right corner with absolute positioning.',
          requirements: [
            'Set .wrap to position: relative.',
            'Set .badge to position: absolute.',
            'Set the badge top to 0.',
            'Set the badge right to 0.'
          ],
          starter: `.wrap {
  padding: 1rem;
}

.badge {
  background: #b23a2f;
  color: #ffffff;
}`,
          solution: `.wrap {
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
          hint: 'The container needs relative and the badge needs absolute, then top and right place it in the corner.',
          tests: [
            {
              label: '.wrap is a positioning reference.',
              run: ({ css }) => cssHas(css, '.wrap', 'position', 'relative')
            },
            {
              label: '.badge is absolutely positioned.',
              run: ({ css }) => cssHas(css, '.badge', 'position', 'absolute')
            },
            {
              label: 'The badge sits at the top edge.',
              run: ({ css }) => cssHas(css, '.badge', 'top', '0')
            },
            {
              label: 'The badge sits at the right edge.',
              run: ({ css }) => cssHas(css, '.badge', 'right', '0')
            }
          ]
        }
      },
      {
        id: 'css-15',
        title: 'Motion that respects the reader',
        minutes: 9,
        xp: 25,
        language: 'css',
        preview: cardPreview,
        objective: 'Add a short hover transition and remove it for people who ask for less motion.',
        theory: [
          {
            type: 'p',
            text: 'A transition moves a property from one value to another over time. One hundred and fifty milliseconds is enough to feel smooth without delaying the reader.'
          },
          {
            type: 'code',
            lang: 'css',
            code: `.card {
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
          },
          {
            type: 'p',
            text: 'The hover rule only applies while the pointer is over the card. The media query applies when the operating system reports that the reader prefers less motion.'
          },
          {
            type: 'note',
            text: 'Transition the property that changes, not all of them. transition: all hides which properties are animating and can surprise the reader.'
          }
        ],
        quiz: {
          question: 'What does prefers-reduced-motion: reduce report?',
          options: [
            'The browser cannot animate',
            'The reader asked the system for less motion',
            'The page is on a slow connection'
          ],
          answer: 1,
          explanation:
            'It reflects a system setting. Motion is still available; the page should offer a calmer version.'
        },
        challenge: {
          prompt:
            'Transition the transform of .card over 150ms, lift it 2px on hover, and remove the transition when the reader prefers reduced motion.',
          requirements: [
            'Give .card a transition on transform of 150ms.',
            'Lift .card:hover with translateY(-2px).',
            'Inside a prefers-reduced-motion: reduce query, set .card transition to none.'
          ],
          starter: `.card {
  padding: 1rem;
  border: 1px solid #d6cfc2;
}

.card:hover {
  transform: none;
}`,
          solution: `.card {
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
          hint: 'The transition belongs on the base rule. The media query wraps a second .card rule that turns it off.',
          tests: [
            {
              label: 'The card transitions transform over 150ms.',
              run: ({ css }) => cssIncludes(css, '.card', 'transition', '150ms')
            },
            {
              label: 'The hover state lifts the card by 2px.',
              run: ({ css }) => cssHas(css, '.card:hover', 'transform', 'translateY(-2px)')
            },
            {
              label: 'Reduced motion removes the transition.',
              run: ({ css }) =>
                cssHas(css, '.card', 'transition', 'none', 'prefers-reduced-motion: reduce')
            }
          ]
        }
      }
    ]
  }
];
