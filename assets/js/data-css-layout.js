import { cssHas, cssRule } from './data-helpers.js';

const flexRowPreview = `<main>
  <div class="row">
    <span class="chip">One</span>
    <span class="chip">Two</span>
    <span class="chip">Three</span>
  </div>
</main>`;

const centerPreview = `<main>
  <div class="board">
    <div class="card">Centered</div>
  </div>
</main>`;

const gridPreview = `<main>
  <div class="grid">
    <div class="cell">One</div>
    <div class="cell">Two</div>
    <div class="cell">Three</div>
    <div class="cell">Four</div>
  </div>
</main>`;

const placementPreview = `<main>
  <div class="grid">
    <header class="wide">Header</header>
    <aside class="side">Index</aside>
    <section class="main">Notes</section>
  </div>
</main>`;

const responsivePreview = `<main>
  <div class="layout">
    <section class="content">Notes</section>
    <aside class="side">Index</aside>
  </div>
</main>`;

const capstonePreview = `<main class="page">
  <header class="top">
    <h1>Field notes</h1>
    <a href="#notes">Notes</a>
  </header>
  <div class="layout">
    <section class="cards" id="notes">
      <article class="card">One</article>
      <article class="card">Two</article>
    </section>
    <aside class="side">Index</aside>
  </div>
</main>`;

