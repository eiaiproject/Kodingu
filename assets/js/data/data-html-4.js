import {
  attr,
  challenge,
  check,
  code,
  count,
  exists,
  lesson,
  lessonModule,
  note,
  p,
  quiz,
  raw,
  text
} from './lesson-builder.js';

const page = (title, body) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>${title}</title>
  </head>
  <body>
${body}
  </body>
</html>`;

export const htmlModulesPhase4 = [
  lessonModule(
    'html-m7',
    'Forms that guide input',
    'Two lessons on grouping related controls and letting the browser validate an answer before submit.',
    [
      lesson(
        'html-27',
        'Group related fields',
        7,
        'Place two radio choices inside a named fieldset and connect both labels.',
        [
          p('A fieldset groups form controls that belong together. Its legend gives the group a name. A screen reader announces that name when it reaches the group, so the listener knows what the choices are for.'),
          code(
            'html',
            `<fieldset>
  <legend>Contact preference</legend>
  <label for="contact-email">Email</label>
  <input id="contact-email" type="radio" name="contact" value="email" checked>
  <label for="contact-phone">Phone</label>
  <input id="contact-phone" type="radio" name="contact" value="phone">
</fieldset>`
          ),
          p('Both radio inputs share the name contact, so the browser treats them as one choice. Only one can be checked at a time. The value is the answer that would be sent with the form.'),
          note('A label with a matching for attribute and an input id is clickable and has a clear accessible name. Do not use a paragraph as a label.')
        ],
        quiz(
          'Which element names a group of related form controls?',
          ['<label>', '<legend>', '<option>'],
          1,
          'The legend names the fieldset. A label names one control, and an option belongs to a select list.'
        ),
        challenge(
          'Build a contact preference form. Group two radio choices under the legend "Contact preference". Both choices use the name "contact". Offer Email and Phone, with Email checked. Add a submit button.',
          [
            'Use a form element.',
            'Wrap the choices in a fieldset with the legend "Contact preference".',
            'Add two radio inputs with name="contact".',
            'Connect labels to the email and phone inputs.',
            'Check the email choice by default.',
            'Add a button with type="submit".'
          ],
          page('Contact preference', `    <form>

    </form>`),
          page(
            'Contact preference',
            `    <form>
      <fieldset>
        <legend>Contact preference</legend>
        <label for="contact-email">Email</label>
        <input id="contact-email" type="radio" name="contact" value="email" checked>
        <label for="contact-phone">Phone</label>
        <input id="contact-phone" type="radio" name="contact" value="phone">
      </fieldset>
      <button type="submit">Save preference</button>
    </form>`
          ),
          'The fieldset surrounds the two labels and inputs. Both radios share the same name. Put checked on the email input.',
          [
            exists('The choices sit inside a fieldset.', 'form fieldset'),
            text('The legend names the group.', 'legend', 'Contact preference'),
            count('There are two contact choices.', 'input[type="radio"][name="contact"]', 2),
            check('Both labels point at their inputs.', ({ doc }) =>
              Boolean(doc.querySelector('label[for="contact-email"]')) &&
              Boolean(doc.querySelector('#contact-email')) &&
              Boolean(doc.querySelector('label[for="contact-phone"]')) &&
              Boolean(doc.querySelector('#contact-phone'))
            ),
            exists('The email choice is checked.', '#contact-email[checked]'),
            exists('The form has a submit button.', 'button[type="submit"]')
          ]
        )
      ),
      lesson(
        'html-28',
        'Validate before submit',
        8,
        'Add native constraints to an email and name field, with labels and a submit button.',
        [
          p('A form can check some answers before it sends anything. The required attribute makes an empty field invalid. Type email checks the shape of an address. Minlength rejects a name that is too short.'),
          code(
            'html',
            `<form>
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required>
  <label for="name">Name</label>
  <input id="name" name="name" type="text" minlength="2" required>
  <button type="submit">Subscribe</button>
