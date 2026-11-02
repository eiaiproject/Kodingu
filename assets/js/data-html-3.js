import { textOf } from './data-helpers.js';

const documentSkeleton = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Untitled</title>
  </head>
  <body>
    <h1>Field notes</h1>
  </body>
</html>`;

const mediaSkeleton = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Field notes</title>
  </head>
  <body>
    <h1>Field notes</h1>
  </body>
</html>`;

export const htmlModulesPhase3 = [
  {
    id: 'html-m5',
    title: 'Metadata and sharing',
    description:
      'Three lessons on the head of a document: search metadata, link previews, and structured data.',
    lessons: [
      {
        id: 'html-21',
        title: 'Metadata search engines read',
        minutes: 9,
        xp: 25,
        objective:
          'Give a page a language, a title, a description, a canonical address, and a robots rule.',
        theory: [
          {
            type: 'p',
            text: 'The head of a document describes the page to machines. Search engines read the title, the description, the canonical address, and the robots rule before they read a single paragraph.'
          },
          {
            type: 'code',
            lang: 'html',
            code: `<html lang="en">
  <head>
    <title>Kodingu field notes</title>
    <meta name="description" content="Short notes about the web.">
    <link rel="canonical" href="https://example.com/notes">
    <meta name="robots" content="index, follow">
  </head>
</html>`
          },
          {
            type: 'p',
            text: 'The lang attribute names the language of the text. The title is the label in a search result and in a browser tab. The description is the sentence under that label.'
          },
          {
            type: 'note',
            text: 'A canonical link tells a search engine which address is the real one when the same page is reachable at more than one URL. It prevents duplicate pages from competing with each other.'
          },
          {
            type: 'p',
            text: 'The robots rule says whether a page may be indexed. "index, follow" is the default for a public page. "noindex" keeps a page out of search results and belongs on private or duplicate pages.'
          }
        ],
        quiz: {
          question: 'Which element holds the sentence shown under a page title in search results?',
          options: ['<title>', '<meta name="description">', '<meta name="robots">'],
          answer: 1,
          explanation:
            'The description meta tag supplies the summary under the title. The title element supplies the title itself.'
        },
        challenge: {
          prompt:
            'Complete the document. Give the html element the language "en", set the title to "Kodingu field notes", add the description "Short notes about the web.", point the canonical link at https://example.com/notes, and allow indexing.',
          requirements: [
            'Set lang="en" on the html element.',
            'Set the title to "Kodingu field notes".',
            'Add a description meta tag with the text "Short notes about the web.".',
            'Add a canonical link to https://example.com/notes.',
            'Add a robots meta tag that allows indexing.'
          ],
          starter: documentSkeleton,
          solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Kodingu field notes</title>
    <meta name="description" content="Short notes about the web.">
    <link rel="canonical" href="https://example.com/notes">
    <meta name="robots" content="index, follow">
  </head>
  <body>
    <h1>Field notes</h1>
  </body>
</html>`,
          hint: 'Every tag in this lesson belongs in the head, except the h1 that is already in the body.',
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
              label: 'The title is "Kodingu field notes".',
              run: ({ doc }) => textOf(doc, 'title') === 'Kodingu field notes'
            },
            {
              label: 'The description meta tag carries the expected sentence.',
              run: ({ doc }) =>
                doc.querySelector('meta[name="description"]')?.getAttribute('content') ===
                'Short notes about the web.'
            },
            {
              label: 'The canonical link points at https://example.com/notes.',
              run: ({ doc }) =>
                doc.querySelector('link[rel="canonical"]')?.getAttribute('href') ===
                'https://example.com/notes'
            },
            {
              label: 'The robots meta tag allows indexing.',
              run: ({ doc }) =>
                (doc.querySelector('meta[name="robots"]')?.getAttribute('content') || '').includes(
                  'index'
                )
            }
          ]
        }
      },
      {
        id: 'html-22',
        title: 'Link previews with Open Graph',
        minutes: 8,
        xp: 25,
        objective: 'Describe a page for chat apps and social feeds with Open Graph and Twitter tags.',
        theory: [
          {
            type: 'p',
            text: 'When someone pastes a link into a chat, the app builds a preview card. It reads Open Graph tags before it reads the page. Without them the card is a bare URL.'
          },
          {
            type: 'code',
            lang: 'html',
            code: `<meta property="og:title" content="Field notes from Kodingu">
<meta property="og:description" content="Short notes about the web.">
<meta property="og:type" content="article">
<meta property="og:image" content="https://example.com/field-notes.png">
<meta name="twitter:card" content="summary_large_image">`
          },
          {
            type: 'p',
            text: 'Open Graph uses property, not name. The image must be an absolute URL, because the app reading it has no idea which folder the page lives in.'
          },
          {
            type: 'note',
            text: 'The four tags here mirror the page: a title, a description, a type, and an image. Twitter reads its own card tag, and most apps fall back to the Open Graph tags when the Twitter ones are missing.'
          }
        ],
        quiz: {
          question: 'Which attribute does an Open Graph tag use instead of name?',
          options: ['property', 'rel', 'itemprop'],
          answer: 0,
          explanation:
            'Open Graph tags use property. Microdata uses itemprop and links use rel.'
        },
        challenge: {
          prompt:
            'Add a preview card to the page head: an Open Graph title "Field notes from Kodingu", the description "Short notes about the web.", the type "article", an absolute image URL, and a large Twitter card.',
          requirements: [
            'Add og:title with the value "Field notes from Kodingu".',
            'Add og:description with the value "Short notes about the web.".',
            'Add og:type with the value "article".',
            'Add og:image with an absolute https URL.',
            'Add twitter:card with the value "summary_large_image".'
          ],
          starter: `<head>
    <meta charset="UTF-8">
    <title>Field notes</title>
    <meta name="description" content="Short notes about the web.">
  </head>`,
          solution: `<head>
    <meta charset="UTF-8">
    <title>Field notes</title>
    <meta name="description" content="Short notes about the web.">
    <meta property="og:title" content="Field notes from Kodingu">
    <meta property="og:description" content="Short notes about the web.">
    <meta property="og:type" content="article">
    <meta property="og:image" content="https://example.com/field-notes.png">
    <meta name="twitter:card" content="summary_large_image">
  </head>`,
          hint: 'Write og:title and the other Open Graph tags with property, then add one Twitter tag with name.',
          tests: [
            {
              label: 'The Open Graph title is "Field notes from Kodingu".',
              run: ({ doc }) =>
                doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ===
                'Field notes from Kodingu'
            },
            {
              label: 'The Open Graph description matches the page description.',
              run: ({ doc }) =>
                doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ===
                'Short notes about the web.'
            },
            {
              label: 'The Open Graph type is "article".',
              run: ({ doc }) =>
                doc.querySelector('meta[property="og:type"]')?.getAttribute('content') === 'article'
            },
            {
              label: 'The Open Graph image is an absolute https URL.',
              run: ({ doc }) =>
                (doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '').startsWith(
                  'https://'
                )
            },
            {
              label: 'The Twitter card is a large image card.',
              run: ({ doc }) =>
                doc.querySelector('meta[name="twitter:card"]')?.getAttribute('content') ===
                'summary_large_image'
            }
          ]
        }
      },
      {
        id: 'html-23',
        title: 'Structured data with JSON-LD',
        minutes: 9,
        xp: 25,
        objective: 'Describe a course to search engines with a JSON-LD block using schema.org types.',
        theory: [
          {
            type: 'p',
            text: 'Open Graph describes a link. JSON-LD describes the thing on the page. A search engine can read a course, an event, or a recipe and show it differently in results.'
          },
          {
            type: 'code',
            lang: 'html',
            code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Kodingu HTML",
  "description": "Learn the structure of a web page.",
  "provider": { "@type": "Organization", "name": "Kodingu" }
}
</script>`
          },
          {
            type: 'p',
            text: 'The script element carries data, not code. Browsers ignore it and search engines parse it. The @context names the vocabulary, and @type names the kind of thing being described.'
          },
          {
            type: 'note',
            text: 'JSON has no comments and no trailing commas. A single stray comma makes the whole block unreadable, so paste it into a validator before shipping.'
          }
        ],
        quiz: {
          question: 'What does the @type key in a JSON-LD block describe?',
          options: ['The file format', 'The kind of thing on the page', 'The language of the page'],
          answer: 1,
          explanation:
            '@type names the schema.org type, such as Course or Article. The format is always JSON.'
        },
        challenge: {
          prompt:
            'Add a JSON-LD block that describes a Course named "Kodingu HTML", with the description "Learn the structure of a web page." and a provider named "Kodingu".',
          requirements: [
            'Use a script element with type="application/ld+json".',
            'The block parses as valid JSON.',
            'Set @context to https://schema.org and @type to Course.',
            'Set name to "Kodingu HTML" and description to "Learn the structure of a web page.".',
            'Give the provider the name "Kodingu".'
          ],
          starter: `<head>
    <meta charset="UTF-8">
    <title>Kodingu HTML</title>
  </head>`,
          solution: `<head>
    <meta charset="UTF-8">
    <title>Kodingu HTML</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": "Kodingu HTML",
      "description": "Learn the structure of a web page.",
      "provider": { "@type": "Organization", "name": "Kodingu" }
    }
    </script>
  </head>`,
          hint: 'The script needs type="application/ld+json". Inside it, write one JSON object with @context, @type, name, description, and provider.',
          tests: [
            {
              label: 'A JSON-LD script element exists.',
              run: ({ doc }) => Boolean(doc.querySelector('script[type="application/ld+json"]'))
            },
            {
              label: 'The block is valid JSON.',
              run: ({ doc }) => {
                const node = doc.querySelector('script[type="application/ld+json"]');
                if (!node) return false;
                try {
                  JSON.parse(node.textContent);
                  return true;
                } catch (error) {
                  return false;
                }
              }
            },
            {
              label: 'The type is Course and the context is schema.org.',
              run: ({ doc }) => {
                try {
                  const data = JSON.parse(doc.querySelector('script[type="application/ld+json"]')?.textContent || '{}');
                  return data['@type'] === 'Course' && String(data['@context']).includes('schema.org');
                } catch (error) {
                  return false;
                }
              }
            },
            {
              label: 'The name and description match the course.',
              run: ({ doc }) => {
                try {
                  const data = JSON.parse(doc.querySelector('script[type="application/ld+json"]')?.textContent || '{}');
                  return (
                    data.name === 'Kodingu HTML' &&
                    data.description === 'Learn the structure of a web page.'
                  );
                } catch (error) {
                  return false;
                }
              }
            },
            {
              label: 'The provider is named Kodingu.',
              run: ({ doc }) => {
                try {
                  const data = JSON.parse(doc.querySelector('script[type="application/ld+json"]')?.textContent || '{}');
                  return data.provider?.name === 'Kodingu';
                } catch (error) {
                  return false;
                }
              }
            }
          ]
        }
      }
    ]
  },
  {
    id: 'html-m6',
    title: 'Media and accessible content',
    description:
      'Three lessons on responsive images, video with captions, and the landmarks every page needs.',
    lessons: [
      {
        id: 'html-24',
        title: 'Responsive images',
        minutes: 9,
        xp: 25,
        objective: 'Serve a wide and a narrow image with srcset, sizes, and reserved space.',
        theory: [
          {
            type: 'p',
            text: 'One image file cannot suit both a phone and a wide screen. A large file wastes data on a phone. A small file looks soft on a large screen. The srcset attribute offers the browser a set to choose from.'
          },
          {
            type: 'code',
            lang: 'html',
            code: `<img
  src="field-notes.jpg"
  srcset="field-notes-480.jpg 480w, field-notes-960.jpg 960w"
  sizes="(max-width: 600px) 100vw, 50vw"
  alt="Open field notes on a desk"
  width="960"
  height="640">`
          },
          {
            type: 'p',
            text: 'Each candidate carries its real width: 480w or 960w. The sizes attribute tells the browser how wide the image will be drawn. With both, the browser picks the smallest file that still looks sharp.'
          },
          {
            type: 'note',
            text: 'Width and height on the image reserve space before the file loads. Without them the text below jumps when the image arrives.'
          }
        ],
        quiz: {
          question: 'What does the w unit in srcset describe?',
          options: ['The file size in kilobytes', 'The real width of the candidate image', 'The screen width'],
          answer: 1,
          explanation:
            'The w descriptor is the intrinsic width of that file, so 960w means the image is 960 pixels wide.'
        },
        challenge: {
          prompt:
            'Add a responsive image with two candidates (480w and 960w), a sizes rule for narrow and wide screens, the alt text "Open field notes on a desk", and reserved width and height.',
          requirements: [
            'Use an img element with src="field-notes.jpg".',
            'Offer both field-notes-480.jpg 480w and field-notes-960.jpg 960w in srcset.',
            'Include a sizes rule with max-width: 600px.',
            'Set alt to "Open field notes on a desk".',
            'Set width="960" and height="640".'
          ],
          starter: `<body>
    <h1>Field notes</h1>
    <img src="field-notes.jpg" alt="">
  </body>`,
          solution: `<body>
    <h1>Field notes</h1>
    <img
      src="field-notes.jpg"
      srcset="field-notes-480.jpg 480w, field-notes-960.jpg 960w"
      sizes="(max-width: 600px) 100vw, 50vw"
      alt="Open field notes on a desk"
      width="960"
      height="640">
  </body>`,
          hint: 'Both candidates go in one srcset attribute, separated by a comma. The sizes value starts with the narrow-screen rule.',
          tests: [
            {
              label: 'The page contains an image.',
              run: ({ doc }) => Boolean(doc.querySelector('img'))
            },
            {
              label: 'The image has descriptive alt text.',
              run: ({ doc }) =>
                doc.querySelector('img')?.getAttribute('alt') === 'Open field notes on a desk'
            },
            {
              label: 'srcset offers both the 480w and 960w candidates.',
              run: ({ doc }) => {
                const srcset = doc.querySelector('img')?.getAttribute('srcset') || '';
                return srcset.includes('480w') && srcset.includes('960w');
              }
            },
            {
              label: 'sizes includes a narrow-screen rule at 600px.',
              run: ({ doc }) =>
                (doc.querySelector('img')?.getAttribute('sizes') || '').includes('max-width: 600px')
            },
            {
              label: 'The image reserves its space with width and height.',
              run: ({ doc }) => {
                const image = doc.querySelector('img');
                return (
                  image?.getAttribute('width') === '960' &&
                  image?.getAttribute('height') === '640'
                );
              }
            }
          ]
        }
      },
      {
        id: 'html-25',
        title: 'Video, audio, and captions',
        minutes: 8,
        xp: 25,
        objective: 'Embed a video with controls, a poster, a captions track, and a fallback link.',
        theory: [
          {
            type: 'p',
            text: 'The video element plays a file inside the page. Controls give the viewer play, volume, and captions without any script. A poster image fills the frame before playback starts.'
          },
          {
            type: 'code',
            lang: 'html',
            code: `<video controls width="640" poster="cover.jpg">
  <source src="tour.mp4" type="video/mp4">
  <track kind="captions" src="tour-en.vtt" srclang="en" label="English">
  <p>Your browser cannot play this video. <a href="tour.mp4">Download it instead</a>.</p>
</video>`
          },
          {
            type: 'p',
            text: 'The source element names the file and its type. A track with kind="captions" carries the words for people who cannot hear the audio, and the srclang tells the browser which language it is.'
          },
          {
            type: 'note',
            text: 'Content between the tags is the fallback. It appears when the browser cannot play the file, so put a link there instead of leaving the element empty.'
          }
        ],
        quiz: {
          question: 'Which element carries the captions for a video?',
          options: ['<source>', '<track>', '<poster>'],
          answer: 1,
          explanation:
            'A track element with kind="captions" points at a WebVTT file. source points at the video file.'
        },
        challenge: {
          prompt:
            'Embed a video with controls and a poster, an MP4 source, an English captions track, and a fallback paragraph with a download link.',
          requirements: [
            'Use a video element with the controls attribute.',
            'Add a source with src="tour.mp4" and type="video/mp4".',
            'Add a track with kind="captions", src="tour-en.vtt", srclang="en", and label="English".',
            'Set a poster image.',
            'Include fallback text with a link to tour.mp4.'
          ],
          starter: `<body>
    <h1>Field notes</h1>
    <video width="640"></video>
  </body>`,
          solution: `<body>
    <h1>Field notes</h1>
    <video controls width="640" poster="cover.jpg">
      <source src="tour.mp4" type="video/mp4">
      <track kind="captions" src="tour-en.vtt" srclang="en" label="English">
      <p>Your browser cannot play this video. <a href="tour.mp4">Download it instead</a>.</p>
    </video>
  </body>`,
          hint: 'The source, the track, and the fallback paragraph all sit inside the video element, after each other.',
          tests: [
            {
              label: 'The video has player controls.',
              run: ({ doc }) => doc.querySelector('video')?.hasAttribute('controls') === true
            },
            {
              label: 'The MP4 source is declared with its type.',
              run: ({ doc }) => {
                const source = doc.querySelector('video source');
                return (
                  source?.getAttribute('src') === 'tour.mp4' &&
                  source?.getAttribute('type') === 'video/mp4'
                );
              }
            },
            {
              label: 'The captions track is English and labelled.',
              run: ({ doc }) => {
                const track = doc.querySelector('video track');
                return (
                  track?.getAttribute('kind') === 'captions' &&
                  track?.getAttribute('src') === 'tour-en.vtt' &&
                  track?.getAttribute('srclang') === 'en' &&
                  track?.getAttribute('label') === 'English'
                );
              }
            },
            {
              label: 'The video has a poster image.',
              run: ({ doc }) => Boolean(doc.querySelector('video')?.getAttribute('poster'))
            },
            {
              label: 'The fallback text links to the video file.',
              run: ({ doc }) =>
                (doc.querySelector('video')?.textContent || '').includes('Download') &&
                doc.querySelector('video a')?.getAttribute('href') === 'tour.mp4'
            }
          ]
        }
      },
      {
        id: 'html-26',
        title: 'Landmarks and skip links',
        minutes: 9,
        xp: 25,
        objective: 'Give a page a header, a labelled navigation, a main region, and a skip link.',
        theory: [
          {
            type: 'p',
            text: 'A landmark is a region with a name a screen reader can jump to. The elements header, nav, main, and footer create landmarks without any attributes.'
          },
          {
            type: 'code',
            lang: 'html',
            code: `<a class="skip-link" href="#main">Skip to content</a>
<header>
  <p>Kodingu field notes</p>
  <nav aria-label="Main">
    <a href="index.html">Home</a>
  </nav>
</header>
<main id="main">
  <h1>Field notes</h1>
</main>
<footer><p>Written in the browser.</p></footer>`
          },
          {
            type: 'p',
            text: 'The skip link is the first thing a keyboard user reaches. It jumps past the navigation to the main region. The main element needs an id so the link has somewhere to land.'
          },
          {
            type: 'note',
            text: 'Only one main region belongs on a page. A second main makes the shortcut ambiguous. Header and footer can repeat if they belong to separate articles.'
          }
        ],
        quiz: {
          question: 'Which element holds the primary content of a page?',
          options: ['<section>', '<main>', '<article>'],
          answer: 1,
          explanation:
            'main marks the primary content and should appear once per page. section and article group content inside it.'
        },
        challenge: {
          prompt:
            'Build the page skeleton: a skip link to #main, a header with a navigation labelled "Main", a main region with id="main" and an h1, and a footer.',
          requirements: [
            'The first link is a skip link to #main with the text "Skip to content".',
            'Include a header element.',
            'Include a nav element with aria-label="Main" and at least one link.',
            'Include a main element with id="main" and an h1 inside it.',
            'Include a footer element.'
          ],
          starter: `<body>
  <h1>Field notes</h1>
  <p>A page without landmarks is hard to navigate with a screen reader.</p>
</body>`,
          solution: `<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header>
    <p>Kodingu field notes</p>
    <nav aria-label="Main">
      <a href="index.html">Home</a>
    </nav>
  </header>
  <main id="main">
    <h1>Field notes</h1>
    <p>Short notes about the web.</p>
  </main>
  <footer>
    <p>Written in the browser.</p>
  </footer>
</body>`,
          hint: 'The skip link goes first in the body. The main element keeps its id and holds the h1.',
          tests: [
            {
              label: 'The first link is a skip link to #main.',
              run: ({ doc }) => {
                const first = doc.querySelector('a');
                return (
                  first?.getAttribute('href') === '#main' &&
                  (first.textContent || '').trim() === 'Skip to content'
                );
              }
            },
            {
              label: 'The page has a header.',
              run: ({ doc }) => Boolean(doc.querySelector('header'))
            },
            {
              label: 'The navigation is labelled and contains a link.',
              run: ({ doc }) => {
                const nav = doc.querySelector('nav[aria-label="Main"]');
                return Boolean(nav?.querySelector('a'));
              }
            },
            {
              label: 'The main region has id="main".',
              run: ({ doc }) => Boolean(doc.querySelector('main#main'))
            },
            {
              label: 'The h1 lives inside the main region.',
              run: ({ doc }) => Boolean(doc.querySelector('main#main h1'))
            },
            {
              label: 'The page has a footer.',
              run: ({ doc }) => Boolean(doc.querySelector('footer'))
            }
          ]
        }
      }
    ]
  }
];
