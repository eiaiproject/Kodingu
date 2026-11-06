import { textOf, textsOf } from './data-helpers.js';

const seal =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='100'%3E%3Crect width='160' height='100' fill='%23B23A2F'/%3E%3C/svg%3E";

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

export const htmlModulesContent = [
  {
    id: 'html-m2',
    title: 'Content with meaning',
    description:
      'Five lessons on images, quotations, code, figures, and the semantic elements that describe a page.',
    lessons: [
      {
        id: 'html-06',
        title: 'Images need alt text',
        minutes: 7,
        xp: 25,
        objective: 'Add an image with a src and a useful alt description.',
        theory: [
          {
            type: 'p',
            text: 'The img element puts an image on the page. It is a void element, so it has no closing tag. Two attributes do most of the work: src points to the image, and alt describes it.'
          },
          {
            type: 'code',
            lang: 'html',
            code: `<img src="seal.svg" alt="A vermilion square">`
          },
          {
            type: 'p',
            text: 'Alt text is what a screen reader announces when the image cannot be seen. Describe the image in the context of the page. If the image is purely decorative, use an empty alt attribute so the screen reader can skip it.'
          },
          {
            type: 'note',
            text: 'Do not start alt text with "Image of". A screen reader already says that it is an image.'
          }
        ],
        quiz: {
          question: 'What does the alt attribute do?',
          options: [
            'It styles the image.',
            'It describes the image when it cannot be seen.',
            'It makes the image load faster.'
          ],
          answer: 1,
          explanation: 'Alt text is the image description for screen readers and broken images. CSS handles style.'
        },
        challenge: {
          prompt:
            'Add the seal image to the page. Use the src below and the alt text "A vermilion square".',
          requirements: [
            'Use exactly one img element.',
            'Set src to the provided data URI.',
            'Set alt to "A vermilion square".',
            'Keep the img inside the body.'
          ],
          starter: page('Images', ''),
          solution: page('Images', `    <img src="${seal}" alt="A vermilion square">`),
          hint: 'The alt attribute goes inside the img tag, next to src. There is no closing img tag.',
          tests: [
            {
              label: 'There is exactly one image.',
              run: ({ doc }) => doc.querySelectorAll('img').length === 1
            },
            {
              label: 'The image has a data URI src.',
              run: ({ doc }) => (doc.querySelector('img')?.getAttribute('src') || '').startsWith('data:image/svg+xml')
            },
            {
              label: 'The alt text is "A vermilion square".',
              run: ({ doc }) => textOf(doc, 'img') === '' && doc.querySelector('img')?.getAttribute('alt') === 'A vermilion square'
            },
            {
              label: 'The alt text is not empty.',
              run: ({ doc }) => Boolean(doc.querySelector('img')?.getAttribute('alt')?.trim())
            }
          ]
        }
      },
      {
        id: 'html-07',
        title: 'Quotes and citations',
        minutes: 7,
        xp: 25,
        objective: 'Mark up a long quotation and name its source.',
        theory: [
          {
            type: 'p',
            text: 'The blockquote element marks a long quotation. The q element marks a short quotation inside a sentence. The cite element names the work the quotation comes from.'
          },
          {
            type: 'code',
            lang: 'html',
            code: `<blockquote>
  <p>Structure comes before style.</p>
  <footer><cite>Kodingu field notes</cite></footer>
</blockquote>`
          },
          {
            type: 'p',
            text: 'The cite attribute on blockquote can hold a source URL, but browsers do not show it. If the source should be visible, put it in a cite element or a link.'
          },
          {
            type: 'note',
            text: 'Quote real words or write your own. Do not attribute words to a person who did not say them.'
          }
        ],
        quiz: {
          question: 'Which element is for a long quotation?',
          options: ['<q>', '<blockquote>', '<cite>'],
          answer: 1,
          explanation: 'Blockquote is for a long quotation. Q is for a short inline quotation, and cite names the source.'
        },
        challenge: {
          prompt:
            'Write a blockquote with the sentence "Structure comes before style." and the visible source "Kodingu field notes" inside a cite element.',
          requirements: [
            'Use one blockquote.',
            'Put the sentence in a p inside the blockquote.',
            'Put the source in a cite element inside the blockquote.',
            'Keep the quotation and the source separate.'
          ],
          starter: page('Quotes', ''),
          solution: page(
            'Quotes',
            `    <blockquote>
      <p>Structure comes before style.</p>
      <footer><cite>Kodingu field notes</cite></footer>
    </blockquote>`
          ),
          hint: 'Put the sentence in a p. Put the source in a footer or after the p, still inside the blockquote.',
          tests: [
            {
              label: 'There is one blockquote.',
              run: ({ doc }) => doc.querySelectorAll('blockquote').length === 1
            },
            {
              label: 'The quotation text is exact.',
              run: ({ doc }) => textOf(doc, 'blockquote p') === 'Structure comes before style.'
            },
            {
              label: 'The source is in a cite element.',
              run: ({ doc }) => textOf(doc, 'blockquote cite') === 'Kodingu field notes'
            },
            {
              label: 'The cite element is inside the blockquote.',
              run: ({ doc }) => Boolean(doc.querySelector('blockquote cite'))
            }
          ]
        }
      },
      {
        id: 'html-08',
        title: 'Code and pre',
        minutes: 8,
        xp: 25,
        objective: 'Show a block of code without the browser parsing it.',
        theory: [
          {
            type: 'p',
            text: 'The code element marks a fragment of code inside a sentence. It does not keep line breaks. The pre element keeps whitespace and line breaks exactly as written.'
          },
          {
            type: 'code',
            lang: 'html',
            code: `<p>Use the <code>alt</code> attribute.</p>
<pre><code>&lt;img src="seal.svg" alt="A vermilion square"&gt;</code></pre>`
          },
          {
            type: 'p',
            text: 'To show a tag as text, escape the angle brackets. Write &lt; for < and &gt; for >. If you write a real tag inside pre, the browser parses it instead of showing it.'
          },
          {
            type: 'note',
            text: 'Use kbd for a key and samp for program output. Use code for code.'
          }
        ],
        quiz: {
          question: 'Which element keeps line breaks and spaces?',
          options: ['<code>', '<pre>', '<p>'],
          answer: 1,
          explanation: 'Pre preserves whitespace. Code marks the text as code but does not preserve the layout.'
        },
        challenge: {
          prompt:
            'Write a pre element containing a code element with the visible text <h1>Hello</h1>. Escape the angle brackets.',
          requirements: [
            'Use one pre element.',
            'Put one code element inside the pre.',
            'The visible text is <h1>Hello</h1>.',
            'The raw source uses &lt; and &gt;.'
          ],
          starter: page('Code', ''),
          solution: page('Code', '    <pre><code>&lt;h1&gt;Hello&lt;/h1&gt;</code></pre>'),
          hint: 'Write &lt; for < and &gt; for >. Put the code element inside pre.',
          tests: [
            {
              label: 'There is one pre element.',
              run: ({ doc }) => doc.querySelectorAll('pre').length === 1
            },
            {
              label: 'The code element is inside the pre.',
              run: ({ doc }) => doc.querySelectorAll('pre code').length === 1
            },
            {
              label: 'The visible text is <h1>Hello</h1>.',
              run: ({ doc }) => textOf(doc, 'pre code') === '<h1>Hello</h1>'
            },
            {
              label: 'The angle brackets are escaped in the source.',
              run: ({ raw }) => /&lt;h1&gt;/i.test(raw) && /&lt;\/h1&gt;/i.test(raw)
            },
            {
              label: 'The browser did not create a real h1.',
              run: ({ doc }) => doc.querySelector('h1') === null
            }
          ]
        }
      },
      {
        id: 'html-09',
        title: 'Figures and captions',
        minutes: 7,
        xp: 25,
        objective: 'Group an image with a caption that belongs to it.',
        theory: [
          {
            type: 'p',
            text: 'A figure groups a piece of content with a caption. The content can be an image, a diagram, a code sample, or a quotation. The figcaption element holds the caption.'
          },
          {
            type: 'code',
            lang: 'html',
            code: `<figure>
  <img src="seal.svg" alt="A vermilion square">
  <figcaption>The Kodingu seal.</figcaption>
</figure>`
          },
          {
            type: 'p',
            text: 'The figcaption must be the first or last child of the figure. It belongs to the figure, not to the whole page.'
          },
          {
            type: 'note',
            text: 'Do not repeat the alt text in the caption. The alt describes the image; the caption adds context.'
          }
        ],
        quiz: {
          question: 'Which element adds a caption to a figure?',
          options: ['<caption>', '<figcaption>', '<footer>'],
          answer: 1,
          explanation: 'Figcaption is the caption for a figure. Caption belongs to a table.'
        },
        challenge: {
          prompt:
            'Create a figure with the seal image, alt "A vermilion square", and the caption "The Kodingu seal".',
          requirements: [
            'Use one figure.',
            'Put one img inside the figure with the provided src and alt.',
            'Put one figcaption inside the figure.',
            'The caption text is "The Kodingu seal".'
          ],
          starter: page('Figures', ''),
          solution: page(
            'Figures',
            `    <figure>
      <img src="${seal}" alt="A vermilion square">
      <figcaption>The Kodingu seal</figcaption>
    </figure>`
          ),
          hint: 'The figcaption goes inside the figure, after the image.',
          tests: [
            {
              label: 'There is one figure.',
              run: ({ doc }) => doc.querySelectorAll('figure').length === 1
            },
            {
              label: 'The image is inside the figure with alt text.',
              run: ({ doc }) =>
                doc.querySelector('figure img')?.getAttribute('alt') === 'A vermilion square'
            },
            {
              label: 'The caption is inside the figure.',
              run: ({ doc }) => Boolean(doc.querySelector('figure figcaption'))
            },
            {
              label: 'The caption text is "The Kodingu seal".',
              run: ({ doc }) => textOf(doc, 'figure figcaption') === 'The Kodingu seal'
            },
            {
              label: 'The image uses the provided data URI.',
              run: ({ doc }) =>
                (doc.querySelector('figure img')?.getAttribute('src') || '').startsWith('data:image/svg+xml')
            }
          ]
        }
      },
      {
        id: 'html-10',
        title: 'Semantic sections',
        minutes: 9,
        xp: 25,
        objective: 'Describe a page with header, main, article, and footer.',
        theory: [
          {
            type: 'p',
            text: 'HTML has elements that describe the role of a block. Header introduces a page or a section. Nav holds major navigation. Main holds the main content. Footer closes a page or a section. Article is a self-contained piece. Section is a thematic group with a heading.'
          },
          {
            type: 'code',
            lang: 'html',
            code: `<header><h1>Field notes</h1></header>
<main>
  <article>
    <h2>A page is a tree</h2>
    <p>Structure comes first.</p>
  </article>
</main>
<footer><p>Kodingu</p></footer>`
          },
          {
            type: 'p',
            text: 'A page has one main element. Header and footer can wrap the whole page or one article. An article can stand on its own; a section usually needs a heading and belongs to a larger piece.'
          },
          {
            type: 'note',
            text: 'Use a div only when no semantic element fits. A page full of divs is harder to navigate with a screen reader.'
          }
        ],
        quiz: {
          question: 'Which element holds the main content and should appear once?',
          options: ['<main>', '<section>', '<article>'],
          answer: 0,
          explanation: 'Main holds the main content and appears once. Section and article can repeat.'
        },
        challenge: {
          prompt:
            'Build a page with a header containing an h1 "Field notes", a main containing an article with an h2 "A page is a tree" and a paragraph, and a footer containing "Kodingu".',
          requirements: [
            'Use one header with an h1.',
            'Use one main with one article inside it.',
            'Put an h2 and a p inside the article.',
            'Use one footer with the text "Kodingu".'
          ],
          starter: page('Semantic sections', ''),
          solution: page(
            'Semantic sections',
            `    <header>
      <h1>Field notes</h1>
    </header>
    <main>
      <article>
        <h2>A page is a tree</h2>
        <p>Structure comes before style.</p>
      </article>
    </main>
    <footer>
      <p>Kodingu</p>
    </footer>`
          ),
          hint: 'The article goes inside main. The header and footer are siblings of main.',
          tests: [
            {
              label: 'The header contains the h1 "Field notes".',
              run: ({ doc }) => textOf(doc, 'header h1') === 'Field notes'
            },
            {
              label: 'There is exactly one main element.',
              run: ({ doc }) => doc.querySelectorAll('main').length === 1
            },
            {
              label: 'The article is inside main.',
              run: ({ doc }) => Boolean(doc.querySelector('main article'))
            },
            {
              label: 'The article contains the h2 "A page is a tree".',
              run: ({ doc }) => textOf(doc, 'main article h2') === 'A page is a tree'
            },
            {
              label: 'The article contains a paragraph.',
              run: ({ doc }) => Boolean(doc.querySelector('main article p'))
            },
            {
              label: 'The footer says "Kodingu".',
              run: ({ doc }) => textOf(doc, 'footer') === 'Kodingu'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'html-m3',
    title: 'Forms and tables',
    description:
      'Five lessons on labelled inputs, choices, buttons, and tables that hold real data.',
    lessons: [
      {
        id: 'html-11',
        title: 'A form needs labels',
        minutes: 8,
        xp: 25,
        objective: 'Connect a label to a text input with matching for and id attributes.',
        theory: [
          {
            type: 'p',
            text: 'A form groups the controls that collect information. Each control needs a label. The label element connects to an input when its for attribute matches the input id.'
          },
          {
            type: 'code',
            lang: 'html',
            code: `<form>
  <label for="name">Name</label>
  <input id="name" name="name" type="text">
</form>`
          },
          {
            type: 'p',
            text: 'The name attribute is the key sent with the form. The id is the page address for the control. They often match, but they do different jobs.'
          },
          {
            type: 'note',
            text: 'Clicking a connected label focuses the input. That helps everyone, not only people who use a screen reader.'
          }
        ],
        quiz: {
          question: 'Which attribute connects a label to an input?',
          options: ['for', 'name', 'type'],
          answer: 0,
          explanation: 'The label for attribute matches the input id. Name is the key sent with the form.'
        },
        challenge: {
          prompt:
            'Build a form with a label that says "Name" and a text input with id and name set to "name".',
          requirements: [
            'Use one form element.',
            'Use a label with for="name" and the text "Name".',
            'Use an input with id="name" and name="name".',
            'Set the input type to text.'
          ],
          starter: page('Forms', ''),
          solution: page(
            'Forms',
            `    <form>
      <label for="name">Name</label>
      <input id="name" name="name" type="text">
    </form>`
          ),
          hint: 'The for attribute on the label and the id on the input must match. The name attribute is separate.',
          tests: [
            {
              label: 'There is one form.',
              run: ({ doc }) => doc.querySelectorAll('form').length === 1
            },
            {
              label: 'The label points to name.',
              run: ({ doc }) => doc.querySelector('label[for="name"]') !== null
            },
            {
              label: 'The label says "Name".',
              run: ({ doc }) => textOf(doc, 'label[for="name"]') === 'Name'
            },
            {
              label: 'The input has id="name".',
              run: ({ doc }) => doc.querySelector('input#name') !== null
            },
            {
              label: 'The input has name="name".',
              run: ({ doc }) => doc.querySelector('input[name="name"]') !== null
            },
            {
              label: 'The input type is text.',
              run: ({ doc }) => doc.querySelector('input#name')?.getAttribute('type') === 'text'
            }
          ]
        }
      },
      {
        id: 'html-12',
        title: 'Inputs that fit the answer',
        minutes: 7,
        xp: 25,
        objective: 'Use an email input with required and autocomplete attributes.',
        theory: [
          {
            type: 'p',
            text: 'The input type tells the browser what kind of answer to expect. Type email asks for an address and checks its shape before the form is sent. Type text accepts anything.'
          },
          {
            type: 'code',
            lang: 'html',
            code: `<label for="email">Email</label>
<input id="email" name="email" type="email" autocomplete="email" required>`
          },
          {
            type: 'p',
            text: 'The required attribute stops an empty submission. Autocomplete helps a browser fill the field with the right saved value.'
          },
          {
            type: 'note',
            text: 'The browser check is a convenience, not a guarantee. A real form still checks every value on the server.'
          }
        ],
        quiz: {
          question: 'Which input type asks the browser to check an email address?',
          options: ['text', 'email', 'mail'],
          answer: 1,
          explanation: 'Type email asks for an address shape. Type mail is not a standard input type.'
        },
        challenge: {
          prompt:
            'Build a form with an email field. Label it "Email", connect the label, make the field required, and turn on email autocomplete.',
          requirements: [
            'Use one form.',
            'Use a label with for="email" and the text "Email".',
            'Use an input with id="email" and name="email".',
            'Set type to email, add required, and set autocomplete to email.'
          ],
          starter: page('Email', ''),
          solution: page(
            'Email',
            `    <form>
      <label for="email">Email</label>
      <input id="email" name="email" type="email" autocomplete="email" required>
    </form>`
          ),
          hint: 'Required and autocomplete are attributes on the input, like id and name.',
          tests: [
            {
              label: 'There is one form.',
              run: ({ doc }) => doc.querySelectorAll('form').length === 1
            },
            {
              label: 'The label points to email and says "Email".',
              run: ({ doc }) => textOf(doc, 'label[for="email"]') === 'Email'
            },
            {
              label: 'The input has id="email" and name="email".',
              run: ({ doc }) =>
                doc.querySelector('input#email')?.getAttribute('name') === 'email'
            },
            {
              label: 'The input type is email.',
              run: ({ doc }) => doc.querySelector('input#email')?.getAttribute('type') === 'email'
            },
            {
              label: 'The input is required.',
              run: ({ doc }) => doc.querySelector('input#email')?.hasAttribute('required')
            },
            {
              label: 'Autocomplete is set to email.',
              run: ({ doc }) =>
                doc.querySelector('input#email')?.getAttribute('autocomplete') === 'email'
            }
          ]
        }
      },
      {
        id: 'html-13',
        title: 'Buttons and choices',
        minutes: 8,
        xp: 25,
        objective: 'Add a select with options and a submit button to a form.',
        theory: [
          {
            type: 'p',
            text: 'The select element holds a menu of options. Each option has a value sent with the form and visible text. The two can differ, which lets the label stay short while the value stays stable.'
          },
          {
            type: 'code',
            lang: 'html',
            code: `<form>
  <label for="topic">Topic</label>
  <select id="topic" name="topic">
    <option value="html">HTML</option>
    <option value="css">CSS</option>
  </select>
  <button type="submit">Send</button>
</form>`
          },
          {
            type: 'p',
            text: 'A button inside a form submits it by default, but you should write type="submit" anyway. It makes the intent clear and avoids surprises if the markup changes.'
          },
          {
            type: 'note',
            text: 'Give each option a value. Without one, the browser sends the visible text, which may change when you edit the copy.'
          }
        ],
        quiz: {
          question: 'What does an option value attribute hold?',
          options: [
            'The value sent with the form.',
            'The menu label.',
            'The CSS class for the option.'
          ],
          answer: 0,
          explanation: 'The value is sent with the form. The text between the option tags is what people see.'
        },
        challenge: {
          prompt:
            'Build a form with a labelled topic menu and a submit button. The menu should offer HTML and CSS.',
          requirements: [
            'Use one form.',
            'Use a label with for="topic" and the text "Topic".',
            'Use a select with id="topic" and name="topic".',
            'Add two options with values html and css and the text HTML and CSS.',
            'Add a button with type="submit" and the text "Send".'
          ],
          starter: page('Choices', ''),
          solution: page(
            'Choices',
            `    <form>
      <label for="topic">Topic</label>
      <select id="topic" name="topic">
        <option value="html">HTML</option>
        <option value="css">CSS</option>
      </select>
      <button type="submit">Send</button>
    </form>`
          ),
          hint: 'Options go inside the select. The label points to the select id, not to an option.',
          tests: [
            {
              label: 'There is one form.',
              run: ({ doc }) => doc.querySelectorAll('form').length === 1
            },
            {
              label: 'The label points to topic and says "Topic".',
              run: ({ doc }) => textOf(doc, 'label[for="topic"]') === 'Topic'
            },
            {
              label: 'The select has id and name set to topic.',
              run: ({ doc }) =>
                doc.querySelector('select#topic')?.getAttribute('name') === 'topic'
            },
            {
              label: 'There are two options.',
              run: ({ doc }) => doc.querySelectorAll('select#topic option').length === 2
            },
            {
              label: 'The option values are html and css.',
              run: ({ doc }) => {
                const values = Array.from(doc.querySelectorAll('select#topic option')).map((option) =>
                  option.getAttribute('value')
                );
                return values.length === 2 && values[0] === 'html' && values[1] === 'css';
              }
            },
            {
              label: 'The option labels are HTML and CSS.',
              run: ({ doc }) => {
                const labels = textsOf(doc, 'select#topic option');
                return labels.length === 2 && labels[0] === 'HTML' && labels[1] === 'CSS';
              }
            },
            {
              label: 'The button is a submit button that says "Send".',
              run: ({ doc }) =>
                doc.querySelector('button[type="submit"]')?.textContent.trim() === 'Send'
            }
          ]
        }
      },
      {
        id: 'html-14',
        title: 'Tables hold data',
        minutes: 9,
        xp: 25,
        objective: 'Build a table with a caption, column headers, and one data row.',
        theory: [
          {
            type: 'p',
            text: 'A table is for data that belongs in rows and columns. It is not a layout tool. The caption names the table. The thead holds the header row, and the tbody holds the data rows.'
          },
          {
            type: 'code',
            lang: 'html',
            code: `<table>
  <caption>Lesson plan</caption>
  <thead>
    <tr><th scope="col">Day</th><th scope="col">Topic</th></tr>
  </thead>
  <tbody>
    <tr><td>Monday</td><td>HTML</td></tr>
  </tbody>
</table>`
          },
          {
            type: 'p',
            text: 'Use th for header cells and td for data cells. The scope attribute tells a screen reader whether a header belongs to a column or a row.'
          },
          {
            type: 'note',
            text: 'The caption is part of the table. Do not replace it with a heading above the table.'
          }
        ],
        quiz: {
          question: 'Which element names a table?',
          options: ['<caption>', '<title>', '<thead>'],
          answer: 0,
          explanation: 'Caption names the table. Thead groups the header row.'
        },
        challenge: {
          prompt:
            'Build a table titled "Lesson plan" with two column headers, Day and Topic, and one data row for Monday and HTML.',
          requirements: [
            'Use one table with the caption "Lesson plan".',
            'Put one header row in thead with th scope="col" cells Day and Topic.',
            'Put one data row in tbody with the cells Monday and HTML.',
            'Use td for the data cells.'
          ],
          starter: page('Tables', ''),
          solution: page(
            'Tables',
            `    <table>
      <caption>Lesson plan</caption>
      <thead>
        <tr><th scope="col">Day</th><th scope="col">Topic</th></tr>
      </thead>
      <tbody>
        <tr><td>Monday</td><td>HTML</td></tr>
      </tbody>
    </table>`
          ),
          hint: 'The caption goes directly inside the table. Header cells use th; data cells use td.',
          tests: [
            {
              label: 'There is one table.',
              run: ({ doc }) => doc.querySelectorAll('table').length === 1
            },
            {
              label: 'The caption says "Lesson plan".',
              run: ({ doc }) => textOf(doc, 'table caption') === 'Lesson plan'
            },
            {
              label: 'The header row has two column headers.',
              run: ({ doc }) =>
                doc.querySelectorAll('table thead th[scope="col"]').length === 2
            },
            {
              label: 'The headers are Day and Topic.',
              run: ({ doc }) => {
                const headers = textsOf(doc, 'table thead th');
                return headers.length === 2 && headers[0] === 'Day' && headers[1] === 'Topic';
              }
            },
            {
              label: 'The body has one row with two data cells.',
              run: ({ doc }) =>
                doc.querySelectorAll('table tbody tr').length === 1 &&
                doc.querySelectorAll('table tbody tr td').length === 2
            },
            {
              label: 'The row says Monday and HTML.',
              run: ({ doc }) => {
                const cells = textsOf(doc, 'table tbody td');
                return cells.length === 2 && cells[0] === 'Monday' && cells[1] === 'HTML';
              }
            }
          ]
        }
      },
      {
        id: 'html-15',
        title: 'Row headers',
        minutes: 8,
        xp: 25,
        objective: 'Use th scope="row" to name each row in a table.',
        theory: [
          {
            type: 'p',
            text: 'A table can have column headers and row headers. A row header names the row, like a week or a name. Put a th as the first cell in the row and set scope to row.'
          },
          {
            type: 'code',
            lang: 'html',
            code: `<table>
  <caption>Reading log</caption>
  <thead>
    <tr><th scope="col">Week</th><th scope="col">Pages</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">One</th><td>24</td></tr>
    <tr><th scope="row">Two</th><td>31</td></tr>
  </tbody>
</table>`
          },
          {
            type: 'p',
            text: 'Header cells are not limited to the top row. A th in the first column gives each row a name that a screen reader can announce with its data.'
          },
          {
            type: 'note',
            text: 'Keep numbers in td cells and names in th cells. That keeps the relationship between the header and the value clear.'
          }
        ],
        quiz: {
          question: 'Which element marks a header cell?',
          options: ['<td>', '<th>', '<tr>'],
          answer: 1,
          explanation: 'Th marks a header cell. Td marks a data cell, and tr marks a row.'
        },
        challenge: {
          prompt:
            'Build a reading log table with two weeks. Each row needs a row header and a page count.',
          requirements: [
            'Use one table with the caption "Reading log".',
            'Put column headers Week and Pages in thead with scope="col".',
            'Put two rows in tbody.',
            'Start each row with th scope="row": One and Two.',
            'Put the page counts 24 and 31 in td cells.'
          ],
          starter: page('Reading log', ''),
          solution: page(
            'Reading log',
            `    <table>
      <caption>Reading log</caption>
      <thead>
        <tr><th scope="col">Week</th><th scope="col">Pages</th></tr>
      </thead>
      <tbody>
        <tr><th scope="row">One</th><td>24</td></tr>
        <tr><th scope="row">Two</th><td>31</td></tr>
      </tbody>
    </table>`
          ),
          hint: 'The row header is the first cell in the row. It uses th and scope="row".',
          tests: [
            {
              label: 'The caption says "Reading log".',
              run: ({ doc }) => textOf(doc, 'table caption') === 'Reading log'
            },
            {
              label: 'The column headers are Week and Pages.',
              run: ({ doc }) => {
                const headers = textsOf(doc, 'table thead th[scope="col"]');
                return headers.length === 2 && headers[0] === 'Week' && headers[1] === 'Pages';
              }
            },
            {
              label: 'The body has two rows.',
              run: ({ doc }) => doc.querySelectorAll('table tbody tr').length === 2
            },
            {
              label: 'Every row starts with a row header.',
              run: ({ doc }) =>
                doc.querySelectorAll('table tbody tr').length === 2 &&
                Array.from(doc.querySelectorAll('table tbody tr')).every(
                  (row) => row.firstElementChild?.tagName === 'TH' &&
                    row.firstElementChild.getAttribute('scope') === 'row'
                )
            },
            {
              label: 'The row headers are One and Two.',
              run: ({ doc }) => {
                const headers = textsOf(doc, 'table tbody th');
                return headers.length === 2 && headers[0] === 'One' && headers[1] === 'Two';
              }
            },
            {
              label: 'The page counts are 24 and 31.',
              run: ({ doc }) => {
                const cells = textsOf(doc, 'table tbody td');
                return cells.length === 2 && cells[0] === '24' && cells[1] === '31';
              }
            }
          ]
        }
      }
    ]
  },
  {
    id: 'html-m4',
    title: 'A page that holds together',
    description:
      'Five lessons on metadata, ids and classes, grouping, clean markup, and a page that uses all of it.',
    lessons: [
      {
        id: 'html-16',
        title: 'The head describes the page',
        minutes: 8,
        xp: 25,
        objective: 'Write a head with a charset, viewport, title, and description.',
        theory: [
          {
            type: 'p',
            text: 'The head is not visible, but it tells the browser and search engines what the page is. The charset declares the text encoding. The viewport tells a phone to use the screen width. The title names the tab. The description is a short summary.'
          },
          {
            type: 'code',
            lang: 'html',
            code: `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Field notes</title>
  <meta name="description" content="Notes on building pages.">
</head>`
          },
          {
            type: 'p',
            text: 'Set the language on the html element. It helps screen readers choose the right voice and helps search engines understand the page.'
          },
          {
            type: 'note',
            text: 'The description is not a ranking trick. Write one clear sentence that matches the page.'
          }
        ],
        quiz: {
          question: 'Which element sets the text in the browser tab?',
          options: ['<title>', '<h1>', '<meta name="description">'],
          answer: 0,
          explanation: 'Title sets the tab text. H1 is the visible page heading, and the description is a summary for search engines.'
        },
        challenge: {
          prompt:
            'Write a complete document for a page called "Field notes". Set the language, charset, viewport, title, description, and an h1.',
          requirements: [
            'Start with <!DOCTYPE html>.',
            'Set lang="en" on the html element.',
            'Include meta charset="UTF-8" and the viewport meta tag.',
            'Set the title to "Field notes".',
            'Add a description that says "Notes on building pages."',
            'Put an h1 in the body that says "Field notes".'
          ],
          starter: page('Field notes', ''),
          solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Notes on building pages.">
    <title>Field notes</title>
  </head>
  <body>
    <h1>Field notes</h1>
  </body>
</html>`,
          hint: 'The viewport and description are meta elements in the head. The h1 belongs in the body.',
          tests: [
            {
              label: 'The document starts with <!DOCTYPE html>.',
              run: ({ raw }) => /^\s*<!doctype html>/i.test(raw)
            },
            {
              label: 'The html element declares lang="en".',
              run: ({ doc }) => doc.documentElement?.getAttribute('lang') === 'en'
            },
            {
              label: 'The charset is UTF-8.',
              run: ({ doc }) =>
                (doc.querySelector('meta[charset]')?.getAttribute('charset') || '').toUpperCase() ===
                'UTF-8'
            },
            {
              label: 'The viewport meta tag is present.',
              run: ({ doc }) =>
                Boolean(doc.querySelector('meta[name="viewport"][content*="width=device-width"]'))
            },
            {
              label: 'The title is "Field notes".',
              run: ({ doc }) => textOf(doc, 'title') === 'Field notes'
            },
            {
              label: 'The description is "Notes on building pages."',
              run: ({ doc }) =>
                doc.querySelector('meta[name="description"]')?.getAttribute('content') ===
                'Notes on building pages.'
            },
            {
              label: 'The body has an h1 that says "Field notes".',
              run: ({ doc }) => textOf(doc, 'body h1') === 'Field notes'
            }
          ]
        }
      },
      {
        id: 'html-17',
        title: 'Ids and classes',
        minutes: 8,
        xp: 25,
        objective: 'Use one unique id and a class shared by two elements.',
        theory: [
          {
            type: 'p',
            text: 'An id names one element. It must be unique on the page. A class names a group, so several elements can share it. Use ids for fragment links and labels, and classes for groups you want to style or describe.'
          },
          {
            type: 'code',
            lang: 'html',
            code: `<h2 id="summary">Summary</h2>
<p class="note">First note.</p>
<p class="note">Second note.</p>
<p><a href="#summary">Jump to summary</a></p>`
          },
          {
            type: 'p',
            text: 'The hash link jumps to the element with that id. A class does not create a jump target. Names are case-sensitive in selectors, so keep them lowercase and consistent.'
          },
          {
            type: 'note',
            text: 'Do not repeat an id. A page with duplicate ids is invalid and fragment links become unpredictable.'
          }
        ],
        quiz: {
          question: 'Which attribute can repeat on several elements?',
          options: ['id', 'class', 'for'],
          answer: 1,
          explanation: 'Class can repeat. Id must be unique on the page.'
        },
        challenge: {
          prompt:
            'Create a summary heading with id "summary", two notes that share the class "note", and a link that jumps to the summary.',
          requirements: [
            'Use an h2 with id="summary" and the text "Summary".',
            'Use exactly two p elements with class="note".',
            'The notes say "First note." and "Second note.".',
            'Add a link with href="#summary" and the text "Jump to summary".'
          ],
          starter: page('Ids and classes', ''),
          solution: page(
            'Ids and classes',
            `    <h2 id="summary">Summary</h2>
    <p class="note">First note.</p>
    <p class="note">Second note.</p>
    <p><a href="#summary">Jump to summary</a></p>`
          ),
          hint: 'The id goes on one element. The class goes on both note paragraphs.',
          tests: [
            {
              label: 'The summary heading has id="summary" and says "Summary".',
              run: ({ doc }) =>
                textOf(doc, 'h2#summary') === 'Summary' &&
                doc.querySelectorAll('[id="summary"]').length === 1
            },
            {
              label: 'There are exactly two notes with class="note".',
              run: ({ doc }) => doc.querySelectorAll('p.note').length === 2
            },
            {
              label: 'The notes say "First note." and "Second note.".',
              run: ({ doc }) => {
                const notes = textsOf(doc, 'p.note');
                return notes.length === 2 && notes[0] === 'First note.' && notes[1] === 'Second note.';
              }
            },
            {
              label: 'The link points to #summary and says "Jump to summary".',
              run: ({ doc }) => textOf(doc, 'a[href="#summary"]') === 'Jump to summary'
            },
            {
              label: 'Every id on the page is unique.',
              run: ({ doc }) => {
                const ids = Array.from(doc.querySelectorAll('[id]')).map((node) => node.id);
                return new Set(ids).size === ids.length;
              }
            }
          ]
        }
      },
      {
        id: 'html-18',
        title: 'Grouping with div and span',
        minutes: 7,
        xp: 25,
        objective: 'Group block content with div and inline words with span.',
        theory: [
          {
            type: 'p',
            text: 'A div groups block content. A span groups a few words inside a line. Both are generic containers: they carry no meaning on their own, so use a semantic element first when one fits.'
          },
          {
            type: 'code',
            lang: 'html',
            code: `<div class="notes">
  <p>First note.</p>
  <p>Second note.</p>
</div>
<p>Read the <span class="term">field notes</span> first.</p>`
          },
          {
            type: 'p',
            text: 'Classes give a group a name. A div with class notes can be styled as one block. A span with class term can be styled without breaking the sentence.'
          },
          {
            type: 'note',
            text: 'A div inside a paragraph is invalid. Use span for a piece of a sentence and div for a block.'
          }
        ],
        quiz: {
          question: 'Which element is inline by default?',
          options: ['<div>', '<span>', '<section>'],
          answer: 1,
          explanation: 'Span is inline. Div and section are block elements.'
        },
        challenge: {
          prompt:
            'Group two notes in a div with class "notes", then mark the words "field notes" with a span inside a sentence.',
          requirements: [
            'Use one div with class="notes".',
            'Put exactly two p elements inside the div.',
            'The notes say "First note." and "Second note.".',
            'Use a p outside the div with a span class="term" around "field notes".'
          ],
          starter: page('Grouping', ''),
          solution: page(
            'Grouping',
            `    <div class="notes">
      <p>First note.</p>
      <p>Second note.</p>
    </div>
    <p>Read the <span class="term">field notes</span> first.</p>`
          ),
          hint: 'The span sits inside the sentence. The div holds the two paragraphs.',
          tests: [
            {
              label: 'There is one div with class="notes".',
              run: ({ doc }) => doc.querySelectorAll('div.notes').length === 1
            },
            {
              label: 'The div holds exactly two paragraphs.',
              run: ({ doc }) => doc.querySelectorAll('div.notes > p').length === 2
            },
            {
              label: 'The notes say "First note." and "Second note.".',
              run: ({ doc }) => {
                const notes = textsOf(doc, 'div.notes > p');
                return notes.length === 2 && notes[0] === 'First note.' && notes[1] === 'Second note.';
              }
            },
            {
              label: 'A span with class="term" wraps "field notes".',
              run: ({ doc }) => textOf(doc, 'span.term') === 'field notes'
            },
            {
              label: 'The span is inside a paragraph.',
              run: ({ doc }) => Boolean(doc.querySelector('p span.term'))
            }
          ]
        }
      },
      {
        id: 'html-19',
        title: 'Comments and tidy nesting',
        minutes: 7,
        xp: 25,
        objective: 'Leave a useful comment and keep a list properly nested inside main.',
        theory: [
          {
            type: 'p',
            text: 'An HTML comment starts with <!-- and ends with -->. The browser ignores it. Comments are for the next person who reads the source, not for hiding content from visitors.'
          },
          {
            type: 'code',
            lang: 'html',
            code: `<!-- Field notes -->
<main>
  <ul>
    <li>Read</li>
    <li>Write</li>
    <li>Check</li>
  </ul>
</main>`
          },
          {
            type: 'p',
            text: 'Tidy nesting means every element closes inside its parent. A list item belongs inside a list, and the list belongs inside main. The browser can recover from mistakes, but the tree may not be the one you meant.'
          },
          {
            type: 'note',
            text: 'Do not put one comment inside another. The first --> closes the comment, and the rest becomes visible text.'
          }
        ],
        quiz: {
          question: 'How does an HTML comment start?',
          options: ['<!--', '/*', '//'],
          answer: 0,
          explanation: 'HTML comments start with <!-- and end with -->. The other two are CSS and JavaScript comment styles.'
        },
        challenge: {
          prompt:
            'Add a comment that says "Field notes" before a main element. Inside main, put a list of three steps: Read, Write, Check.',
          requirements: [
            'Add exactly one HTML comment with the text "Field notes".',
            'Use one main element.',
            'Put one ul inside main.',
            'The list has three li elements: Read, Write, Check.'
          ],
          starter: page('Comments', ''),
          solution: page(
            'Comments',
            `    <!-- Field notes -->
    <main>
      <ul>
        <li>Read</li>
        <li>Write</li>
        <li>Check</li>
      </ul>
    </main>`
          ),
          hint: 'The comment goes before main. The ul goes inside main, and each li goes inside the ul.',
          tests: [
            {
              label: 'The source has exactly one comment.',
              run: ({ raw }) => (raw.match(/<!--/g) || []).length === 1
            },
            {
              label: 'The comment says "Field notes".',
              run: ({ raw }) => /<!--\s*Field notes\s*-->/i.test(raw)
            },
            {
              label: 'There is one main element.',
              run: ({ doc }) => doc.querySelectorAll('main').length === 1
            },
            {
              label: 'The list is inside main.',
              run: ({ doc }) => Boolean(doc.querySelector('main > ul'))
            },
            {
              label: 'The list has the three steps in order.',
              run: ({ doc }) => {
                const steps = textsOf(doc, 'main > ul > li');
                return (
                  steps.length === 3 &&
                  steps[0] === 'Read' &&
                  steps[1] === 'Write' &&
                  steps[2] === 'Check'
                );
              }
            }
          ]
        }
      },
      {
        id: 'html-20',
        title: 'Capstone: a field notes page',
        minutes: 12,
        xp: 40,
        objective: 'Build one page with landmarks, a figure, a list, and a working jump link.',
        theory: [
          {
            type: 'p',
            text: 'This page brings the module together. A reader should be able to find the header, jump to the notes, read an article, see a captioned figure, and reach the footer without guessing.'
          },
          {
            type: 'code',
            lang: 'html',
            code: `<header>
  <h1>Field notes</h1>
  <nav><a href="#notes">Notes</a></nav>
</header>
<main id="notes">
  <article>
    <h2>A page is a tree</h2>
    <p>Structure comes before style.</p>
  </article>
</main>
<footer><p>Kodingu</p></footer>`
          },
          {
            type: 'p',
            text: 'Start with the regions, then fill them. Keep one h1, put the article inside main, and give every image useful alt text. A figure is a good home for an image and its caption.'
          },
          {
            type: 'note',
            text: 'The page should still make sense with the styles removed. That is the test of good structure.'
          }
        ],
        quiz: {
          question: 'Which element should wrap the main content once?',
          options: ['<main>', '<header>', '<article>'],
          answer: 0,
          explanation: 'Main wraps the main content and appears once. Article can appear more than once.'
        },
        challenge: {
          prompt:
            'Build the field notes page. Use a header with a nav, a main article with a figure and a list, and a footer. The nav link should jump to main.',
          requirements: [
            'Set the title to "Field notes".',
            'Use one header with an h1 "Field notes" and a nav link to #notes that says "Notes".',
            'Use one main with id="notes" containing one article.',
            'Put an h2 "A page is a tree", a paragraph, a figure, and a ul inside the article.',
            'The figure needs the seal image with alt "A vermilion square" and the caption "The Kodingu seal".',
            'The list has two items: Structure and Style.',
            'Use one footer with the text "Kodingu".'
          ],
          starter: page('Field notes', ''),
          solution: page(
            'Field notes',
            `    <header>
      <h1>Field notes</h1>
      <nav><a href="#notes">Notes</a></nav>
    </header>
    <main id="notes">
      <article>
        <h2>A page is a tree</h2>
        <p>Structure comes before style.</p>
        <figure>
          <img src="${seal}" alt="A vermilion square">
          <figcaption>The Kodingu seal</figcaption>
        </figure>
        <ul>
          <li>Structure</li>
          <li>Style</li>
        </ul>
      </article>
    </main>
    <footer>
      <p>Kodingu</p>
    </footer>`
          ),
          hint: 'Build the landmarks first: header, main, footer. Then put the article inside main and fill it.',
          tests: [
            {
              label: 'The title is "Field notes".',
              run: ({ doc }) => textOf(doc, 'title') === 'Field notes'
            },
            {
              label: 'The header has an h1 "Field notes" and a nav link "Notes".',
              run: ({ doc }) =>
                textOf(doc, 'header h1') === 'Field notes' &&
                textOf(doc, 'header nav a[href="#notes"]') === 'Notes'
            },
            {
              label: 'There is one main with id="notes".',
              run: ({ doc }) =>
                doc.querySelectorAll('main').length === 1 &&
                doc.querySelector('main#notes') !== null
            },
            {
              label: 'The article is inside main.',
              run: ({ doc }) => Boolean(doc.querySelector('main#notes > article'))
            },
            {
              label: 'The article starts with the h2 "A page is a tree" and a paragraph.',
              run: ({ doc }) =>
                textOf(doc, 'main article h2') === 'A page is a tree' &&
                Boolean(doc.querySelector('main article p'))
            },
            {
              label: 'The figure has the seal image with alt text.',
              run: ({ doc }) => {
                const image = doc.querySelector('main article figure img');
                return (
                  image?.getAttribute('alt') === 'A vermilion square' &&
                  (image.getAttribute('src') || '').startsWith('data:image/svg+xml')
                );
              }
            },
            {
              label: 'The figure caption says "The Kodingu seal".',
              run: ({ doc }) => textOf(doc, 'main article figure figcaption') === 'The Kodingu seal'
            },
            {
              label: 'The list has the items Structure and Style.',
              run: ({ doc }) => {
                const items = textsOf(doc, 'main article ul > li');
                return items.length === 2 && items[0] === 'Structure' && items[1] === 'Style';
              }
            },
            {
              label: 'The footer says "Kodingu".',
              run: ({ doc }) => textOf(doc, 'footer') === 'Kodingu'
            },
            {
              label: 'The page has one h1 and one main.',
              run: ({ doc }) =>
                doc.querySelectorAll('h1').length === 1 && doc.querySelectorAll('main').length === 1
            }
          ]
        }
      }
    ]
  }
];