</form>`
          ),
          p('When the form is submitted, the browser checks these constraints and shows its own message at the first invalid field. The page needs no script for this basic protection.'),
          note('Client-side validation helps the person filling the form, but it is not security. A server must validate every value again.')
        ],
        quiz(
          'Which attribute makes a form field mandatory?',
          ['required', 'minlength', 'placeholder'],
          0,
          'Required marks an empty field as invalid. Minlength checks the length of a value that is present.'
        ),
        challenge(
          'Build a subscribe form with a required email field and a required name field of at least 2 characters. Connect both labels and add a submit button.',
          [
            'Use an email input with id and name set to "email".',
            'Make the email input required.',
            'Use a text input with id and name set to "name".',
            'Set minlength="2" and required on the name input.',
            'Connect a label to each input.',
            'Add a button with type="submit".'
          ],
          page('Subscribe', `    <form>

    </form>`),
          page(
            'Subscribe',
            `    <form>
      <label for="email">Email</label>
      <input id="email" name="email" type="email" required>
      <label for="name">Name</label>
      <input id="name" name="name" type="text" minlength="2" required>
      <button type="submit">Subscribe</button>
    </form>`
          ),
          'The browser needs the input type and the constraint attributes. The labels use the same values as the input ids.',
          [
            check('The email field is a required email input.', ({ doc }) => {
              const input = doc.querySelector('#email');
              return input?.type === 'email' && input.required;
            }),
            check('The name field is required and at least two characters long.', ({ doc }) => {
              const input = doc.querySelector('#name');
              return input?.type === 'text' && input.required && input.minLength === 2;
            }),
            check('Both fields have connected labels.', ({ doc }) =>
              Boolean(doc.querySelector('label[for="email"]')) &&
              Boolean(doc.querySelector('label[for="name"]'))
            ),
            exists('The form has a submit button.', 'button[type="submit"]'),
            check('The empty form is invalid.', ({ doc }) => !doc.querySelector('form').checkValidity())
          ]
        )
      )
    ]
  ),
  lessonModule(
    'html-m8',
    'Embedded content and characters',
    'Four lessons on iframes, canvas, SVG, and the characters and paths that hold a page together.',
    [
      lesson(
        'html-29',
        'Embed another page',
        7,
        'Embed a field notes preview with srcdoc and describe it for assistive technology.',
        [
          p('An iframe places another document inside the current page. The src attribute points at a URL. The srcdoc attribute holds a small document directly, which is useful for a self-contained preview.'),
          code(
            'html',
            `<iframe
  title="Field notes preview"
  srcdoc="&lt;p&gt;Field notes&lt;/p&gt;"
  loading="lazy"
  width="320"
  height="180"></iframe>`
          ),
          p('The title names the frame for screen readers. Loading lazy lets the browser wait until the frame is near the viewport. Width and height reserve space so the page does not jump when the frame arrives.'),
          note('Treat an iframe from another site as untrusted. Add sandbox when the embedded document does not need scripts, forms, or navigation.')
        ],
        quiz(
          'Which attribute gives an iframe its accessible name?',
          ['src', 'title', 'loading'],
          1,
          'The title attribute names the frame. Src points at the document, and loading controls when it loads.'
        ),
        challenge(
          'Embed a field notes preview with srcdoc containing a paragraph that says "Field notes". Give the frame the title "Field notes preview", lazy loading, and a 320 by 180 size.',
          [
            'Use one iframe.',
            'Add a title attribute with "Field notes preview".',
            'Put a paragraph that says "Field notes" in srcdoc.',
            'Set loading to lazy.',
            'Set width="320" and height="180".'
          ],
          page('Field notes', `    <h1>Field notes</h1>`),
          page(
            'Field notes',
            `    <h1>Field notes</h1>
    <iframe
      title="Field notes preview"
      srcdoc="&lt;p&gt;Field notes&lt;/p&gt;"
      loading="lazy"
      width="320"
      height="180"></iframe>`
          ),
          'The srcdoc value is a complete little HTML fragment. Escape the angle brackets so they stay inside the attribute.',
          [
            exists('The page contains an iframe.', 'iframe'),
            attr('The iframe has a descriptive title.', 'iframe', 'title', 'Field notes preview'),
            check('The frame embeds the field notes paragraph.', ({ doc }) =>
              (doc.querySelector('iframe')?.getAttribute('srcdoc') || '').includes('Field notes')
            ),
            attr('The iframe waits until it is needed.', 'iframe', 'loading', 'lazy'),
            check('The frame reserves its size.', ({ doc }) => {
              const frame = doc.querySelector('iframe');
              return frame?.getAttribute('width') === '320' && frame?.getAttribute('height') === '180';
            })
          ]
        )
      ),
      lesson(
        'html-30',
        'Draw with canvas',
        7,
        'Add a 320 by 180 canvas named chart with an accessible role, label, and fallback.',
        [
          p('A canvas is a bitmap drawing surface. The width and height attributes set the drawing buffer. CSS controls the size on the page, which can be different.'),
          code(
            'html',
            `<canvas
  id="chart"
  width="320"
  height="180"
  role="img"
  aria-label="A simple bar chart">
  A bar chart of three notes.
