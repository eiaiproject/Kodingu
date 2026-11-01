import { textOf, textsOf } from './data-helpers.js';

const variablesPreview = `<main>
  <h1 id="title">Draft</h1>
  <p id="summary">No summary yet.</p>
</main>`;

const stringsPreview = `<main>
  <h1 id="greeting">Hello.</h1>
  <p id="path">/course/placeholder</p>
</main>`;

const conditionPreview = `<main>
  <p id="count">0 lessons</p>
  <p id="status">No status.</p>
</main>`;

const loopPreview = `<main>
  <h1>Lesson list</h1>
  <ul id="list"></ul>
</main>`;

const functionPreview = `<main>
  <p id="price">No total.</p>
  <p id="tax">No tax.</p>
</main>`;

const selectPreview = `<main>
  <h1 id="page-title">Draft</h1>
  <p class="note">First note.</p>
  <p class="note">Second note.</p>
</main>`;

const eventPreview = `<main>
  <p id="count">0</p>
  <button id="add" type="button">Add one</button>
</main>`;

const counterPreview = `<main>
  <h1>Field notes</h1>
  <p id="count">0 notes</p>
  <button id="add" type="button">Add note</button>
  <button id="reset" type="button">Reset</button>
  <ul id="notes"></ul>
</main>`;

