import { textOf, textsOf } from './data-helpers.js';
import { htmlModulesPhase2 } from './data-html-2.js';
import { cssFoundations } from './data-css.js';
import { cssLayout } from './data-css-layout.js';
import { jsModules } from './data-js.js';

const pageSkeleton = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>My first page</title>
  </head>
  <body>

  </body>
</html>`;

export const courses = [
  {
    id: 'html',
    title: 'HTML',
    subtitle: 'The structure of the web',
    description:
      'Learn how a page is built. You will write real markup, check it in the browser, and finish with a page you can open anywhere.',
    status: 'open',
    level: 'Beginner',
    modules: [
      {
        id: 'html-m1',
        title: 'The shape of a page',
        description:
          'Five short lessons on the parts of an HTML document, headings, paragraphs, links, and lists.',
        lessons: [
          {
            id: 'html-01',
            title: 'A page is a tree',
            minutes: 8,
            xp: 25,
            objective: 'Write a complete HTML document and put a heading in the body.',
            theory: [
              {
                type: 'p',
                text: 'HTML gives a page its structure. The browser reads your markup and builds a tree of elements. The tree starts with the document, then the html element, then the head and body.'
              },
              {
                type: 'code',
                lang: 'html',
                code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>My first page</title>
  </head>
  <body>
    <h1>Hello, Kodingu</h1>
  </body>
</html>`
              },
              {
                type: 'p',
                text: 'The head holds information about the page, like its title and character set. The body holds what people see.'
              },
              {
                type: 'note',
                text: 'Indentation is for humans. The browser does not care about extra spaces, but a tidy tree is easier to read and fix.'
              }
            ],
            quiz: {
              question: 'Which element holds the content people see?',
              options: ['<head>', '<body>', '<title>'],
              answer: 1,
              explanation: 'The body holds the visible page. The head holds information about it.'
            },
            challenge: {
              prompt:
                'Write a complete HTML document. Give it the title "My first page" and put an h1 in the body that says "Hello, Kodingu".',
              requirements: [
                'Start with <!DOCTYPE html>.',
                'Include html, head, and body elements.',
                'Set the title to "My first page".',
                'Put an h1 in the body with the text "Hello, Kodingu".'
              ],
              starter: pageSkeleton,
              solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>My first page</title>
  </head>
  <body>
    <h1>Hello, Kodingu</h1>
  </body>
</html>`,
              hint: 'The h1 belongs inside body. The title belongs inside head.',
              tests: [
                {
                  label: 'The document starts with <!DOCTYPE html>.',
                  run: ({ raw }) => /^\s*<!doctype html>/i.test(raw)
                },
                {
                  label: 'There is an html element.',
                  run: ({ doc }) => doc.documentElement?.tagName === 'HTML'
                },
                {
                  label: 'The title is "My first page".',
                  run: ({ doc }) => textOf(doc, 'title') === 'My first page'
                },
                {
                  label: 'There is a body element.',
                  run: ({ doc }) => Boolean(doc.body)
                },
                {
                  label: 'The body contains an h1 that says "Hello, Kodingu".',
                  run: ({ doc }) => textOf(doc, 'body h1') === 'Hello, Kodingu'
                }
              ]
            }
          },
          {
            id: 'html-02',
            title: 'Headings carry rank',
            minutes: 7,
            xp: 25,
            objective: 'Use one h1 and two h2 elements to give a page a clear outline.',
            theory: [
              {
                type: 'p',
                text: 'Headings are labels for the content below them. HTML gives you six ranks, from h1 to h6. The rank is about importance, not font size.'
              },
              {
                type: 'code',
                lang: 'html',
                code: `<h1>Kodingu field notes</h1>
<h2>HTML</h2>
<p>Structure comes first.</p>
<h2>CSS</h2>
<p>Style comes next.</p>`
              },
              {
                type: 'p',
                text: 'A page usually has one h1. It names the page. Sections inside the page use h2, and subsections use h3. Skipping a rank to make a heading look smaller makes the outline harder to follow.'
              },
              {
                type: 'note',
                text: 'A heading is a label for the content below it. Use CSS when you want to change how it looks.'
              }
            ],
            quiz: {
              question: 'How many h1 elements should a page usually have?',
              options: ['None', 'One', 'As many as you want'],
              answer: 1,
              explanation: 'One h1 names the page. Sections inside it use h2 and lower ranks.'
            },
            challenge: {
              prompt:
                'Build a page with one h1 that says "Kodingu field notes" and two h2 sections: "HTML" and "CSS".',
              requirements: [
                'Use exactly one h1.',
                'Use exactly two h2 elements.',
                'The h1 text is "Kodingu field notes".',
                'The h2 texts are "HTML" and "CSS", in that order.'
              ],
              starter: pageSkeleton,
              solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Kodingu field notes</title>
  </head>
  <body>
    <h1>Kodingu field notes</h1>
    <h2>HTML</h2>
    <h2>CSS</h2>
  </body>
</html>`,
              hint: 'Put the h1 first. Then add the two h2 elements below it, in the order HTML then CSS.',
              tests: [
                {
                  label: 'There is exactly one h1.',
                  run: ({ doc }) => doc.querySelectorAll('h1').length === 1
                },
                {
                  label: 'The h1 says "Kodingu field notes".',
                  run: ({ doc }) => textOf(doc, 'h1') === 'Kodingu field notes'
                },
                {
                  label: 'There are exactly two h2 elements.',
                  run: ({ doc }) => doc.querySelectorAll('h2').length === 2
                },
                {
                  label: 'The h2 texts are "HTML" and "CSS", in that order.',
                  run: ({ doc }) => {
                    const headings = textsOf(doc, 'h2');
                    return headings.length === 2 && headings[0] === 'HTML' && headings[1] === 'CSS';
                  }
                },
                {
                  label: 'The h1 comes before the first h2.',
                  run: ({ doc }) => {
                    const order = Array.from(doc.querySelectorAll('h1, h2')).map((node) => node.tagName);
                    return order[0] === 'H1' && order.filter((tag) => tag === 'H1').length === 1;
                  }
                }
              ]
            }
          },
          {
            id: 'html-03',
            title: 'Paragraphs and emphasis',
            minutes: 7,
            xp: 25,
            objective: 'Mark up a paragraph and use strong and em for meaning.',
            theory: [
              {
                type: 'p',
                text: 'A paragraph is a block of running text. The p element keeps it separate from the blocks around it.'
              },
              {
                type: 'code',
                lang: 'html',
                code: `<p>HTML gives a page <strong>structure</strong>. CSS gives it <em>style</em>.</p>`
              },
              {
                type: 'p',
                text: 'The strong element marks text as important. The em element marks stress or emphasis. Both change meaning. Use them when the meaning changes, not when you only want bold or italic text.'
              },
              {
                type: 'note',
                text: 'If a word is bold only because it looks good, use CSS later. Keep strong for importance.'
              }
            ],
            quiz: {
              question: 'Which element marks text as important?',
              options: ['<em>', '<strong>', '<p>'],
              answer: 1,
              explanation: 'Strong marks importance. Em marks stress or emphasis.'
            },
            challenge: {
              prompt:
                'Write a paragraph with the text "HTML gives a page structure. CSS gives it style." Make the word "structure" strong and the word "style" emphasized.',
              requirements: [
                'Use a p element.',
                'The paragraph text is "HTML gives a page structure. CSS gives it style."',
                'The word "structure" is inside strong.',
                'The word "style" is inside em.'
              ],
              starter: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Paragraphs and emphasis</title>
  </head>
  <body>

  </body>
</html>`,
              solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Paragraphs and emphasis</title>
  </head>
  <body>
    <p>HTML gives a page <strong>structure</strong>. CSS gives it <em>style</em>.</p>
  </body>
</html>`,
              hint: 'The strong and em elements go inside the paragraph, around the words they mark.',
              tests: [
                {
                  label: 'There is a paragraph.',
                  run: ({ doc }) => doc.querySelectorAll('p').length >= 1
                },
                {
                  label: 'The word "structure" is inside strong.',
                  run: ({ doc }) => textOf(doc, 'p strong') === 'structure'
                },
                {
                  label: 'The word "style" is inside em.',
                  run: ({ doc }) => textOf(doc, 'p em') === 'style'
                },
                {
                  label: 'The paragraph keeps the full sentence.',
                  run: ({ doc }) => {
                    const text = textOf(doc, 'p');
                    return text.includes('HTML gives a page structure.') && text.includes('CSS gives it style.');
                  }
                }
              ]
            }
          },
          {
            id: 'html-04',
            title: 'Links connect pages',
            minutes: 8,
            xp: 25,
            objective: 'Create an external link and a same-page link.',
            theory: [
              {
                type: 'p',
                text: 'A link is an a element with an href attribute. The href is the destination. The text between the tags is what people click.'
              },
              {
                type: 'code',
                lang: 'html',
                code: `<a href="https://example.com">Read the example page</a>
<a href="#details">Skip to details</a>

<h2 id="details">Details</h2>`
              },
              {
                type: 'p',
                text: 'An absolute URL starts with a scheme, like https://. A relative URL points somewhere in the same site. A hash link points to an element with a matching id on the same page.'
              },
              {
                type: 'note',
                text: 'Write link text that names the destination. "Read the example page" is clearer than "Click here". The preview is sandboxed, so the link is checked but does not navigate there.'
              }
            ],
            quiz: {
              question: 'What does href="#details" link to?',
              options: [
                'An external website',
                'An element with id="details" on the same page',
                'A new browser tab'
              ],
              answer: 1,
              explanation: 'A hash link points to an element with that id on the same page.'
            },
            challenge: {
              prompt:
                'Add a link to https://example.com with the text "Read the example page". Add a link to #details with the text "Skip to details". Add an element with id="details".',
              requirements: [
                'The external link points to https://example.com.',
                'The external link text is "Read the example page".',
                'The same-page link points to #details.',
                'The same-page link text is "Skip to details".',
                'An element with id="details" exists.'
              ],
              starter: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Links</title>
  </head>
  <body>

  </body>
</html>`,
              solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Links</title>
  </head>
  <body>
    <p><a href="https://example.com">Read the example page</a></p>
    <p><a href="#details">Skip to details</a></p>

    <h2 id="details">Details</h2>
  </body>
</html>`,
              hint: 'The href attribute holds the destination. The id attribute marks the place the hash link jumps to.',
              tests: [
                {
                  label: 'The external link points to https://example.com.',
                  run: ({ doc }) => Boolean(doc.querySelector('a[href="https://example.com"]'))
                },
                {
                  label: 'The external link says "Read the example page".',
                  run: ({ doc }) => textOf(doc, 'a[href="https://example.com"]') === 'Read the example page'
                },
                {
                  label: 'The same-page link points to #details.',
                  run: ({ doc }) => Boolean(doc.querySelector('a[href="#details"]'))
                },
                {
                  label: 'The same-page link says "Skip to details".',
                  run: ({ doc }) => textOf(doc, 'a[href="#details"]') === 'Skip to details'
                },
                {
                  label: 'An element with id="details" exists.',
                  run: ({ doc }) => Boolean(doc.querySelector('#details'))
                }
              ]
            }
          },
          {
            id: 'html-05',
            title: 'Lists, ordered and not',
            minutes: 7,
            xp: 25,
            objective: 'Build an unordered list and an ordered list.',
            theory: [
              {
                type: 'p',
                text: 'A list groups related items. The ul element makes an unordered list, where order does not change the meaning. The ol element makes an ordered list, where it does.'
              },
              {
                type: 'code',
                lang: 'html',
                code: `<ul>
  <li>Structure</li>
  <li>Style</li>
  <li>Behavior</li>
</ul>

<ol>
  <li>Write</li>
  <li>Run</li>
  <li>Check</li>
</ol>`
              },
              {
                type: 'p',
                text: 'Each item goes inside an li element. The li elements are direct children of the list. Do not use lists to position blocks on a page. That is a layout job for CSS.'
              },
              {
                type: 'note',
                text: 'Ask whether the order changes the meaning. If it does, use ol. If it does not, use ul.'
              }
            ],
            quiz: {
              question: 'Which list is ordered?',
              options: ['<ul>', '<ol>', '<li>'],
              answer: 1,
              explanation: 'Ol is the ordered list. Ul is unordered, and li is a list item.'
            },
            challenge: {
              prompt:
                'Create an unordered list with three items: "Structure", "Style", "Behavior". Create an ordered list with three steps: "Write", "Run", "Check".',
              requirements: [
                'One ul with exactly three li children.',
                'The ul items are "Structure", "Style", "Behavior", in that order.',
                'One ol with exactly three li children.',
                'The ol items are "Write", "Run", "Check", in that order.'
              ],
              starter: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Lists</title>
  </head>
  <body>

  </body>
</html>`,
              solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Lists</title>
  </head>
  <body>
    <ul>
      <li>Structure</li>
      <li>Style</li>
      <li>Behavior</li>
    </ul>

    <ol>
      <li>Write</li>
      <li>Run</li>
      <li>Check</li>
    </ol>
  </body>
</html>`,
              hint: 'The li elements go inside the list element. Keep the item order exactly as the prompt asks.',
              tests: [
                {
                  label: 'The unordered list has three items.',
                  run: ({ doc }) => doc.querySelectorAll('ul').length === 1 && doc.querySelectorAll('ul > li').length === 3
                },
                {
                  label: 'The unordered list items are "Structure", "Style", "Behavior".',
                  run: ({ doc }) => {
                    const items = textsOf(doc, 'ul > li');
                    return items.length === 3 && items[0] === 'Structure' && items[1] === 'Style' && items[2] === 'Behavior';
                  }
                },
                {
                  label: 'The ordered list has three items.',
                  run: ({ doc }) => doc.querySelectorAll('ol').length === 1 && doc.querySelectorAll('ol > li').length === 3
                },
                {
                  label: 'The ordered list items are "Write", "Run", "Check".',
                  run: ({ doc }) => {
                    const items = textsOf(doc, 'ol > li');
                    return items.length === 3 && items[0] === 'Write' && items[1] === 'Run' && items[2] === 'Check';
                  }
                }
              ]
            }
          }
        ]
      },
      ...htmlModulesPhase2
    ]
  },
  {
    id: 'css',
    title: 'CSS',
    subtitle: 'The style of the web',
    description:
      'Learn how to turn plain HTML into a page with color, type, spacing, layout, and the box model.',
    status: 'open',
    level: 'Beginner',
    language: 'css',
    modules: [...cssFoundations, ...cssLayout]
  },
  {
    id: 'js',
    title: 'JavaScript',
    subtitle: 'The behavior of the web',
    description:
      'Learn how to store values, write functions, select elements, and make a page respond.',
    status: 'open',
    level: 'Beginner',
    modules: jsModules
  }
];

export function getCourse(courseId) {
  return courses.find((course) => course.id === courseId) || null;
}

export function getAllLessons(course) {
  if (!course) return [];
  return course.modules.flatMap((module) => module.lessons);
}

export function getLesson(courseId, lessonId) {
  const course = getCourse(courseId);
  if (!course) return null;
  for (const module of course.modules) {
    const lesson = module.lessons.find((item) => item.id === lessonId);
    if (lesson) return { course, module, lesson };
  }
  return null;
}

export function getNextLesson(course, lessonId) {
  const lessons = getAllLessons(course);
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  return index >= 0 ? lessons[index + 1] || null : null;
}

export function getPreviousLesson(course, lessonId) {
  const lessons = getAllLessons(course);
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  return index > 0 ? lessons[index - 1] : null;
}