</canvas>`
          ),
          p('The canvas element itself is empty until a script draws into it. The fallback content appears when the browser cannot show the surface, and it gives the page something to read.'),
          note('Canvas text is pixels, so it cannot be selected or resized like HTML text. Use SVG or HTML when the content is mostly text.')
        ],
        quiz(
          'What appears when a browser cannot render a canvas?',
          ['The first script on the page', 'The content between the canvas tags', 'Nothing at all'],
          1,
          'Content between the canvas tags is the fallback. Scripts are not automatically shown in its place.'
        ),
        challenge(
          'Add a canvas with id "chart", a 320 by 180 drawing size, role="img", aria-label "A simple bar chart", and the fallback text "A bar chart of three notes."',
          [
            'Use a canvas with id="chart".',
            'Set width="320" and height="180".',
            'Give it role="img".',
            'Set aria-label to "A simple bar chart".',
            'Include the fallback text "A bar chart of three notes."'
          ],
          page('Field notes', `    <h1>Field notes</h1>`),
          page(
            'Field notes',
            `    <h1>Field notes</h1>
    <canvas
      id="chart"
      width="320"
      height="180"
      role="img"
      aria-label="A simple bar chart">
      A bar chart of three notes.
    </canvas>`
          ),
          'All five attributes belong on the canvas. The fallback text goes between the opening and closing tags.',
          [
            exists('The page has a canvas with id chart.', 'canvas#chart'),
            check('The canvas has a drawing size.', ({ doc }) => {
              const canvas = doc.querySelector('canvas');
              return canvas?.getAttribute('width') === '320' && canvas?.getAttribute('height') === '180';
            }),
            attr('The canvas exposes an image role.', 'canvas', 'role', 'img'),
            attr('The canvas has an accessible label.', 'canvas', 'aria-label', 'A simple bar chart'),
            check('The canvas contains fallback text.', ({ doc }) =>
              (doc.querySelector('canvas')?.textContent || '').includes('A bar chart of three notes.')
            )
          ]
        )
      ),
      lesson(
        'html-31',
        'Draw with SVG',
        8,
        'Build an inline SVG labelled by its title and description, with one vermilion bar.',
        [
          p('SVG is markup for shapes. An inline svg element becomes part of the page, so CSS can style it and a screen reader can read its title. Shapes keep their edges when the page scales.'),
          code(
            'html',
            `<svg viewBox="0 0 120 60" role="img" aria-labelledby="chart-title chart-desc">
  <title id="chart-title">A vermilion bar</title>
  <desc id="chart-desc">A red rectangle on a paper background.</desc>
  <rect x="20" y="18" width="80" height="24" fill="#b23a2f"></rect>