export const jsModules = [
  {
    id: 'js-m1',
    title: 'Values and the page',
    description:
      'Four lessons on variables, strings, conditionals, and lists that change the page.',
    lessons: [
      {
        id: 'js-01',
        title: 'Values and variables',
        minutes: 8,
        xp: 25,
        language: 'js',
        preview: variablesPreview,
        objective: 'Store text and a number in variables, then write them into the page.',
        theory: [
          {
            type: 'p',
            text: 'JavaScript runs in the browser after the page is parsed. It can read the page, change it, and respond to a click. A variable is a name for a value you want to use more than once.'
          },
          {
            type: 'code',
            lang: 'js',
            code: `const topic = 'Field notes';
let count = 3;

document.querySelector('#title').textContent = topic;
document.querySelector('#summary').textContent = \`\${count} notes\`;`
          },
          {
            type: 'p',
            text: 'Use const for a value that will not be reassigned, and let for one that will change. The textContent property replaces the text inside an element. A template literal uses backticks and inserts a value with ${}.'
          },
          {
            type: 'note',
            text: 'JavaScript is case-sensitive. topic and Topic are two different names.'
          }
        ],
        quiz: {
          question: 'Which keyword declares a value that cannot be reassigned?',
          options: ['let', 'const', 'var'],
          answer: 1,
          explanation: 'Const declares a binding that cannot be reassigned. Let allows a new value later.'
        },
        challenge: {
          prompt:
            'Create a const named topic with the value "Field notes" and a let named count with the value 3. Write them into the page.',
          requirements: [
            'Declare const topic as "Field notes".',
            'Declare let count as 3.',
            'Set #title to "Field notes".',
            'Set #summary to "3 notes".'
          ],
          starter: `// Start with two variables.\n\n`,
          solution: `const topic = 'Field notes';
let count = 3;

document.querySelector('#title').textContent = topic;
document.querySelector('#summary').textContent = \`\${count} notes\`;`,
          hint: 'Use textContent on the h1 and the paragraph. The summary combines count and the word notes.',
          tests: [
            {
              label: 'The script runs without errors.',
              run: ({ error }) => !error
            },
            {
              label: 'The title says "Field notes".',
              run: ({ doc }) => textOf(doc, '#title') === 'Field notes'
            },
            {
              label: 'The summary says "3 notes".',
              run: ({ doc }) => textOf(doc, '#summary') === '3 notes'
            },
            {
              label: 'The source declares const topic.',
              run: ({ raw }) => /\bconst\s+topic\b/.test(raw)
            },
            {
              label: 'The source declares let count.',
              run: ({ raw }) => /\blet\s+count\b/.test(raw)
            }
          ]
        }
      },
      {
        id: 'js-02',
        title: 'Strings and template literals',
        minutes: 8,
        xp: 25,
        language: 'js',
        preview: stringsPreview,
        objective: 'Join strings with a template literal and change their case.',
        theory: [
          {
            type: 'p',
            text: 'A string is text between quotes or backticks. A template literal uses backticks and can hold an expression inside ${}. That keeps a sentence readable when it mixes fixed words and values.'
          },
          {
            type: 'code',
            lang: 'js',
            code: `const course = 'HTML';
const lesson = 2;

document.querySelector('#greeting').textContent = \`\${course} lesson \${lesson}\`;
document.querySelector('#path').textContent =
  \`/course/\${course.toLowerCase()}/lesson-0\${lesson}\`;`
          },
          {
            type: 'p',
            text: 'Strings have methods. ToLowerCase returns a lowercase copy, and it does not change the original variable. Join a path with slashes and keep each part in the right case.'
          },
          {
            type: 'note',
            text: 'Use a template literal when a sentence mixes values. Use a plain string when nothing is inserted.'
          }
        ],
        quiz: {
          question: 'What does ${} do inside a template literal?',
          options: [
            'It adds a comment.',
            'It inserts the value of an expression.',
            'It starts a new line.'
          ],
          answer: 1,
          explanation: 'The braces hold an expression, and its value is inserted into the string.'
        },
        challenge: {
          prompt:
            'Create course as "HTML" and lesson as 2. Set the greeting to "HTML lesson 2" and the path to "/course/html/lesson-02".',
          requirements: [
            'Declare const course as "HTML".',
            'Declare const lesson as 2.',
            'Set #greeting with a template literal.',
            'Set #path with a lowercase course name.',
            'Use toLowerCase for the course part of the path.'
          ],
          starter: `// Build the greeting and the path.\n\n`,
          solution: `const course = 'HTML';
const lesson = 2;

document.querySelector('#greeting').textContent = \`\${course} lesson \${lesson}\`;
document.querySelector('#path').textContent =
  \`/course/\${course.toLowerCase()}/lesson-0\${lesson}\`;`,
          hint: 'The greeting needs the course, a space, the word lesson, and the number. The path needs slashes and a lowercase course name.',
          tests: [
            {
              label: 'The script runs without errors.',
              run: ({ error }) => !error
            },
            {
              label: 'The greeting says "HTML lesson 2".',
              run: ({ doc }) => textOf(doc, '#greeting') === 'HTML lesson 2'
            },
            {
              label: 'The path is "/course/html/lesson-02".',
              run: ({ doc }) => textOf(doc, '#path') === '/course/html/lesson-02'
            },
            {
              label: 'The source uses a template literal.',
              run: ({ raw }) => raw.includes('\`')
            },
            {
              label: 'The path lowercases the course name.',
              run: ({ raw }) => raw.includes('toLowerCase')
            }
          ]
        }
      },
      {
        id: 'js-03',
        title: 'Numbers and conditionals',
        minutes: 8,
        xp: 25,
        language: 'js',
        preview: conditionPreview,
        objective: 'Choose one of two messages with an if statement.',
        theory: [
          {
            type: 'p',
            text: 'A condition is a question with a true or false answer. The if statement runs one block when the answer is true, and the else block when it is false.'
          },
          {
            type: 'code',
            lang: 'js',
            code: `const completed = 3;
let label;

if (completed >= 3) {
  label = 'Keep going.';
} else {
  label = 'Start here.';
}

document.querySelector('#status').textContent = label;`
          },
          {
            type: 'p',
            text: 'The operator >= means greater than or equal to. Use === to compare two values without converting their types. One = assigns a value, so it does not belong in a condition.'
          },
          {
            type: 'note',
            text: 'Keep each branch short. If a condition needs a long explanation, give it a name first.'
          }
        ],
        quiz: {
          question: 'Which operator means "at least"?',
          options: ['<=', '>=', '==='],
          answer: 1,
          explanation: '>= is greater than or equal to, which is another way to say at least.'
        },
        challenge: {
          prompt:
            'Set completed to 3. If completed is at least 3, set #status to "Keep going." Otherwise set it to "Start here." Also set #count to "3 lessons".',
          requirements: [
            'Declare const completed as 3.',
            'Use an if and an else.',
            'Set #status to "Keep going." when the condition is true.',
            'Set #count to "3 lessons".'
          ],
          starter: `// Choose a message.\n\n`,
          solution: `const completed = 3;
let label;

if (completed >= 3) {
  label = 'Keep going.';
} else {
  label = 'Start here.';
}

document.querySelector('#count').textContent = \`\${completed} lessons\`;
document.querySelector('#status').textContent = label;`,
          hint: 'Write the if and else first, then set the two paragraphs once the label is ready.',
          tests: [
            {
              label: 'The script runs without errors.',
              run: ({ error }) => !error
            },
            {
              label: 'The count says "3 lessons".',
              run: ({ doc }) => textOf(doc, '#count') === '3 lessons'
            },
            {
              label: 'The status says "Keep going."',
              run: ({ doc }) => textOf(doc, '#status') === 'Keep going.'
            },
            {
              label: 'The source uses an if and an else.',
              run: ({ raw }) => /\bif\s*\(/.test(raw) && /\belse\b/.test(raw)
            },
            {
              label: 'The condition compares with >=.',
              run: ({ raw }) => raw.includes('>=')
            }
          ]
        }
      },
      {
        id: 'js-04',
        title: 'Arrays and loops',
        minutes: 9,
        xp: 25,
        language: 'js',
        preview: loopPreview,
        objective: 'Store a list in an array and render one list item for each value.',
        theory: [
          {
            type: 'p',
            text: 'An array holds an ordered list of values. Each value has an index, and the first index is 0. A loop visits each value once so you can create markup without repeating yourself.'
          },
          {
            type: 'code',
            lang: 'js',
            code: `const steps = ['Read', 'Write', 'Check'];
const list = document.querySelector('#list');

steps.forEach((step) => {
  const item = document.createElement('li');
  item.textContent = step;
  list.append(item);
});`
          },
          {
            type: 'p',
            text: 'ForEach calls the function once for every value in the array. Create an li for each step, set its text, and append it to the ul. The page builds the list in the same order as the array.'
          },
          {
            type: 'note',
            text: 'Append adds a node at the end. If the list already has items, they stay above the new one.'
          }
        ],
        quiz: {
          question: 'What is the index of the first array value?',
          options: ['0', '1', '-1'],
          answer: 0,
          explanation: 'Arrays count from 0. The first value is at index 0 and the second is at index 1.'
        },
        challenge: {
          prompt:
            'Create an array with the steps Read, Write, and Check. Add one li to #list for each step, in order.',
          requirements: [
            'Create an array named steps with three strings.',
            'Use a loop over the array.',
            'Create one li per step.',
            'Append each li to #list.',
            'The list shows Read, Write, Check.'
          ],
          starter: `// Build the list from an array.\n\n`,
          solution: `const steps = ['Read', 'Write', 'Check'];
const list = document.querySelector('#list');

steps.forEach((step) => {
  const item = document.createElement('li');
  item.textContent = step;
  list.append(item);
});`,
          hint: 'ForEach gives you each step. Create the li inside the loop, then append it to #list.',
          tests: [
            {
              label: 'The script runs without errors.',
              run: ({ error }) => !error
            },
            {
              label: 'The list has three items.',
              run: ({ doc }) => doc.querySelectorAll('#list li').length === 3
            },
            {
              label: 'The items are Read, Write, Check.',
              run: ({ doc }) => {
                const items = textsOf(doc, '#list li');
                return items.length === 3 && items[0] === 'Read' && items[1] === 'Write' && items[2] === 'Check';
              }
            },
            {
              label: 'The source uses a loop.',
              run: ({ raw }) => /\bfor(Each)?\b/.test(raw)
            },
            {
              label: 'The source appends each item.',
              run: ({ raw }) => raw.includes('append')
            }
          ]
        }
      }
    ]
  },
  {
    id: 'js-m2',
    title: 'The page responds',
    description:
      'Four lessons on functions, selecting elements, events, and a small interactive page.',
    lessons: [
      {
        id: 'js-05',
        title: 'Functions do one job',
        minutes: 9,
        xp: 25,
        language: 'js',
        preview: functionPreview,
        objective: 'Write a function that returns a value, then use it in the page.',
        theory: [
          {
            type: 'p',
            text: 'A function groups steps under a name. A parameter is a value the function receives. Return sends a result back to the code that called it.'
          },
          {
            type: 'code',
            lang: 'js',
            code: `function withTax(amount) {
  return amount * 1.2;
}

const price = withTax(25);
document.querySelector('#price').textContent = \`Total: $\${price.toFixed(2)}\`;`
          },
          {
            type: 'p',
            text: 'Call the function with an argument, like withTax(25). The returned number can be stored in a variable. ToFixed(2) formats a number with two decimal places.'
          },
          {
            type: 'note',
            text: 'A function that returns a value does not write to the page by itself. The caller decides what to do with the result.'
          }
        ],
        quiz: {
          question: 'What does return do in a function?',
          options: [
            'It stops the page.',
            'It sends a value back to the caller.',
            'It prints the value to the page.'
          ],
          answer: 1,
          explanation: 'Return ends the function and hands its value back to the code that called it.'
        },
        challenge: {
          prompt:
            'Write withTax(amount) that returns the amount with 20 percent tax. Use it to show a total of $30.00 for 25 and tax of $5.00.',
          requirements: [
            'Declare a function named withTax with one parameter.',
            'Return amount * 1.2.',
            'Call withTax(25).',
            'Set #price to "Total: $30.00".',
            'Set #tax to "Tax: $5.00".'
          ],
          starter: `// Write the function, then use it.\n\n`,
          solution: `function withTax(amount) {
  return amount * 1.2;
}

const price = withTax(25);

document.querySelector('#price').textContent = \`Total: $\${price.toFixed(2)}\`;
document.querySelector('#tax').textContent = \`Tax: $\${(price - 25).toFixed(2)}\`;`,
          hint: 'The function returns a number. Format the total and the tax with toFixed(2) when you write them into the page.',
          tests: [
            {
              label: 'The script runs without errors.',
              run: ({ error }) => !error
            },
            {
              label: 'The price says "Total: $30.00".',
              run: ({ doc }) => textOf(doc, '#price') === 'Total: $30.00'
            },
            {
              label: 'The tax says "Tax: $5.00".',
              run: ({ doc }) => textOf(doc, '#tax') === 'Tax: $5.00'
            },
            {
              label: 'The source declares withTax.',
              run: ({ raw }) => /\bfunction\s+withTax\s*\(/.test(raw)
            },
            {
              label: 'The function returns a value.',
              run: ({ raw }) => /\breturn\b/.test(raw)
            }
          ]
        }
      },
      {
        id: 'js-06',
        title: 'Find and change the page',
        minutes: 9,
        xp: 25,
        language: 'js',
        preview: selectPreview,
        objective: 'Select one element and a group of elements, then change both.',
        theory: [
          {
            type: 'p',
            text: 'Document.querySelector returns the first element that matches a CSS selector. Document.querySelectorAll returns every match as a NodeList. A NodeList has forEach, so you can work on each element in turn.'
          },
          {
            type: 'code',
            lang: 'js',
            code: `document.querySelector('#page-title').textContent = 'Field notes';

document.querySelectorAll('.note').forEach((note, index) => {
  note.textContent = \`Note \${index + 1}\`;
  note.classList.add('is-set');
});`
          },
          {
            type: 'p',
            text: 'ClassList.add puts a class on an element without replacing the classes it already has. The index in forEach starts at 0, so index + 1 gives the visible note number.'
          },
          {
            type: 'note',
            text: 'The selector syntax is the same one CSS uses. A hash finds an id, a dot finds a class, and a bare word finds an element.'
          }
        ],
        quiz: {
          question: 'Which method returns every element that matches a selector?',
          options: ['querySelector', 'querySelectorAll', 'getElement'],
          answer: 1,
          explanation: 'QuerySelectorAll returns all matches. QuerySelector returns only the first one.'
        },
        challenge: {
          prompt:
            'Change the page title to "Field notes". Number the two notes "Note 1" and "Note 2", and give each one the class is-set.',
          requirements: [
            'Set #page-title to "Field notes".',
            'Select every .note with querySelectorAll.',
            'Set the notes to "Note 1" and "Note 2".',
            'Add the class is-set to both notes.'
          ],
          starter: `// Change the title, then the notes.\n\n`,
          solution: `document.querySelector('#page-title').textContent = 'Field notes';

document.querySelectorAll('.note').forEach((note, index) => {
  note.textContent = \`Note \${index + 1}\`;
  note.classList.add('is-set');
});`,
          hint: 'Use the index in forEach to number the notes. ClassList.add does not remove the existing class.',
          tests: [
            {
              label: 'The script runs without errors.',
              run: ({ error }) => !error
            },
            {
              label: 'The title says "Field notes".',
              run: ({ doc }) => textOf(doc, '#page-title') === 'Field notes'
            },
            {
              label: 'The notes say "Note 1" and "Note 2".',
              run: ({ doc }) => {
                const notes = textsOf(doc, '.note');
                return notes.length === 2 && notes[0] === 'Note 1' && notes[1] === 'Note 2';
              }
            },
            {
              label: 'Both notes have the class is-set.',
              run: ({ doc }) => doc.querySelectorAll('.note.is-set').length === 2
            },
            {
              label: 'The source uses querySelectorAll.',
              run: ({ raw }) => raw.includes('querySelectorAll')
            }
          ]
        }
      },
      {
        id: 'js-07',
        title: 'Events respond',
        minutes: 10,
        xp: 25,
        language: 'js',
        preview: eventPreview,
        objective: 'Update a counter when a button is clicked.',
        theory: [
          {
            type: 'p',
            text: 'An event is something that happens in the page, like a click or a key press. AddEventListener listens for one event on one element. When the event happens, the browser calls your function.'
          },
          {
            type: 'code',
            lang: 'js',
            code: `let count = 0;
const output = document.querySelector('#count');
const button = document.querySelector('#add');

button.addEventListener('click', () => {
  count += 1;
  output.textContent = String(count);
});`
          },
          {
            type: 'p',
            text: 'The count lives outside the listener so it keeps its value between clicks. Count += 1 adds one. String(count) turns the number into text before it goes into the page.'
          },
          {
            type: 'note',
            text: 'Do not call the listener when you add it. Pass the function itself, without parentheses after its name. The preview is a snapshot after the script runs, so use Check to test the click.'
          }
        ],
        quiz: {
          question: 'Which method listens for a click on an element?',
          options: ['addEventListener', 'querySelector', 'textContent'],
          answer: 0,
          explanation: 'AddEventListener registers a listener for an event such as click.'
        },
        challenge: {
          prompt:
            'Start the count at 0. Each click on the Add one button should increase the number in #count by one.',
          requirements: [
            'Declare a count that starts at 0.',
            'Select #count and #add.',
            'Listen for a click on the button.',
            'Increase count and write it into #count.'
          ],
          starter: `// Make the button count.\n\n`,
          solution: `let count = 0;
const output = document.querySelector('#count');
const button = document.querySelector('#add');

button.addEventListener('click', () => {
  count += 1;
  output.textContent = String(count);
});`,
          hint: 'Keep count outside the listener. Inside the listener, add one and set the paragraph text.',
          tests: [
            {
              label: 'The script runs without errors.',
              run: ({ error }) => !error
            },
            {
              label: 'The count starts at 0.',
              run: ({ doc }) => textOf(doc, '#count') === '0'
            },
            {
              label: 'The source listens for a click.',
              run: ({ raw }) => raw.includes('addEventListener') && raw.includes('click')
            },
            {
              label: 'One click sets the count to 1.',
              run: ({ doc }) => {
                doc.querySelector('#add').click();
                return textOf(doc, '#count') === '1';
              }
            },
            {
              label: 'Two clicks set the count to 2.',
              run: ({ doc }) => {
                const button = doc.querySelector('#add');
                button.click();
                button.click();
                return textOf(doc, '#count') === '2';
              }
            }
          ]
        }
      },
      {
        id: 'js-08',
        title: 'Capstone: a field notes counter',
        minutes: 12,
        xp: 40,
        language: 'js',
        preview: counterPreview,
        objective: 'Build a counter that adds notes and resets the list.',
        theory: [
          {
            type: 'p',
            text: 'This page combines state, events, and DOM changes. A counter tracks how many notes exist. The Add note button writes the count and appends an item. The Reset button clears both.'
          },
          {
            type: 'code',
            lang: 'js',
            code: `let count = 0;

addButton.addEventListener('click', () => {
  count += 1;
  const item = document.createElement('li');
  item.textContent = \`Note \${count}\`;
  list.append(item);
});

resetButton.addEventListener('click', () => {
  count = 0;
  list.replaceChildren();
});`
          },
          {
            type: 'p',
            text: 'Use the count to decide between note and notes. ReplaceChildren removes every child in one step, which is cleaner than removing items one at a time.'
          },
          {
            type: 'note',
            text: 'Keep the state and the page in sync in the same handler. If one changes without the other, the next click will show the mismatch. The preview is a snapshot, so use Check to exercise the buttons.'
          }
        ],
        quiz: {
          question: 'What does append do to a list?',
          options: [
            'It adds a node at the end.',
            'It removes the first node.',
            'It sorts the list.'
          ],
          answer: 0,
          explanation: 'Append adds a node after the last child of the parent.'
        },
        challenge: {
          prompt:
            'Build the field notes counter. Add note increases the count and appends a note. Reset clears the count and the list.',
          requirements: [
            'Start with count at 0 and show "0 notes".',
            'On Add note, increase count and show "1 note" or "2 notes".',
            'Append an li that says "Note 1", "Note 2", and so on.',
            'On Reset, show "0 notes" and remove every list item.',
            'Use one click listener for each button.'
          ],
          starter: `// Put the counter together.\n\n`,
          solution: `let count = 0;
const countOutput = document.querySelector('#count');
const list = document.querySelector('#notes');
const addButton = document.querySelector('#add');
const resetButton = document.querySelector('#reset');

addButton.addEventListener('click', () => {
  count += 1;
  countOutput.textContent = \`\${count} \${count === 1 ? 'note' : 'notes'}\`;

  const item = document.createElement('li');
  item.textContent = \`Note \${count}\`;
  list.append(item);
});

resetButton.addEventListener('click', () => {
  count = 0;
  countOutput.textContent = '0 notes';
  list.replaceChildren();
});`,
          hint: 'Write the add listener first, then the reset listener. Use a ternary for the singular and plural label.',
          tests: [
            {
              label: 'The script runs without errors.',
              run: ({ error }) => !error
            },
            {
              label: 'The page starts at "0 notes" with an empty list.',
              run: ({ doc }) => textOf(doc, '#count') === '0 notes' && doc.querySelectorAll('#notes li').length === 0
            },
            {
              label: 'One add shows "1 note" and one item.',
              run: ({ doc }) => {
                doc.querySelector('#add').click();
                return textOf(doc, '#count') === '1 note' &&
                  textsOf(doc, '#notes li').join('|') === 'Note 1';
              }
            },
            {
              label: 'Two adds show "2 notes" and two items.',
              run: ({ doc }) => {
                doc.querySelector('#add').click();
                doc.querySelector('#add').click();
                return textOf(doc, '#count') === '2 notes' &&
                  textsOf(doc, '#notes li').join('|') === 'Note 1|Note 2';
              }
            },
            {
              label: 'Reset clears the count and the list.',
              run: ({ doc }) => {
                doc.querySelector('#add').click();
                doc.querySelector('#add').click();
                doc.querySelector('#reset').click();
                return textOf(doc, '#count') === '0 notes' &&
                  doc.querySelectorAll('#notes li').length === 0;
              }
            },
            {
              label: 'Both buttons have a click listener.',
              run: ({ raw }) => (raw.match(/addEventListener/g) || []).length >= 2
            }
          ]
        }
      }
    ]
  }
];
