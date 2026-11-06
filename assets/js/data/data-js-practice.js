import {
  challenge,
  code,
  lesson,
  lessonModule,
  note,
  p,
  quiz,
  raw,
  text
} from './lesson-builder.js';

const destructurePreview = `<main>
  <h1 id="title">Draft</h1>
  <p id="meta">No meta.</p>
  <p id="topics">No topics.</p>
</main>`;

const formPreview = `<main>
  <form id="signup">
    <label for="name">Name</label>
    <input id="name" name="name" value="Ada">
    <label for="email">Email</label>
    <input id="email" name="email" type="email" value="ada@example.com">
    <button type="submit">Save</button>
  </form>
  <p id="result">No result.</p>
</main>`;

const storagePreview = `<main>
  <h1 id="name">Draft</h1>
  <p id="count">0 lessons</p>
</main>`;

const consolePreview = `<main>
  <p id="result">Waiting.</p>
</main>`;

export const jsPractice = [
  lessonModule(
    'js-m5',
    'JavaScript in practice',
    'Four lessons on destructuring, form data, local storage, and the console.',
    [
      lesson(
        'js-16',
        'Unpack values with destructuring',
        8,
        'Destructure an object and an array, then collect the remaining topics with rest.',
        [
          p('Destructuring reads values out of an array or object and gives them names. An array matches by position. An object matches by property name.'),
          code(
            'js',
            `const lesson = { title: 'Destructuring', minutes: 8 };
const { title, minutes } = lesson;

const topics = ['html', 'css', 'js'];
const [first, ...rest] = topics;`
          ),
          p('The rest pattern collects the values that were not named. Spread does the opposite: it expands an array or object into a new one.'),
          code(
            'js',
            `const base = ['html', 'css'];
const all = [...base, 'js'];

const review = { ...lesson, minutes: 9 };`
          ),
          note('Spread makes a shallow copy. A nested object is still shared between the copy and the original, so change it on purpose.')
        ],
        quiz(
          'Which line reads the title property into a variable named title?',
          ['const { title } = lesson;', 'const [ title ] = lesson;', 'const title = lesson[0];'],
          0,
          'Object destructuring uses braces and property names. Array destructuring uses brackets and positions.'
        ),
        challenge(
          'Destructure title and minutes from the lesson object. Destructure the first topic and the rest of the topics array. Show "Destructuring", "8 minutes", and "html then css, js" in the page.',
          [
            'Read title and minutes from lesson with object destructuring.',
            'Read the first topic and an array named rest with array destructuring.',
            'Write title into #title.',
            'Write "8 minutes" into #meta.',
            'Write "html then css, js" into #topics.'
          ],
          `const lesson = { title: 'Destructuring', minutes: 8 };
const topics = ['html', 'css', 'js'];

document.querySelector('#title').textContent = 'Draft';
document.querySelector('#meta').textContent = 'No meta.';
document.querySelector('#topics').textContent = 'No topics.';`,
          `const lesson = { title: 'Destructuring', minutes: 8 };
const topics = ['html', 'css', 'js'];

const { title, minutes } = lesson;
const [first, ...rest] = topics;

document.querySelector('#title').textContent = title;
document.querySelector('#meta').textContent = \`\${minutes} minutes\`;
document.querySelector('#topics').textContent = \`\${first} then \${rest.join(', ')}\`;`,
          'Object destructuring uses braces and property names. Array destructuring uses brackets. Put three dots before the name that collects the rest.',
          [
            text('The heading shows the destructured title.', '#title', 'Destructuring'),
            text('The meta line shows the destructured minutes.', '#meta', '8 minutes'),
            text('The topics line keeps the first topic and the rest.', '#topics', 'html then css, js'),
            raw('The script destructures the lesson object.', /const\s*\{[^}]*title[^}]*minutes[^}]*\}\s*=\s*lesson/),
            raw('The script collects the rest of the topics.', /\.\.\.rest/)
          ]
        ),
        { language: 'js', preview: destructurePreview }
      ),
      lesson(
        'js-17',
        'Read a form with FormData',
        9,
        'Read named form fields into an object with FormData and Object.fromEntries.',
        [
          p('A form field only travels with the form when it has a name. FormData reads those names and values into pairs.'),
          code(
            'html',
            `<form id="signup">
  <label for="name">Name</label>
  <input id="name" name="name" value="Ada">
  <button type="submit">Save</button>
</form>`
          ),
          p('Object.fromEntries turns the pairs into a plain object. Call event.preventDefault() in a submit listener to read the data without reloading the page.'),
          code(
            'js',
            `const form = document.querySelector('#signup');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  console.log(data.name);
});`
          ),
          note('A checkbox appears in FormData only when it is checked. A submit button is included only when that button submitted the form.')
        ],
        quiz(
          'Which attribute gives a field its name in FormData?',
          ['The id attribute', 'The name attribute', 'The placeholder attribute'],
          1,
          'FormData pairs each field by its name attribute. The id is for labels and scripts, not for the submitted key.'
        ),
        challenge(
          'Read the signup form with FormData, turn the entries into an object, and show "Ada (ada@example.com)" in #result. Update the result when the form is submitted.',
          [
            'Select the form with #signup.',
            'Create FormData from the form and pass it to Object.fromEntries.',
            'Read the name and email properties from the result.',
            'Write "Ada (ada@example.com)" into #result.',
            'Listen for submit and call event.preventDefault() before reading the form again.'
          ],
          `const form = document.querySelector('#signup');
const result = document.querySelector('#result');

result.textContent = 'No result.';`,
          `const form = document.querySelector('#signup');
const result = document.querySelector('#result');

function showData() {
  const data = Object.fromEntries(new FormData(form));
  result.textContent = \`\${data.name} (\${data.email})\`;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  showData();
});

showData();`,
          'FormData takes the form element. Object.fromEntries gives you data.name and data.email. Call showData once so the page has a result before anyone submits.',
          [
            text('The result shows the named fields.', '#result', 'Ada (ada@example.com)'),
            raw('The script reads the form with FormData.', /new FormData\(/),
            raw('The script turns the entries into an object.', /Object\.fromEntries\(/),
            raw('The script prevents the default submit.', /preventDefault\(/),
            raw('The script listens for submit.', /addEventListener\(\s*['"]submit['"]/)
          ]
        ),
        { language: 'js', preview: formPreview }
      ),
      lesson(
        'js-18',
        'Save data with localStorage',
        9,
        'Save an object as JSON in localStorage, read it back, and show the saved values.',
        [
          p('localStorage keeps strings in the browser under a key. The values survive a reload and stay on the device. Nothing is sent to a server.'),
          code(
            'js',
            `localStorage.setItem('kodingu.name', 'Ada');
const name = localStorage.getItem('kodingu.name');
localStorage.removeItem('kodingu.name');`
          ),
          p('Stored values come back as strings. Convert an object with JSON.stringify before saving and JSON.parse after reading. A browser can block storage, so wrap the calls in try/catch when the page must keep working.'),
          code(
            'js',
            `const profile = { name: 'Ada', lessons: 3 };

localStorage.setItem('profile', JSON.stringify(profile));
const saved = JSON.parse(localStorage.getItem('profile'));`
          ),
          note('This preview uses a temporary store that resets on each run. On a normal page, the same calls use the browser storage for that site.')
        ],
        quiz(
          'What does localStorage.getItem return for a missing key?',
          ['undefined', 'null', 'An empty string'],
          1,
          'A missing key returns null. JSON.parse(null) returns null, so check for null before reading properties.'
        ),
        challenge(
          'Save the profile object as JSON under the key "kodingu.profile". Read it back with JSON.parse, then show "Ada" and "3 lessons" in the page.',
          [
            'Save the profile with localStorage.setItem and JSON.stringify.',
            'Use the key "kodingu.profile".',
            'Read the value with localStorage.getItem and JSON.parse.',
            'Write the saved name into #name.',
            'Write "3 lessons" into #count.'
          ],
          `const profile = { name: 'Ada', lessons: 3 };

document.querySelector('#name').textContent = 'Draft';
document.querySelector('#count').textContent = '0 lessons';`,
          `const profile = { name: 'Ada', lessons: 3 };

localStorage.setItem('kodingu.profile', JSON.stringify(profile));
const saved = JSON.parse(localStorage.getItem('kodingu.profile'));

document.querySelector('#name').textContent = saved.name;
document.querySelector('#count').textContent = \`\${saved.lessons} lessons\`;`,
          'JSON.stringify turns the object into a string before storage. JSON.parse turns that string back into an object with name and lessons.',
          [
            text('The name comes from the saved object.', '#name', 'Ada'),
            text('The lesson count comes from the saved object.', '#count', '3 lessons'),
            raw('The script saves JSON under the expected key.', /localStorage\.setItem\(\s*['"]kodingu\.profile['"]\s*,\s*JSON\.stringify\(/),
            raw('The script reads the saved value with JSON.parse.', /JSON\.parse\(localStorage\.getItem\(/)
          ]
        ),
        { language: 'js', preview: storagePreview }
      ),
      lesson(
        'js-19',
        'Debug with the console',
        8,
        'Log a value, warn about a wrong type, convert it to a number, and show the result.',
        [
          p('The console shows what a script is doing. console.log writes a value, console.warn marks a warning, and console.error marks a failure. Open the browser developer tools to read them.'),
          code(
            'js',
            `const profile = { name: 'Ada', lessons: 3 };
console.log('profile', profile);
console.warn('This is a warning.');
console.error('This is an error.');`
          ),
          p('An error message names the type, the message, and the line. Read the first line before changing code. typeof and JSON.stringify show what a value really is.'),
          code(
            'js',
            `const raw = '3';
console.log(typeof raw, JSON.stringify(raw));
console.warn('Expected a number, received', typeof raw);`
          ),
          note('Console output is for you. If the page needs to show a result, write it into the page as well.')
        ],
        quiz(
          'Which call marks a failure in the console?',
          ['console.log', 'console.warn', 'console.error'],
          2,
          'console.error marks a failure. console.warn marks a warning, and console.log writes a value.'
        ),
        challenge(
          'Log the profile with console.log. Warn that lessons is a string with console.warn. Convert it with Number(), then show "Ada finished 3 lessons" in #result.',
          [
            'Log the profile with console.log.',
            'Warn about the string type with console.warn and typeof.',
            'Convert profile.lessons with Number().',
            'Write "Ada finished 3 lessons" into #result.'
          ],
          `const profile = { name: 'Ada', lessons: '3' };

document.querySelector('#result').textContent = 'Waiting.';`,
          `const profile = { name: 'Ada', lessons: '3' };

console.log('profile', profile);
console.warn('lessons should be a number, received', typeof profile.lessons);

const lessons = Number(profile.lessons);
document.querySelector('#result').textContent = \`\${profile.name} finished \${lessons} lessons\`;`,
          'Log the object before changing it. typeof profile.lessons reports "string", and Number("3") gives the number 3.',
          [
            text('The result uses the converted lesson count.', '#result', 'Ada finished 3 lessons'),
            raw('The script logs the profile.', /console\.log\(/),
            raw('The script warns about the type.', /console\.warn\(/),
            raw('The script checks the type with typeof.', /typeof/),
            raw('The script converts the value with Number().', /Number\(/)
          ]
        ),
        { language: 'js', preview: consolePreview }
      )
    ]
  )
];
