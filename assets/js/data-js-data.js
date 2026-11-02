import {
  challenge,
  check,
  code,
  lesson,
  lessonModule,
  note,
  p,
  quiz,
  text,
  texts
} from './lesson-builder.js';

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
  lessonModule(
    'js-m3',
    'Objects, arrays, and errors',
    'Three lessons on named values, list methods, and errors that explain themselves.',
    [
      lesson(
        'js-09',
        'Objects hold named values',
        8,
        'Group related values in an object and read them by name.',
        [
          p('An object groups values under names. A lesson has a title, a length, and an address, and those three belong together. An array would make you remember the position of each one.'),
          code(
            'js',
            `const lesson = {
  title: 'Objects',
  minutes: 9
};

document.querySelector('#title').textContent = lesson.title;
document.querySelector('#summary').textContent = \`\${lesson.minutes} minutes\`;`
          ),
          p('The dot reads a property by name. A template literal inserts the value into a sentence. The object stays one value, so it can be passed to a function without losing the parts.'),
          note('Use a trailing comma after the last property. It makes the next change a one line diff instead of a two line one.')
        ],
        quiz(
          'How do you read the title property of an object named lesson?',
          ['lesson(title)', 'lesson.title', 'lesson[title]'],
          1,
          'The dot reads a property by its name. lesson[title] would look up a variable named title.'
        ),
        challenge(
          'Create an object named lesson with a title of "Objects" and minutes of 9, then write both values into the page.',
          [
            'Declare a const named lesson with a title property of "Objects".',
            'Give the object a minutes property of 9.',
            'Set #title to lesson.title.',
            'Set #summary to "9 minutes" using lesson.minutes.'
          ],
          `const lesson = {};

document.querySelector('#title').textContent = 'Draft';
document.querySelector('#summary').textContent = 'No summary.';`,
          `const lesson = {
  title: 'Objects',
  minutes: 9
};

document.querySelector('#title').textContent = lesson.title;
document.querySelector('#summary').textContent = \`\${lesson.minutes} minutes\`;`,
          'Write the two properties between the braces, then read them with a dot in the textContent lines.',
          [
            text('The heading shows the object title.', '#title', 'Objects'),
            text('The summary shows "9 minutes".', '#summary', '9 minutes'),
            check(
              'The script reads both properties from the object.',
              ({ raw }) => raw.includes('lesson.title') && raw.includes('lesson.minutes')
            )
          ]
        ),
        { language: 'js', preview: objectPreview }
      ),
      lesson(
        'js-10',
        'Arrays that do the work',
        9,
        'Turn an array into list items with map() and join().',
        [
          p('An array holds values in order. map() builds a new array by running a function on each item. join() glues the result into one string.'),
          code(
            'js',
            `const topics = ['metadata', 'media', 'landmarks'];
const list = document.querySelector('#list');

list.innerHTML = topics.map((topic) => \`<li>\${topic}</li>\`).join('');
document.querySelector('#count').textContent = \`\${topics.length} items\`;`
          ),
          p('The callback receives one topic at a time and returns a string. join("") turns the array of strings into one string with no separator, which is what innerHTML needs.'),
          note('Without join, the array is converted to a comma separated string. The commas end up between the list items in the page.')
        ],
        quiz(
          'What does map() return?',
          ['The original array changed in place', 'A new array with one result per item', 'A single string'],
          1,
          'map() returns a new array. join() is what turns that array into one string.'
        ),
        challenge(
          'Build list items from the topics array with map() and join(""), then write the number of topics into #count.',
          [
            'Declare an array named topics with "metadata", "media", and "landmarks".',
            'Build the list items with topics.map().',
            'Join the result with an empty string before assigning to innerHTML.',
            'Set #count to "3 items".'
          ],
          `const topics = [];
const list = document.querySelector('#list');

list.innerHTML = '';
document.querySelector('#count').textContent = '0 items';`,
          `const topics = ['metadata', 'media', 'landmarks'];
const list = document.querySelector('#list');

list.innerHTML = topics.map((topic) => \`<li>\${topic}</li>\`).join('');
document.querySelector('#count').textContent = \`\${topics.length} items\`;`,
          'The map callback returns a string with an li. join("") turns the array of strings into markup.',
          [
            texts(
              'The list contains the three topics in order.',
              '#list li',
              ['metadata', 'media', 'landmarks']
            ),
            text('The count reads "3 items".', '#count', '3 items'),
            check(
              'The script uses map() and join().',
              ({ raw }) => raw.includes('.map(') && raw.includes('.join(')
            )
          ]
        ),
        { language: 'js', preview: arrayPreview }
      ),
      lesson(
        'js-11',
        'Errors that explain themselves',
        8,
        'Catch a failing parse with try and catch, then tell the reader what happened.',
        [
          p('Some functions fail on bad input. JSON.parse throws when the text is not valid JSON. An uncaught throw stops the whole script, so every line after it never runs.'),
          code(
            'js',
            `const result = document.querySelector('#result');

try {
  JSON.parse('{ bad json');
  result.textContent = 'Read the notes.';
} catch (error) {
  result.textContent = 'Could not read the notes.';
}`
          ),
          p('The try block holds the code that might fail. The catch block runs only when it does, and receives the error. The page keeps working either way.'),
          note('Catch what you can explain. An empty catch hides a real problem and leaves the reader with a page that silently does nothing.')
        ],
        quiz(
          'When does a catch block run?',
          ['Always', 'Only when the try block throws', 'Only when the try block returns'],
          1,
          'catch runs when a statement inside try throws. If nothing throws, the catch block is skipped.'
        ),
        challenge(
          'Parse the broken JSON inside a try block. On success write "Read the notes.", on failure write "Could not read the notes." into #result.',
          [
            'Use a try block around JSON.parse.',
            'Add a catch block that receives the error.',
            'Write "Read the notes." when parsing succeeds.',
            'Write "Could not read the notes." when parsing fails.'
          ],
          `const result = document.querySelector('#result');
const notes = '{ bad json';

result.textContent = notes;`,
          `const result = document.querySelector('#result');

try {
  JSON.parse('{ bad json');
  result.textContent = 'Read the notes.';
} catch (error) {
  result.textContent = 'Could not read the notes.';
}`,
          'The parse and the success message go inside try. The failure message goes inside catch.',
          [
            text(
              'The page reports that the notes could not be read.',
              '#result',
              'Could not read the notes.'
            ),
            check(
              'The script handles the failure with try and catch.',
              ({ raw }) => raw.includes('try') && raw.includes('catch')
            )
          ]
        ),
        { language: 'js', preview: errorPreview }
      )
    ]
  )
];
