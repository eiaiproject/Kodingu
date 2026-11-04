import {
  challenge,
  code,
  css,
  lesson,
  lessonModule,
  note,
  p,
  quiz
} from './lesson-builder.js';

const cardPreview = `<article class="card">
  <h2>Field notes</h2>
  <p>Short notes about the web.</p>
</article>`;

const linkPreview = `<main>
  <a class="link" href="#notes">Read the notes</a>
  <p class="note">Field notes</p>
</main>`;

const coverPreview = `<div class="frame">
  <img class="cover" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='100'%3E%3Crect width='160' height='100' fill='%23B23A2F'/%3E%3C/svg%3E" alt="">
</div>`;

const fluidPreview = `<main>
  <h1 class="title">Field notes</h1>
  <p class="lede">A short page about structure, style, and behavior.</p>
</main>`;

export const cssComponents = [
  lessonModule(
    'css-m4',
    'Surfaces and states',
    'Four lessons on borders, shadows, interaction states, box sizing, and type that scales.',
    [
      lesson(
        'css-16',
        'Surfaces with borders and shadows',
        8,
        'Style a card with a border, radius, background, and a single shadow.',
        [
          p('A surface needs enough definition to sit above the page without becoming decoration. A border, a background, and a small shadow can do that job together. Keep the shadow soft and low.'),
          code(
            'css',
            `.card {
  border: 1px solid #d6cfc2;
  border-radius: 0.75rem;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(31, 29, 26, 0.12);
}`
          ),
          p('Border draws the edge. Border-radius rounds the corners. Background fills the box. Box-shadow adds an offset, blur, and color outside the box. The shadow does not take up layout space.'),
          note('One shadow with an elevation job is enough. A second shadow or a glow tends to make the card look heavier than its content.')
        ],
        quiz(
          'Which property rounds the corners of a box?',
          ['border', 'border-radius', 'box-shadow'],
          1,
          'Border-radius rounds the corners. Border draws the edge, and box-shadow sits outside it.'
        ),
        challenge(
          'Style .card with a 1px solid #d6cfc2 border, 0.75rem corners, a white background, and the shadow 0 2px 8px rgba(31, 29, 26, 0.12).',
          [
            'Set border to 1px solid #d6cfc2.',
            'Set border-radius to 0.75rem.',
            'Set background to #ffffff.',
            'Set box-shadow to 0 2px 8px rgba(31, 29, 26, 0.12).'
          ],
          `.card {
  padding: 1rem;
}`,
          `.card {
  padding: 1rem;
  border: 1px solid #d6cfc2;
  border-radius: 0.75rem;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(31, 29, 26, 0.12);
}`,
          'All four properties belong in the .card rule. The shadow value starts with the horizontal and vertical offset.',
          [
            css('The card has a thin border.', '.card', 'border', '1px solid #d6cfc2'),
            css('The corners are rounded.', '.card', 'border-radius', '0.75rem'),
            css('The card has a white surface.', '.card', 'background', '#ffffff'),
            css(
              'The card has one quiet shadow.',
              '.card',
              'box-shadow',
              '0 2px 8px rgba(31, 29, 26, 0.12)'
            )
          ]
        ),
        { language: 'css', preview: cardPreview }
      ),
      lesson(
        'css-17',
        'States and generated content',
        9,
        'Give a link a hover color, a visible focus ring, and a generated New label.',
        [
          p('A pseudo-class selects an element in a state. :hover applies while the pointer is over it. :focus-visible applies when keyboard focus should be visible. These states tell the reader that the page heard them.'),
          code(
            'css',
            `.link:hover {
  color: #b23a2f;
}

.link:focus-visible {
  outline: 2px solid #b23a2f;
  outline-offset: 2px;
}

.note::before {
  content: "New";
  color: #b23a2f;
  margin-right: 0.5rem;
}`
          ),
          p('A pseudo-element creates a part that is not in the HTML. ::before inserts content at the start of the element. It needs the content property, even when the value is an empty string.'),
          note('Do not remove a focus outline without replacing it. The focus ring is how a keyboard user knows which control will respond.')
        ],
        quiz(
          'Which pseudo-class applies when a keyboard user focuses a control?',
          [':hover', ':focus-visible', '::before'],
          1,
          ':focus-visible is the keyboard focus state. Hover needs a pointer, and ::before creates a pseudo-element.'
        ),
        challenge(
          'Make .link turn #b23a2f on hover. Give .link:focus-visible a 2px solid #b23a2f outline with a 2px offset. Add the generated text "New" before .note.',
          [
            'Set .link:hover color to #b23a2f.',
            'Set .link:focus-visible outline to 2px solid #b23a2f.',
            'Set .link:focus-visible outline-offset to 2px.',
            'Add content: "New" to .note::before.'
          ],
          `.link {
  color: #1f1d1a;
}

.note {
  color: #1f1d1a;
}`,
          `.link {
  color: #1f1d1a;
}

.link:hover {
  color: #b23a2f;
}

.link:focus-visible {
  outline: 2px solid #b23a2f;
  outline-offset: 2px;
}

.note {
  color: #1f1d1a;
}

.note::before {
  content: "New";
  color: #b23a2f;
  margin-right: 0.5rem;
}`,
          'Write a separate rule for each state. The generated content belongs in a ::before rule on .note.',
          [
            css('The link changes color on hover.', '.link:hover', 'color', '#b23a2f'),
            css(
              'The keyboard focus ring is visible.',
              '.link:focus-visible',
              'outline',
              '2px solid #b23a2f'
            ),
            css('The focus ring sits away from the text.', '.link:focus-visible', 'outline-offset', '2px'),
            css('The note has a generated New label.', '.note::before', 'content', '"New"')
          ]
        ),
        { language: 'css', preview: linkPreview }
      ),
      lesson(
        'css-18',
        'Boxes that keep their size',
        9,
        'Build a fixed frame that keeps its width, scrolls its overflow, and crops an image with object-fit.',
        [
          p('By default, width sets the content box. Padding and border are added outside it, so a 20rem box with 1rem padding becomes wider than 20rem. Box-sizing: border-box includes padding and border in the width.'),
          code(
            'css',
            `.frame {
  box-sizing: border-box;
  width: 20rem;
  padding: 1rem;
  overflow: auto;
}

.cover {
  width: 100%;
  height: 8rem;
  object-fit: cover;
}`
          ),
          p('Overflow decides what happens when content is larger than its box. Auto adds a scrollbar only when it is needed. Object-fit decides how an image fills its box. Cover crops the edges instead of stretching the image.'),
          note('Border-box makes a width predictable. It does not make content smaller. Long words and large images still need overflow or a flexible width.')
        ],
        quiz(
          'What does box-sizing: border-box include in the width?',
          ['Only the content', 'Content, padding, and border', 'Only the margin'],
          1,
          'Border-box includes padding and border in the declared width. Margin stays outside the box.'
        ),
        challenge(
          'Make .frame use border-box, a 20rem width, 1rem padding, and auto overflow. Make .cover fill the width, stand 8rem tall, and cover its box.',
          [
            'Set .frame box-sizing to border-box.',
            'Set .frame width to 20rem and padding to 1rem.',
            'Set .frame overflow to auto.',
            'Set .cover width to 100% and height to 8rem.',
            'Set .cover object-fit to cover.'
          ],
          `.frame {
  width: 20rem;
  padding: 1rem;
}

.cover {
  width: 100%;
}`,
          `.frame {
  box-sizing: border-box;
  width: 20rem;
  padding: 1rem;
  overflow: auto;
}

.cover {
  width: 100%;
  height: 8rem;
  object-fit: cover;
}`,
          'Border-box belongs on the frame that has padding. Object-fit belongs on the image that has both a width and a height.',
          [
            css('The frame includes its padding in its width.', '.frame', 'box-sizing', 'border-box'),
            css('The frame scrolls only when it needs to.', '.frame', 'overflow', 'auto'),
            css('The image fills the width of the frame.', '.cover', 'width', '100%'),
            css('The image crops instead of stretching.', '.cover', 'object-fit', 'cover')
          ]
        ),
        { language: 'css', preview: coverPreview }
      ),
      lesson(
        'css-19',
        'Type that scales',
        8,
        'Set a fluid heading with clamp and cap a paragraph at 60 characters per line.',
        [
          p('A fixed font size cannot suit every screen. Clamp() takes a minimum, a preferred value, and a maximum. The browser picks the preferred value but keeps it inside the two limits.'),
          code(
            'css',
            `.title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
}

.lede {
  max-width: 60ch;
}`
          ),
          p('Vw is one percent of the viewport width, so 4vw grows on a wider screen. Ch is the width of the zero character, which makes it a useful measure for a line of text. A 60ch cap keeps a paragraph from becoming too wide to read.'),
          note('Clamp is not a substitute for every breakpoint. Use it when one value can move smoothly between a sensible minimum and maximum.')
        ],
        quiz(
          'What does clamp(1.75rem, 4vw, 2.5rem) guarantee?',
          [
            'The size is always 4vw.',
            'The size stays between 1.75rem and 2.5rem.',
            'The size is always 1.75rem.'
          ],
          1,
          'Clamp keeps the preferred value inside the minimum and maximum. It does not force one fixed size.'
        ),
        challenge(
          'Set .title to clamp(1.75rem, 4vw, 2.5rem) and cap .lede at 60ch.',
          [
            'Set .title font-size to clamp(1.75rem, 4vw, 2.5rem).',
            'Set .lede max-width to 60ch.'
          ],
          `.title {
  font-size: 2rem;
}

.lede {
  max-width: 100%;
}`,
          `.title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
}

.lede {
  max-width: 60ch;
}`,
          'The three clamp values are minimum, preferred, and maximum. The paragraph cap uses the ch unit.',
          [
            css(
              'The heading scales between a floor and a ceiling.',
              '.title',
              'font-size',
              'clamp(1.75rem, 4vw, 2.5rem)'
            ),
            css('The paragraph is capped at 60 characters.', '.lede', 'max-width', '60ch')
          ]
        ),
        { language: 'css', preview: fluidPreview }
      )
    ]
  )
];
