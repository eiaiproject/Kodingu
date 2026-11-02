import { textOf, textsOf } from './data-helpers.js';

const objectPreview = `<main>
  <h1 id="title">Draft</h1>
  <p id="summary">No summary.</p>
</main>`;

const arrayPreview = `<main>
  <ul id="list"></ul>
  <p id="count">0 items</p>
</main>`;

const errorPreview = `<main>
  <p id="result">Waiting.</p>
</main>`;

export const jsData = [
  {
    id: 'js-m3',
    title: 'Objects, arrays, and errors',
    description:
      'Three lessons on named values, list methods, and errors that explain themselves.',
    lessons: [
      {
        id: 'js-09',
        title: 'Objects hold named values',
        minutes: 8,
        xp: 25,
        language: 'js',
        preview: objectPreview,
        objective: 'Group related values in an object and read them by name.',
        theory: [
          {
            type: 'p',
            text: 'An object groups values under names. A lesson has a title, a length, and an address, and those three belong together. An array would make you remember the position of each one.'
          },
          {
            type: 'code',
            lang: 'js',
            code: `const lesson = {
  title: 'Objects',
  minutes: 9
};

document.querySelector('#title').textContent = lesson.title;
document.querySelector('#summary').textContent = \`\${lesson.minutes} minutes\`;`
          },
          {
            type: 'p',
            text: 'The dot reads a property by name. A template literal inserts the value into a sentence. The object stays one value, so it can be passed to a function without losing the parts.'
          },
          {
            type: 'note',
            text: 'Use a trailing comma after the last property. It makes the next change a one line diff instead of a two line one.'
          }
        ],
        quiz: {
          question: 'How do you read the title property of an object named lesson?',
          options: ['lesson(title)', 'lesson.title', 'lesson[title]'],
          answer: 1,
          explanation:
            'The dot reads a property by its name. lesson[title] would look up a variable named title.'
        },
        challenge: {
          prompt:
            'Create an object named lesson with a title of "Objects" and minutes of 9, then write both values into the page.',
          requirements: [
            'Declare a const named lesson with a title property of "Objects".',
            'Give the object a minutes property of 9.',
            'Set #title to lesson.title.',
            'Set #summary to "9 minutes" using lesson.minutes.'
          ],
          starter: `const lesson = {};

document.querySelector('#title').textContent = 'Draft';
document.querySelector('#summary').textContent = 'No summary.';`,
          solution: `const lesson = {
  title: 'Objects',
  minutes: 9
};

document.querySelector('#title').textContent = lesson.title;
document.querySelector('#summary').textContent = \`\${lesson.minutes} minutes\`;`,
          hint: 'Write the two properties between the braces, then read them with a dot in the textContent lines.',
          tests: [
            {
              label: 'The heading shows the object title.',
              run: ({ doc }) => textOf(doc, '#title') === 'Objects'
            },
            {
              label: 'The summary shows "9 minutes".',
              run: ({ doc }) => textOf(doc, '#summary') === '9 minutes'
            },
            {
              label: 'The script reads both properties from the object.',
              run: ({ raw }) => raw.includes('lesson.title') && raw.includes('lesson.minutes')
            }
          ]
        }
      },
      {
        id: 'js-10',
        title: 'Arrays that do the work',
        minutes: 9,
        xp: 25,
        language: 'js',
        preview: arrayPreview,
        objective: 'Turn an array into list items with map() and join().',
        theory: [
          {
            type: 'p',
            text: 'An array holds values in order. map() builds a new array by running a function on each item. join() glues the result into one string.'
          },
          {
            type: 'code',
            lang: 'js',
            code: `const topics = ['metadata', 'media', 'landmarks'];
const list = document.querySelector('#list');

list.innerHTML = topics.map((topic) => \`<li>\${topic}</li>\`).join('');
document.querySelector('#count').textContent = \`\${topics.length} items\`;`
          },
          {
            type: 'p',
            text: 'The callback receives one topic at a time and returns a string. join("") turns the array of strings into one string with no separator, which is what innerHTML needs.'
          },
          {
            type: 'note',
            text: 'Without join, the array is converted to a comma separated string. The commas end up between the list items in the page.'
          }
        ],
        quiz: {
          question: 'What does map() return?',
          options: ['The original array changed in place', 'A new array with one result per item', 'A single string'],
          answer: 1,
          explanation:
            'map() returns a new array. join() is what turns that array into one string.'
        },
        challenge: {
          prompt:
            'Build list items from the topics array with map() and join(""), then write the number of topics into #count.',
          requirements: [
            'Declare an array named topics with "metadata", "media", and "landmarks".',
            'Build the list items with topics.map().',
            'Join the result with an empty string before assigning to innerHTML.',
            'Set #count to "3 items".'
          ],
          starter: `const topics = [];
const list = document.querySelector('#list');

list.innerHTML = '';
document.querySelector('#count').textContent = '0 items';`,
          solution: `const topics = ['metadata', 'media', 'landmarks'];
const list = document.querySelector('#list');

list.innerHTML = topics.map((topic) => \`<li>\${topic}</li>\`).join('');
document.querySelector('#count').textContent = \`\${topics.length} items\`;`,
          hint: 'The map callback returns a string with an li. join("") turns the array of strings into markup.',
          tests: [
            {
              label: 'The list contains the three topics in order.',
              run: ({ doc }) => textsOf(doc, '#list li').join(',') === 'metadata,media,landmarks'
            },
            {
              label: 'The count reads "3 items".',
              run: ({ doc }) => textOf(doc, '#count') === '3 items'
            },
            {
              label: 'The script uses map() and join().',
              run: ({ raw }) => raw.includes('.map(') && raw.includes('.join(')
            }
          ]
        }
      },
      {
        id: 'js-11',
        title: 'Errors that explain themselves',
        minutes: 8,
        xp: 25,
        language: 'js',
        preview: errorPreview,
        objective: 'Catch a failing parse with try and catch, then tell the reader what happened.',
        theory: [
          {
            type: 'p',
            text: 'Some functions fail on bad input. JSON.parse throws when the text is not valid JSON. An uncaught throw stops the whole script, so every line after it never runs.'
          },
          {
            type: 'code',
            lang: 'js',
            code: `const result = document.querySelector('#result');

try {
  JSON.parse('{ bad json');
  result.textContent = 'Read the notes.';
} catch (error) {
  result.textContent = 'Could not read the notes.';
}`
          },
          {
            type: 'p',
            text: 'The try block holds the code that might fail. The catch block runs only when it does, and receives the error. The page keeps working either way.'
          },
          {
            type: 'note',
            text: 'Catch what you can explain. An empty catch hides a real problem and leaves the reader with a page that silently does nothing.'
          }
        ],
        quiz: {
          question: 'When does a catch block run?',
          options: ['Always', 'Only when the try block throws', 'Only when the try block returns'],
          answer: 1,
          explanation:
            'catch runs when a statement inside try throws. If nothing throws, the catch block is skipped.'
        },
        challenge: {
          prompt:
            'Parse the broken JSON inside a try block. On success write "Read the notes.", on failure write "Could not read the notes." into #result.',
          requirements: [
            'Use a try block around JSON.parse.',
            'Add a catch block that receives the error.',
            'Write "Read the notes." when parsing succeeds.',
            'Write "Could not read the notes." when parsing fails.'
          ],
          starter: `const result = document.querySelector('#result');
const notes = '{ bad json';

result.textContent = notes;`,
          solution: `const result = document.querySelector('#result');

try {
  JSON.parse('{ bad json');
  result.textContent = 'Read the notes.';
} catch (error) {
  result.textContent = 'Could not read the notes.';
}`,
          hint: 'The parse and the success message go inside try. The failure message goes inside catch.',
          tests: [
            {
              label: 'The page reports that the notes could not be read.',
              run: ({ doc }) => textOf(doc, '#result') === 'Could not read the notes.'
            },
            {
              label: 'The script handles the failure with try and catch.',
              run: ({ raw }) => raw.includes('try') && raw.includes('catch')
            }
          ]
        }
      }
    ]
  }
];
