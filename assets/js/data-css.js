import {
  colorContrast,
  cssHas,
  cssIncludes,
  cssOrder,
  cssRule,
  cssValue,
  parseColor
} from './data-helpers.js';

const notesPreview = `<header>
  <h1>Field notes</h1>
  <p id="intro" class="note">A quiet page about structure and style.</p>
</header>
<main>
  <p>Read the <span class="term">notes</span> first.</p>
  <p class="note">Style comes after structure.</p>
  <p><a href="#intro">Back to the intro</a></p>
</main>`;

const cardPreview = `<main>
  <div class="card">
    <h2>A card</h2>
    <p>Padding, border, and margin decide how this box sits on the page.</p>
  </div>
</main>`;

export const cssFoundations = [
  {
    id: 'css-m1',
    title: 'Foundations',
    description:
      'Six lessons on rules, selectors, the cascade, color, type, and the box model.',
    lessons: [
      {
        id: 'css-01',
        title: 'A rule has two parts',
        minutes: 7,
        xp: 25,
        language: 'css',
        preview: notesPreview,
        objective: 'Write a CSS rule with a selector and a declaration.',
        theory: [
          {
            type: 'p',
            text: 'A CSS rule points at an element and says how it should look. The selector comes first, then a block of declarations in braces. Each declaration is a property, a colon, a value, and a semicolon.'
          },
          {
            type: 'code',
            lang: 'css',
            code: `h1 {
  color: #b23a2f;
}`
          },
          {
            type: 'p',
            text: 'This rule selects every h1 on the page and sets its text color. The selector is h1. The declaration is color: #b23a2f. The semicolon ends the declaration.'
          },
          {
            type: 'note',
            text: 'CSS comments use /* and */. They are useful for section labels, but do not leave commented-out code behind.'
          }
        ],
        quiz: {
          question: 'What is the part before the braces called?',
          options: ['The selector', 'The declaration', 'The property'],
          answer: 0,
          explanation: 'The selector points at the elements. The declarations inside the braces set the properties.'
        },
        challenge: {
          prompt: 'Write one rule that selects every h1 and sets its color to #b23a2f.',
          requirements: [
            'Use the h1 selector.',
            'Set color to #b23a2f.',
            'Put the declaration inside braces and end it with a semicolon.'
          ],
          starter: `/* Write your first rule below. */

`,
          solution: `h1 {
  color: #b23a2f;
}`,
          hint: 'Write the selector, open a brace, write color: #b23a2f; and close the brace.',
          tests: [
            {
              label: 'There is a rule for h1.',
              run: ({ css }) => cssRule(css, 'h1') !== null
            },
            {
              label: 'The h1 color is #b23a2f.',
              run: ({ css }) => cssHas(css, 'h1', 'color', '#b23a2f')
            },
            {
              label: 'The rule has an opening and a closing brace.',
              run: ({ raw }) => raw.includes('{') && raw.includes('}')
            }
          ]
        }
      },
      {
        id: 'css-02',
        title: 'Selectors point at elements',
        minutes: 8,
        xp: 25,
        language: 'css',
        preview: notesPreview,
        objective: 'Target an element, a class, and an id with the right selector.',
        theory: [
          {
            type: 'p',
            text: 'An element selector names a tag: p, h1, a. A class selector starts with a dot and matches class="note". An id selector starts with a hash and matches id="intro".'
          },
          {
            type: 'code',
            lang: 'css',
            code: `p {
  color: #1f1d1a;
}

.note {
  color: #b23a2f;
}

#intro {
  font-weight: 600;
}`
          },
          {
            type: 'p',
            text: 'Classes are for groups, so they are the usual choice for styling. Ids are for one element. An id is also more specific than a class, which matters when two rules set the same property.'
          },
          {
            type: 'note',
            text: 'A selector only needs enough detail to find the element. Long chains of tags and classes are hard to reuse.'
          }
        ],
        quiz: {
          question: 'Which selector targets class="note"?',
          options: ['#note', '.note', 'note'],
          answer: 1,
          explanation: 'A dot marks a class selector. A hash marks an id, and a bare word marks an element.'
        },
        challenge: {
          prompt:
            'Write three rules: paragraphs in ink, notes in vermilion, and the intro in semibold.',
          requirements: [
            'Set p color to #1f1d1a.',
            'Set .note color to #b23a2f.',
            'Set #intro font-weight to 600.'
          ],
          starter: `/* Three selectors, three jobs. */

`,
          solution: `p {
  color: #1f1d1a;
}

.note {
  color: #b23a2f;
}

#intro {
  font-weight: 600;
}`,
          hint: 'The class selector starts with a dot. The id selector starts with a hash.',
          tests: [
            {
              label: 'Paragraphs are set to #1f1d1a.',
              run: ({ css }) => cssHas(css, 'p', 'color', '#1f1d1a')
            },
            {
              label: 'The note class is set to #b23a2f.',
              run: ({ css }) => cssHas(css, '.note', 'color', '#b23a2f')
            },
            {
              label: 'The intro id has a font weight of 600.',
              run: ({ css }) => cssHas(css, '#intro', 'font-weight', '600')
            },
            {
              label: 'All three rules use braces.',
              run: ({ css }) => cssRule(css, 'p') && cssRule(css, '.note') && cssRule(css, '#intro')
            }
          ]
        }
      },
      {
        id: 'css-03',
        title: 'The cascade decides',
        minutes: 9,
        xp: 25,
        language: 'css',
        preview: notesPreview,
        objective: 'Use specificity and order to decide which color wins.',
        theory: [
          {
            type: 'p',
            text: 'When two rules set the same property on the same element, the browser has to choose. Specificity decides first. An id beats a class, and a class beats an element. If specificity ties, the later rule wins.'
          },
          {
            type: 'code',
            lang: 'css',
            code: `.note {
  color: #1f1d1a;
}

p.note {
  color: #b23a2f;
}`
          },
          {
            type: 'p',
            text: 'The second selector is an element and a class. It is more specific than the class alone, so the vermilion wins even though both rules match the same paragraph.'
          },
          {
            type: 'note',
            text: 'Do not fight the cascade with !important. Fix the selector instead. Important is for rare cases like third-party overrides.'
          }
        ],
        quiz: {
          question: 'Two rules have equal specificity. Which one wins?',
          options: ['The first one', 'The later one', 'The one with more declarations'],
          answer: 1,
          explanation: 'With equal specificity, the rule that appears later in the stylesheet wins.'
        },
        challenge: {
          prompt:
            'Write a class rule that sets notes to ink, then a more specific rule that sets notes inside a paragraph to vermilion.',
          requirements: [
            'Set .note color to #1f1d1a.',
            'Set p.note color to #b23a2f.',
            'Put the .note rule before the p.note rule.'
          ],
          starter: `/* Let the cascade do the work. */

`,
          solution: `.note {
  color: #1f1d1a;
}

p.note {
  color: #b23a2f;
}`,
          hint: 'The more specific selector is p.note. Keep it after the simpler .note rule.',
          tests: [
            {
              label: 'The note class sets color to #1f1d1a.',
              run: ({ css }) => cssHas(css, '.note', 'color', '#1f1d1a')
            },
            {
              label: 'The p.note rule sets color to #b23a2f.',
              run: ({ css }) => cssHas(css, 'p.note', 'color', '#b23a2f')
            },
            {
              label: 'The .note rule comes before p.note.',
              run: ({ css }) => cssOrder(css, ['.note', 'p.note'])
            }
          ]
        }
      },
      {
        id: 'css-04',
        title: 'Color and contrast',
        minutes: 9,
        xp: 25,
        language: 'css',
        preview: notesPreview,
        objective: 'Set readable text and background colors with enough contrast.',
        theory: [
          {
            type: 'p',
            text: 'Color sets the text. Background-color sets the surface behind it. The two need enough contrast to read. WCAG AA asks for at least 4.5:1 for normal body text and 3:1 for large text.'
          },
          {
            type: 'code',
            lang: 'css',
            code: `body {
  color: #1f1d1a;
  background-color: #f3efe6;
}

a {
  color: #b23a2f;
}`
          },
          {
            type: 'p',
            text: 'Contrast is a ratio, not a feeling. Dark ink on warm paper is easy to read. A pale gray on white may look calm and still fail.'
          },
          {
            type: 'note',
            text: 'Do not use color alone to carry meaning. Add a label, a line, or another cue.'
          }
        ],
        quiz: {
          question: 'What is the WCAG AA minimum for normal body text?',
          options: ['2:1', '3:1', '4.5:1'],
          answer: 2,
          explanation: 'Normal text needs at least 4.5:1. Large text needs at least 3:1.'
        },
        challenge: {
          prompt:
            'Set the page text to #1f1d1a on #f3efe6, and make links #b23a2f. Both pairs should pass 4.5:1.',
          requirements: [
            'Set body color to #1f1d1a.',
            'Set body background-color to #f3efe6.',
            'Set a color to #b23a2f.',
            'Both text pairs must reach 4.5:1 contrast.'
          ],
          starter: `/* Readable by design. */

`,
          solution: `body {
  color: #1f1d1a;
  background-color: #f3efe6;
}

a {
  color: #b23a2f;
}`,
          hint: 'The contrast test reads the body color, the body background, and the link color.',
          tests: [
            {
              label: 'The body text is #1f1d1a.',
              run: ({ css }) => cssHas(css, 'body', 'color', '#1f1d1a')
            },
            {
              label: 'The body background is #f3efe6.',
              run: ({ css }) => cssHas(css, 'body', 'background-color', '#f3efe6')
            },
            {
              label: 'Links are #b23a2f.',
              run: ({ css }) => cssHas(css, 'a', 'color', '#b23a2f')
            },
            {
              label: 'Body text reaches 4.5:1 against the background.',
              run: ({ css }) => {
                const ink = parseColor(cssValue(css, 'body', 'color'));
                const paper = parseColor(cssValue(css, 'body', 'background-color'));
                return colorContrast(ink, paper) >= 4.5;
              }
            },
            {
              label: 'Link text reaches 4.5:1 against the background.',
              run: ({ css }) => {
                const link = parseColor(cssValue(css, 'a', 'color'));
                const paper = parseColor(cssValue(css, 'body', 'background-color'));
                return colorContrast(link, paper) >= 4.5;
              }
            }
          ]
        }
      },
      {
        id: 'css-05',
        title: 'Type and spacing',
        minutes: 8,
        xp: 25,
        language: 'css',
        preview: notesPreview,
        objective: 'Set a type stack, a readable line height, and simple spacing.',
        theory: [
          {
            type: 'p',
            text: 'Font-family takes a list. The browser uses the first font it can find, so end the list with a generic family like serif or sans-serif. Font-size sets the scale. Line-height sets the space between lines.'
          },
          {
            type: 'code',
            lang: 'css',
            code: `body {
  font-family: Georgia, serif;
  font-size: 1rem;
  line-height: 1.6;
}

h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

p {
  margin-bottom: 1rem;
}`
          },
          {
            type: 'p',
            text: 'A unitless line-height is a multiplier of the font size, so it scales when the text grows. A pixel line-height stays fixed and can crowd larger text.'
          },
          {
            type: 'note',
            text: 'Use a small type scale. Two or three sizes are usually enough for a lesson page.'
          }
        ],
        quiz: {
          question: 'Which line-height scales with the font size?',
          options: ['24px', '1.6', '0.2in'],
          answer: 1,
          explanation: 'A unitless value multiplies the font size. Pixel and inch values stay fixed.'
        },
        challenge: {
          prompt:
            'Set a serif body at 1rem with a 1.6 line height. Make h1 2rem and give paragraphs a 1rem bottom margin.',
          requirements: [
            'Set body font-family to Georgia with a serif fallback.',
            'Set body font-size to 1rem and line-height to 1.6.',
            'Set h1 font-size to 2rem.',
            'Set p margin-bottom to 1rem.'
          ],
          starter: `/* Type first, decoration later. */

`,
          solution: `body {
  font-family: Georgia, serif;
  font-size: 1rem;
  line-height: 1.6;
}

h1 {
  font-size: 2rem;
}

p {
  margin-bottom: 1rem;
}`,
          hint: 'The body rule holds the base type. The h1 and p rules adjust the scale and spacing.',
          tests: [
            {
              label: 'The body uses a Georgia stack with a serif fallback.',
              run: ({ css }) =>
                cssIncludes(css, 'body', 'font-family', 'georgia') &&
                cssIncludes(css, 'body', 'font-family', 'serif')
            },
            {
              label: 'The body font size is 1rem.',
              run: ({ css }) => cssHas(css, 'body', 'font-size', '1rem')
            },
            {
              label: 'The body line height is 1.6.',
              run: ({ css }) => cssHas(css, 'body', 'line-height', '1.6')
            },
            {
              label: 'The h1 font size is 2rem.',
              run: ({ css }) => cssHas(css, 'h1', 'font-size', '2rem')
            },
            {
              label: 'Paragraphs have a 1rem bottom margin.',
              run: ({ css }) => cssHas(css, 'p', 'margin-bottom', '1rem')
            }
          ]
        }
      },
      {
        id: 'css-06',
        title: 'The box model',
        minutes: 9,
        xp: 25,
        language: 'css',
        preview: cardPreview,
        objective: 'Build a card with padding, a border, a margin, and border-box sizing.',
        theory: [
          {
            type: 'p',
            text: 'Every element is a box. The content sits in the middle. Padding is the space inside the border. The border wraps the padding. Margin is the space outside the border.'
          },
          {
            type: 'code',
            lang: 'css',
            code: `.card {
  box-sizing: border-box;
  width: 100%;
  padding: 1rem;
  border: 1px solid #1f1d1a;
  margin: 1rem 0;
}`
          },
          {
            type: 'p',
            text: 'By default, width measures the content box. Padding and border are added on top, so the card becomes wider than 100%. Border-box makes width include padding and border, which is easier to reason about.'
          },
          {
            type: 'note',
            text: 'Use margin between boxes, not padding. Padding belongs inside the border.'
          }
        ],
        quiz: {
          question: 'Which part of the box sits outside the border?',
          options: ['Padding', 'Margin', 'Content'],
          answer: 1,
          explanation: 'Margin is outside the border. Padding is inside it, around the content.'
        },
        challenge: {
          prompt:
            'Style the card with border-box sizing, full width, 1rem padding, a thin ink border, and 1rem vertical margin.',
          requirements: [
            'Set .card box-sizing to border-box.',
            'Set width to 100%.',
            'Set padding to 1rem.',
            'Set border to 1px solid #1f1d1a.',
            'Set margin to 1rem 0.'
          ],
          starter: `/* Give the card some room. */

`,
          solution: `.card {
  box-sizing: border-box;
  width: 100%;
  padding: 1rem;
  border: 1px solid #1f1d1a;
  margin: 1rem 0;
}`,
          hint: 'All five declarations belong in one .card rule.',
          tests: [
            {
              label: 'The card uses border-box sizing.',
              run: ({ css }) => cssHas(css, '.card', 'box-sizing', 'border-box')
            },
            {
              label: 'The card is full width.',
              run: ({ css }) => cssHas(css, '.card', 'width', '100%')
            },
            {
              label: 'The card has 1rem of padding.',
              run: ({ css }) => cssHas(css, '.card', 'padding', '1rem')
            },
            {
              label: 'The card has a 1px solid ink border.',
              run: ({ css }) => cssHas(css, '.card', 'border', '1px solid #1f1d1a')
            },
            {
              label: 'The card has 1rem vertical margin.',
              run: ({ css }) => cssHas(css, '.card', 'margin', '1rem 0')
            }
          ]
        }
      }
    ]
  }
];