export const cssLayout = [
  {
    id: 'css-m2',
    title: 'Layout',
    description:
      'Six lessons on flexbox, grid, and pages that reflow from one column to two.',
    lessons: [
      {
        id: 'css-07',
        title: 'A row with flexbox',
        minutes: 8,
        xp: 25,
        language: 'css',
        preview: flexRowPreview,
        objective: 'Turn a block into a flex row with a gap between items.',
        theory: [
          {
            type: 'p',
            text: 'A block element takes the full width and stacks above the next block. Set display to flex on the parent and its children sit in a row. The parent is the flex container. The children are flex items.'
          },
          {
            type: 'code',
            lang: 'css',
            code: `.row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}`
          },
          {
            type: 'p',
            text: 'Gap sets the space between items. It does not add space at the start or end. Flex-wrap lets items move to a new line when the container is too narrow, which keeps a row readable on a phone.'
          },
          {
            type: 'note',
            text: 'Put display: flex on the container, not on each item. The container decides how its children sit.'
          }
        ],
        quiz: {
          question: 'Which property sets the space between flex items?',
          options: ['margin', 'gap', 'padding'],
          answer: 1,
          explanation: 'Gap sets the space between items. Margin adds space around an item, including its outer edge.'
        },
        challenge: {
          prompt:
            'Make the row a flex container with a 0.75rem gap, and let the chips wrap onto a new line.',
          requirements: [
            'Target the .row container.',
            'Set display to flex.',
            'Set gap to 0.75rem.',
            'Set flex-wrap to wrap.'
          ],
          starter: `/* Lay the chips out in a row. */\n\n`,
          solution: `.row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}`,
          hint: 'All three declarations belong in one .row rule. The container is the div with class row.',
          tests: [
            {
              label: 'There is a rule for .row.',
              run: ({ css }) => cssRule(css, '.row') !== null
            },
            {
              label: 'The row is a flex container.',
              run: ({ css }) => cssHas(css, '.row', 'display', 'flex')
            },
            {
              label: 'The gap is 0.75rem.',
              run: ({ css }) => cssHas(css, '.row', 'gap', '0.75rem')
            },
            {
              label: 'The items can wrap.',
              run: ({ css }) => cssHas(css, '.row', 'flex-wrap', 'wrap')
            }
          ]
        }
      },
      {
        id: 'css-08',
        title: 'Center on both axes',
        minutes: 8,
        xp: 25,
        language: 'css',
        preview: centerPreview,
        objective: 'Center one card inside a flex container with justify-content and align-items.',
        theory: [
          {
            type: 'p',
            text: 'A flex container has a main axis and a cross axis. In a row, the main axis runs left to right. Justify-content moves items along the main axis. Align-items moves them along the cross axis.'
          },
          {
            type: 'code',
            lang: 'css',
            code: `.board {
  display: flex;
  min-height: 12rem;
  justify-content: center;
  align-items: center;
}`
          },
          {
            type: 'p',
            text: 'Center on the main axis needs justify-content. Center on the cross axis needs align-items. The container needs some height before vertical centering is visible, which is why this board has a minimum height.'
          },
          {
            type: 'note',
            text: 'Justify-content uses values like flex-start, center, and space-between. Align-items uses stretch, center, and flex-start.'
          }
        ],
        quiz: {
          question: 'Which property centers flex items along the main axis?',
          options: ['align-items', 'justify-content', 'text-align'],
          answer: 1,
          explanation: 'Justify-content works on the main axis. Align-items works on the cross axis.'
        },
        challenge: {
          prompt:
            'Center the card in the board. The board should be at least 12rem tall, justify its items in the center, and align them in the center.',
          requirements: [
            'Target the .board container.',
            'Set display to flex.',
            'Set min-height to 12rem.',
            'Set justify-content to center.',
            'Set align-items to center.'
          ],
          starter: `/* Center the card on both axes. */\n\n`,
          solution: `.board {
  display: flex;
  min-height: 12rem;
  justify-content: center;
  align-items: center;
}`,
          hint: 'Justify-content handles the row. Align-items handles the cross axis.',
          tests: [
            {
              label: 'The board is a flex container.',
              run: ({ css }) => cssHas(css, '.board', 'display', 'flex')
            },
            {
              label: 'The board is at least 12rem tall.',
              run: ({ css }) => cssHas(css, '.board', 'min-height', '12rem')
            },
            {
              label: 'Items are centered on the main axis.',
              run: ({ css }) => cssHas(css, '.board', 'justify-content', 'center')
            },
            {
              label: 'Items are centered on the cross axis.',
              run: ({ css }) => cssHas(css, '.board', 'align-items', 'center')
            }
          ]
        }
      },
      {
        id: 'css-09',
        title: 'Grid tracks',
        minutes: 9,
        xp: 25,
        language: 'css',
        preview: gridPreview,
        objective: 'Build a two-column grid with equal tracks and a gap.',
        theory: [
          {
            type: 'p',
            text: 'Grid works in two directions at once. Display grid turns the parent into a grid container. Grid-template-columns lists the column tracks. A fraction unit, written fr, takes one share of the space that is left.'
          },
          {
            type: 'code',
            lang: 'css',
            code: `.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}`
          },
          {
            type: 'p',
            text: 'Repeat(2, 1fr) means two equal columns. It is shorter than writing 1fr 1fr and easier to change. Gap sets the space between rows and columns.'
          },
          {
            type: 'note',
            text: 'A grid item can be smaller than its track, but the track still keeps its share of the row. Use minmax(0, 1fr) when long content needs to shrink.'
          }
        ],
        quiz: {
          question: 'What does 1fr mean in a grid track?',
          options: ['One fixed row', 'One share of the free space', 'One pixel'],
          answer: 1,
          explanation: 'A fraction unit takes one share of the space left after fixed tracks and gaps.'
        },
        challenge: {
          prompt:
            'Turn the grid into a two-column layout with equal tracks and a 1rem gap.',
          requirements: [
            'Target the .grid container.',
            'Set display to grid.',
            'Set grid-template-columns to repeat(2, 1fr).',
            'Set gap to 1rem.'
          ],
          starter: `/* Two equal columns. */\n\n`,
          solution: `.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}`,
          hint: 'The track list goes on the container. Repeat(2, 1fr) and 1fr 1fr describe the same two columns.',
          tests: [
            {
              label: 'The grid is a grid container.',
              run: ({ css }) => cssHas(css, '.grid', 'display', 'grid')
            },
            {
              label: 'There are two equal columns.',
              run: ({ css }) => cssHas(css, '.grid', 'grid-template-columns', 'repeat(2, 1fr)')
            },
            {
              label: 'The gap is 1rem.',
              run: ({ css }) => cssHas(css, '.grid', 'gap', '1rem')
            }
          ]
        }
      },
      {
        id: 'css-10',
        title: 'Place items on the grid',
        minutes: 9,
        xp: 25,
        language: 'css',
        preview: placementPreview,
        objective: 'Span one item across every column of a two-column grid.',
        theory: [
          {
            type: 'p',
            text: 'Grid items land in the next open cell, row by row. You can place one item by hand. Grid-column: 1 / -1 starts at the first column line and ends at the last one, so the item spans the full row.'
          },
          {
            type: 'code',
            lang: 'css',
            code: `.grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
}

.wide {
  grid-column: 1 / -1;
}`
          },
          {
            type: 'p',
            text: 'The first column takes one share and the second takes two. The header spans both, then the side and main sections fill the next row in that order.'
          },
          {
            type: 'note',
            text: 'Line numbers start at 1. The last line is -1. Spanning 1 / -1 works even when the number of columns changes later.'
          }
        ],
        quiz: {
          question: 'What does grid-column: 1 / -1 do?',
          options: [
            'Places the item in the first cell only.',
            'Spans the item from the first line to the last line.',
            'Moves the item one column to the left.'
          ],
          answer: 1,
          explanation: 'Line 1 is the start, and -1 is the last line, so the item covers every column.'
        },
        challenge: {
          prompt:
            'Build a two-column grid where the first column takes one share and the second takes two. Make the header span the full row.',
          requirements: [
            'Target the .grid container.',
            'Set display to grid.',
            'Set grid-template-columns to 1fr 2fr.',
            'Set gap to 1rem.',
            'Make .wide span from the first line to the last line.'
          ],
          starter: `/* Two tracks, one full-width header. */\n\n`,
          solution: `.grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
}

.wide {
  grid-column: 1 / -1;
}`,
          hint: 'The header gets its own .wide rule. Grid-column: 1 / -1 spans the full grid.',
          tests: [
            {
              label: 'The grid is a grid container.',
              run: ({ css }) => cssHas(css, '.grid', 'display', 'grid')
            },
            {
              label: 'The columns are 1fr and 2fr.',
              run: ({ css }) => cssHas(css, '.grid', 'grid-template-columns', '1fr 2fr')
            },
            {
              label: 'The gap is 1rem.',
              run: ({ css }) => cssHas(css, '.grid', 'gap', '1rem')
            },
            {
              label: 'The wide item spans every column.',
              run: ({ css }) => cssHas(css, '.wide', 'grid-column', '1 / -1')
            }
          ]
        }
      },
      {
        id: 'css-11',
        title: 'A page that bends',
        minutes: 10,
        xp: 25,
        language: 'css',
        preview: responsivePreview,
        objective: 'Start with one column and add a second column at a wider screen.',
        theory: [
          {
            type: 'p',
            text: 'A responsive page starts with the small screen. Write the one-column layout first, then add a media query for wider screens. This keeps the phone layout simple instead of overriding a desktop layout.'
          },
          {
            type: 'code',
            lang: 'css',
            code: `.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .layout {
    grid-template-columns: 2fr 1fr;
  }
}`
          },
          {
            type: 'p',
            text: 'A media query applies its rules only when the condition is true. Min-width: 640px means 640 pixels and wider. Below that, the single column stays in place.'
          },
          {
            type: 'note',
            text: 'Use em or rem in breakpoints when you can. They follow the reader font size, while pixels stay fixed.'
          }
        ],
        quiz: {
          question: 'When does a (min-width: 640px) media query apply?',
          options: ['Only at exactly 640px', 'At 640px and wider', 'At 640px and narrower'],
          answer: 1,
          explanation: 'Min-width is a lower bound. The rules apply at 640px and every wider viewport.'
        },
        challenge: {
          prompt:
            'Start the layout as one column with a 1.5rem gap. At 640px and wider, change it to a 2fr and 1fr grid.',
          requirements: [
            'Set .layout display to grid.',
            'Set the base grid-template-columns to 1fr.',
            'Set the gap to 1.5rem.',
            'Add a media query for min-width: 640px.',
            'Inside the media query, set .layout grid-template-columns to 2fr 1fr.'
          ],
          starter: `/* One column first, then two. */\n\n`,
          solution: `.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .layout {
    grid-template-columns: 2fr 1fr;
  }
}`,
          hint: 'The base rule holds one column. The wider rule belongs inside @media (min-width: 640px).',
          tests: [
            {
              label: 'The layout is a grid container.',
              run: ({ css }) => cssHas(css, '.layout', 'display', 'grid')
            },
            {
              label: 'The small screen uses one column.',
              run: ({ css }) => cssHas(css, '.layout', 'grid-template-columns', '1fr')
            },
            {
              label: 'The gap is 1.5rem.',
              run: ({ css }) => cssHas(css, '.layout', 'gap', '1.5rem')
            },
            {
              label: 'The wider screen gets two columns.',
              run: ({ css }) => cssHas(css, '.layout', 'grid-template-columns', '2fr 1fr', 'min-width: 640px')
            },
            {
              label: 'There is a min-width 640px media query.',
              run: ({ css }) => /@media[^{]*min-width: *640px/i.test(css)
            }
          ]
        }
      },
      {
        id: 'css-12',
        title: 'Capstone: a responsive notes page',
        minutes: 14,
        xp: 40,
        language: 'css',
        preview: capstonePreview,
        objective: 'Build a full page with a flexible header, a responsive layout, and a card grid.',
        theory: [
          {
            type: 'p',
            text: 'This page brings the layout module together. The page is centered and capped at a readable width. The header is a flex row that wraps. The body starts as one column, then splits into content and an index at 720 pixels.'
          },
          {
            type: 'code',
            lang: 'css',
            code: `.page {
  max-width: 60rem;
  margin: 0 auto;
  padding: 1.5rem;
}

.top {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
}`
          },
          {
            type: 'p',
            text: 'The cards use their own grid. One column on a phone, two equal columns from 720 pixels. The outer layout can change at the same breakpoint or a different one.'
          },
          {
            type: 'note',
            text: 'Keep the small screen rules outside the media query. The media query should add to the base layout, not repeat it.'
          }
        ],
        quiz: {
          question: 'Which rule keeps the page from growing wider than 60rem?',
          options: ['width: 100%', 'max-width: 60rem', 'min-width: 60rem'],
          answer: 1,
          explanation: 'Max-width caps the page at 60rem while still allowing it to shrink on a phone.'
        },
        challenge: {
          prompt:
            'Style the field notes page: a centered page, a wrapping header, a one-column body that becomes two columns at 720px, and a one-column card grid that becomes two columns at the same breakpoint.',
          requirements: [
            'Set .page max-width to 60rem, margin to 0 auto, and padding to 1.5rem.',
            'Set .top display to flex, flex-wrap to wrap, gap to 1rem, align-items to center, and justify-content to space-between.',
            'Set .layout display to grid, grid-template-columns to 1fr, and gap to 1.5rem.',
            'Set .cards display to grid, grid-template-columns to 1fr, and gap to 1rem.',
            'At min-width 720px, set .layout to 2fr 1fr and .cards to repeat(2, 1fr).'
          ],
          starter: `/* Build the page from the outside in. */\n\n`,
          solution: `.page {
  max-width: 60rem;
  margin: 0 auto;
  padding: 1.5rem;
}

.top {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
}

.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 720px) {
  .layout {
    grid-template-columns: 2fr 1fr;
  }

  .cards {
    grid-template-columns: repeat(2, 1fr);
  }
}`,
          hint: 'Write the small screen layout first. The 720px media query changes only the two grid-template-columns values.',
          tests: [
            {
              label: 'The page is capped at 60rem.',
              run: ({ css }) => cssHas(css, '.page', 'max-width', '60rem')
            },
            {
              label: 'The page is centered with auto side margins.',
              run: ({ css }) => cssHas(css, '.page', 'margin', '0 auto')
            },
            {
              label: 'The header is a wrapping flex row.',
              run: ({ css }) =>
                cssHas(css, '.top', 'display', 'flex') &&
                cssHas(css, '.top', 'flex-wrap', 'wrap')
            },
            {
              label: 'The header spreads its items apart.',
              run: ({ css }) => cssHas(css, '.top', 'justify-content', 'space-between')
            },
            {
              label: 'The page body starts with one column.',
              run: ({ css }) => cssHas(css, '.layout', 'grid-template-columns', '1fr')
            },
            {
              label: 'The cards start with one column.',
              run: ({ css }) => cssHas(css, '.cards', 'grid-template-columns', '1fr')
            },
            {
              label: 'At 720px the page body gets two columns.',
              run: ({ css }) => cssHas(css, '.layout', 'grid-template-columns', '2fr 1fr', 'min-width: 720px')
            },
            {
              label: 'At 720px the cards get two equal columns.',
              run: ({ css }) => cssHas(css, '.cards', 'grid-template-columns', 'repeat(2, 1fr)', 'min-width: 720px')
            }
          ]
        }
      }
    ]
  }
];