</svg>`
          ),
          p('The viewBox sets the coordinate system: x, y, width, and height. The rect then draws inside those coordinates. The title and desc elements describe the drawing, and aria-labelledby connects both to the svg.'),
          note('A title element inside SVG is not the page title. It names the drawing. If an SVG is decorative, hide it from assistive technology instead.')
        ],
        quiz(
          'What does the viewBox attribute define?',
          ['The file size', 'The coordinate system and visible area', 'The color of every shape'],
          1,
          'ViewBox sets the internal coordinates and the area they map onto. Shapes use those coordinates.'
        ),
        challenge(
          'Draw a 120 by 60 SVG with viewBox "0 0 120 60", the title "A vermilion bar", the description "A red rectangle on a paper background.", and a rectangle 80 by 24 at x=20 y=18 filled with #b23a2f.',
          [
            'Use an inline svg with viewBox="0 0 120 60".',
            'Give the svg role="img".',
            'Add a title with id="chart-title" and the text "A vermilion bar".',
            'Add a desc with id="chart-desc" and the text "A red rectangle on a paper background.".',
            'Connect both with aria-labelledby.',
            'Add a rect with x="20", y="18", width="80", height="24", and fill="#b23a2f".'
          ],
          page('Field notes', `    <h1>Field notes</h1>`),
          page(
            'Field notes',
            `    <h1>Field notes</h1>
    <svg viewBox="0 0 120 60" role="img" aria-labelledby="chart-title chart-desc">
      <title id="chart-title">A vermilion bar</title>
      <desc id="chart-desc">A red rectangle on a paper background.</desc>
      <rect x="20" y="18" width="80" height="24" fill="#b23a2f"></rect>
    </svg>`
          ),
          'The title and desc go first inside the svg. The rect draws after them. Keep the ids matched to aria-labelledby.',
          [
            exists('The page contains an SVG drawing.', 'svg'),
            attr('The SVG defines a coordinate system.', 'svg', 'viewBox', '0 0 120 60'),
            text('The SVG title names the drawing.', 'svg title', 'A vermilion bar'),
            text(
              'The SVG description explains the drawing.',
              'svg desc',
              'A red rectangle on a paper background.'
            ),
            check('The rectangle has the expected size and position.', ({ doc }) => {
              const rect = doc.querySelector('svg rect');
              return (
                rect?.getAttribute('x') === '20' &&
                rect?.getAttribute('y') === '18' &&
                rect?.getAttribute('width') === '80' &&
                rect?.getAttribute('height') === '24' &&
                rect?.getAttribute('fill') === '#b23a2f'
              );
            }),
            check('The title and description are linked to the SVG.', ({ doc }) => {
              const svg = doc.querySelector('svg');
              const labelledBy = svg?.getAttribute('aria-labelledby') || '';
              return (
                labelledBy.includes('chart-title') &&
                labelledBy.includes('chart-desc') &&
                Boolean(doc.querySelector('svg #chart-title')) &&
                Boolean(doc.querySelector('svg #chart-desc'))
              );
            })
          ]
        )
      ),
      lesson(
        'html-32',
        'Characters, paths, and URLs',
        8,
        'Build a page with an escaped ampersand, a relative link, an email link, and a relative image path.',
        [
          p('Some characters have a second meaning in HTML. A bare ampersand can begin an entity, and a less-than sign begins a tag. Write them as &amp; and &lt; when they are part of the text.'),
          code(
            'html',
            `<p>Tom &amp; Jerry</p>
<a href="notes/field-notes.html">Field notes</a>
<a href="mailto:hello@example.com">Email</a>
<img src="images/seal.svg" alt="A vermilion seal">`
          ),
          p('A relative path starts from the current page. notes/field-notes.html looks inside a notes folder. A mailto link opens the mail app instead of a page.'),
          note('Save the file as UTF-8 and declare charset="UTF-8" in the head. URLs with spaces use %20, not a literal space.')
        ],
        quiz(
          'Which entity writes a literal ampersand in HTML text?',
          ['&amp;', '&lt;', '&copy;'],
          0,
          'Amp writes an ampersand. Lt writes a less-than sign, and copy writes the copyright symbol.'
        ),
        challenge(
          'Build a field notes page with the paragraph "Tom & Jerry" written with the ampersand entity, a relative link to notes/field-notes.html with the text "Field notes", an email link to hello@example.com with the text "Email", and the image images/seal.svg with alt "A vermilion seal".',
          [
            'Keep the document in UTF-8.',
            'Write Tom & Jerry with the ampersand entity.',
            'Link to notes/field-notes.html with the text "Field notes".',
            'Add a mailto link to hello@example.com with the text "Email".',
            'Add an image with src="images/seal.svg" and alt="A vermilion seal".'
          ],
          page('Field notes', `    <h1>Field notes</h1>`),
          page(
            'Field notes',
            `    <h1>Field notes</h1>
    <p>Tom &amp; Jerry</p>
    <a href="notes/field-notes.html">Field notes</a>
    <a href="mailto:hello@example.com">Email</a>
    <img src="images/seal.svg" alt="A vermilion seal">`
          ),
          'The paragraph uses the entity in the source. The two links have different href values, and the image path is relative to the page.',
          [
            check('The page declares UTF-8.', ({ doc }) =>
              (doc.querySelector('meta[charset]')?.getAttribute('charset') || '').toUpperCase() === 'UTF-8'
            ),
            text('The paragraph reads "Tom & Jerry".', 'p', 'Tom & Jerry'),
            check('The relative link points at the field notes page.', ({ doc }) => {
              const link = doc.querySelector('a[href="notes/field-notes.html"]');
              return (link?.textContent || '').trim() === 'Field notes';
            }),
            exists('The email link uses mailto.', 'a[href="mailto:hello@example.com"]'),
            check('The image has a relative source and useful alt text.', ({ doc }) => {
              const image = doc.querySelector('img');
              return (
                image?.getAttribute('src') === 'images/seal.svg' &&
                image?.getAttribute('alt') === 'A vermilion seal'
              );
            }),
            raw('The source writes the ampersand as an entity.', /&amp;/)
          ]
        )
      )
    ]
  )
];
