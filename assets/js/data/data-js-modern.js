import {
  challenge,
  check,
  code,
  lesson,
  lessonModule,
  note,
  p,
  quiz,
  text
} from './lesson-builder.js';

const typePreview = `<main>
  <p id="type">No type.</p>
  <p id="value">No value.</p>
</main>`;

const closurePreview = `<main>
  <p id="first">0</p>
  <p id="second">0</p>
</main>`;

const classPreview = `<main>
  <h1 id="title">Draft</h1>
  <p id="label">No label.</p>
</main>`;

const jsonPreview = `<main>
  <h1 id="title">Draft</h1>
  <p id="summary">No summary.</p>
</main>`;

export const jsModern = [
  lessonModule(
    'js-m4',
    'Modern JavaScript',
    'Four lessons on types, closures, classes, and data that arrives asynchronously.',
    [
      lesson(
        'js-12',
        'Types, truthiness, and equality',
        8,
        'Display the type of a number and compare a number with a numeric string using strict equality.',
        [
          p('A value has a type. Strings, numbers, booleans, undefined, null, symbols, and bigints are primitives. Arrays and objects are reference values. typeof returns a short name for most of them.'),
          code(
            'js',
            `const count = 3;
const label = '3';

document.querySelector('#type').textContent = typeof count;
document.querySelector('#value').textContent =
  count === Number(label) ? 'same number' : 'different';`
          ),
          p('The triple equals compares type and value. The double equals converts first, so 3 == "3" is true. Convert on purpose with Number() or String(), then compare the result.'),
          note('NaN is a number by type, and null reports as object. Use Number.isNaN() and an explicit null check instead of guessing from typeof.')
        ],
        quiz(
          'Which value is falsy?',
          ['The string "0"', 'The number 0', 'An empty array'],
          1,
          'The number 0 is falsy. A nonempty string and an empty array are truthy.'
        ),
        challenge(
          'Create count as 3 and label as "3". Show the type of count in #type, then compare count with the converted label using strict equality and show "same number" in #value.',
          [
            'Declare const count as 3.',
            'Declare const label as "3".',
            'Write typeof count into #type.',
            'Convert label with Number().',
            'Use === to compare the two numbers and write "same number" into #value.'
          ],
          `const count = 3;
const label = '3';

document.querySelector('#type').textContent = 'No type.';
document.querySelector('#value').textContent = 'No value.';`,
          `const count = 3;
const label = '3';

document.querySelector('#type').textContent = typeof count;
document.querySelector('#value').textContent =
  count === Number(label) ? 'same number' : 'different';`,
          'Typeof count returns "number". Number(label) turns the string into a number before the strict comparison.',
          [
            text('The page reports the type as number.', '#type', 'number'),
            text('The values compare as the same number.', '#value', 'same number'),
            check('The source reads the type with typeof.', ({ raw }) => raw.includes('typeof')),
            check(
              'The source uses strict equality and an explicit conversion.',
              ({ raw }) => raw.includes('===') && raw.includes('Number(')
            )
          ]
        ),
        { language: 'js', preview: typePreview }
      ),
      lesson(
        'js-13',
        'Closures keep state',
        9,
        'Create a makeCounter factory that returns an arrow function and remembers its count.',
        [
          p('Scope decides where a name can be read. A let or const declared inside a block exists only in that block. A function can keep a reference to a variable from the scope where it was created. That is a closure.'),
          code(
            'js',
            `function makeCounter() {
  let count = 0;
  return () => {
    count += 1;
    return count;
  };
}

const next = makeCounter();`
          ),
          p('Each call to makeCounter creates a new count. The returned arrow function closes over that variable, so it can change it after makeCounter has returned. No global variable is needed.'),
          note('Arrow functions do not have their own this. That is useful in callbacks, but use a regular function when you need this from the object that called it.')
        ],
        quiz(
          'What does a closure keep access to?',
          ['Only global variables', 'Variables from the scope where it was created', 'Only its own parameters'],
          1,
          'A closure keeps a reference to its outer scope, even after that outer function has returned.'
        ),
        challenge(
          'Write makeCounter() with a private let count that starts at 0. It should return an arrow function that adds one and returns the count. Call it twice and show 1 and 2.',
          [
            'Declare a function named makeCounter.',
            'Declare let count inside makeCounter.',
            'Return an arrow function.',
            'Increase count and return it from the arrow function.',
            'Create next with makeCounter().',
            'Write the first call to #first and the second call to #second.'
          ],
          `const next = () => 0;

document.querySelector('#first').textContent = String(next());
document.querySelector('#second').textContent = String(next());`,
          `function makeCounter() {
  let count = 0;
  return () => {
    count += 1;
    return count;
  };
}

const next = makeCounter();

document.querySelector('#first').textContent = String(next());
document.querySelector('#second').textContent = String(next());`,
          'Count belongs inside makeCounter. The returned arrow function changes it. Each later call sees the updated value.',
          [
            text('The first call returns 1.', '#first', '1'),
            text('The second call returns 2.', '#second', '2'),
            check('The returned function is an arrow function.', ({ raw }) => raw.includes('=>')),
            check('The count is declared with let inside the factory.', ({ raw }) =>
              /function\s+makeCounter\s*\(\s*\)\s*\{[\s\S]*?\blet\s+count\b/.test(raw)
            )
          ]
        ),
        { language: 'js', preview: closurePreview }
      ),
      lesson(
        'js-14',
        'Classes and instances',
        9,
        'Write a Note class with a constructor and a label method, then show one instance.',
        [
          p('A class is a template for objects that share data and behavior. The constructor runs when you create an instance with new. This refers to the instance being built.'),
          code(
            'js',
            `class Note {
  constructor(title, minutes) {
    this.title = title;
    this.minutes = minutes;
  }

  label() {
    return \`\${this.title} (\${this.minutes} min)\`;
  }
}

const note = new Note('Classes', 9);`
          ),
          p('The constructor stores title and minutes on the instance. The label method reads both through this. Each new Note gets its own values, while the method comes from the class.'),
          note('Call a method with note.label(). If you pass note.label without calling it, you pass the function itself and no value is produced.')
        ],
        quiz(
          'What does new do when it is used with a class?',
          ['It edits the class definition', 'It creates an instance and runs the constructor', 'It prints the class'],
          1,
          'New creates an object, sets its prototype, runs the constructor, and returns the instance.'
        ),
        challenge(
          'Write a Note class with a constructor that stores title and minutes. Add a label() method that returns "title (minutes min)". Create a note for "Classes" and 9 minutes, then write its title and label.',
          [
            'Declare a class named Note.',
            'Add a constructor with title and minutes parameters.',
            'Store both values on this.',
            'Add a label method that uses this.title and this.minutes.',
            'Create an instance with new Note("Classes", 9).',
            'Write the instance title and label to the page.'
          ],
          `document.querySelector('#title').textContent = 'Draft';
document.querySelector('#label').textContent = 'No label.';`,
          `class Note {
  constructor(title, minutes) {
    this.title = title;
    this.minutes = minutes;
  }

  label() {
    return \`\${this.title} (\${this.minutes} min)\`;
  }
}

const note = new Note('Classes', 9);

document.querySelector('#title').textContent = note.title;
document.querySelector('#label').textContent = note.label();`,
          'The class needs a constructor and one method. Use this inside both. Create the instance after the class declaration.',
          [
            text('The heading shows the note title.', '#title', 'Classes'),
            text('The label combines the title and minutes.', '#label', 'Classes (9 min)'),
            check('The source declares a Note class.', ({ raw }) => /\bclass\s+Note\b/.test(raw)),
            check('The source creates an instance with new.', ({ raw }) => /\bnew\s+Note\s*\(/.test(raw))
          ]
        ),
        { language: 'js', preview: classPreview }
      ),
      lesson(
        'js-15',
        'JSON and async',
        9,
        'Parse a JSON payload inside an async function and display its title and count.',
        [
          p('JSON is a text format for data. JSON.parse turns text into a JavaScript value. JSON.stringify goes the other way. A network request returns a promise, a value that will arrive later.'),
          code(
            'js',
            `const payload = '{"title":"Field notes","count":3}';

async function show() {
  const data = await Promise.resolve(JSON.parse(payload));
  document.querySelector('#title').textContent = data.title;
  document.querySelector('#summary').textContent = \`\${data.count} notes\`;
}

show();`
          ),
          p('An async function always returns a promise. Await pauses that function until the promise settles, without blocking the rest of the page. The code after await runs when the value is ready.'),
          note('JSON keys and string values use double quotes. JSON.parse throws on invalid text, so a real request belongs in a try and catch block.')
        ],
        quiz(
          'What does await do inside an async function?',
          ['It stops the whole page', 'It waits for a promise to settle', 'It converts text to JSON'],
          1,
          'Await pauses the async function until the promise resolves. Other page work can continue.'
        ),
        challenge(
          'Parse the payload JSON inside an async function. Await Promise.resolve with the parsed value, then write the title and "3 notes" into the page.',
          [
            'Keep the payload string as valid JSON.',
            'Use JSON.parse to read the payload.',
            'Write an async function that awaits Promise.resolve.',
            'Set #title to the parsed title.',
            'Set #summary to the count followed by " notes".'
          ],
          `const payload = '{"title":"Field notes","count":3}';

document.querySelector('#title').textContent = 'Draft';
document.querySelector('#summary').textContent = 'No summary.';`,
          `const payload = '{"title":"Field notes","count":3}';

async function show() {
  const data = await Promise.resolve(JSON.parse(payload));
  document.querySelector('#title').textContent = data.title;
  document.querySelector('#summary').textContent = \`\${data.count} notes\`;
}

show();`,
          'Parse first, then await the resolved value. The two textContent lines use the parsed object.',
          [
            text('The page shows the parsed title.', '#title', 'Field notes'),
            text('The page shows the parsed count.', '#summary', '3 notes'),
            check('The source parses JSON.', ({ raw }) => raw.includes('JSON.parse')),
            check(
              'The source uses an async function and await.',
              ({ raw }) => raw.includes('async') && raw.includes('await')
            )
          ]
        ),
        { language: 'js', preview: jsonPreview }
      )
    ]
  )
];
