import {
  attr,
  attrIncludes,
  attrStarts,
  challenge,
  check,
  code,
  exists,
  lesson,
  lessonModule,
  note,
  p,
  quiz,
  raw,
  text
} from './lesson-builder.js';
import { parseJsonLd } from './data-helpers.js';

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

export const htmlModulesMetaMedia = [
  lessonModule(
    'html-m5',
    'Metadata and sharing',
    'Three lessons on the head of a document: search metadata, link previews, and structured data.',
    [
      lesson(
        'html-21',
        'Metadata search engines read',
        9,
        'Give a page a language, a title, a description, a canonical address, and a robots rule.',
        [
          p('The head of a document describes the page to machines. Search engines read the title, the description, the canonical address, and the robots rule before they read a single paragraph.'),
          code(
            'html',
            `<html lang="en">
  <head>
    <title>Kodingu field notes</title>
    <meta name="description" content="Short notes about the web.">
    <link rel="canonical" href="https://example.com/notes">
    <meta name="robots" content="index, follow">
  </head>
</html>`
          ),
          p('The lang attribute names the language of the text. The title is the label in a search result and in a browser tab. The description is the sentence under that label.'),
          note('A canonical link tells a search engine which address is the real one when the same page is reachable at more than one URL. It prevents duplicate pages from competing with each other.'),
          p('The robots rule says whether a page may be indexed. "index, follow" is the default for a public page. "noindex" keeps a page out of search results and belongs on private or duplicate pages.')
        ],
        quiz(
          'Which element holds the sentence shown under a page title in search results?',
          ['<title>', '<meta name="description">', '<meta name="robots">'],
          1,
          'The description meta tag supplies the summary under the title. The title element supplies the title itself.'
        ),
        challenge(
          'Complete the document. Give the html element the language "en", set the title to "Kodingu field notes", add the description "Short notes about the web.", point the canonical link at https://example.com/notes, and allow indexing.',
          [
            'Set lang="en" on the html element.',
            'Set the title to "Kodingu field notes".',
            'Add a description meta tag with the text "Short notes about the web.".',
            'Add a canonical link to https://example.com/notes.',
            'Add a robots meta tag that allows indexing.'
          ],
          documentSkeleton,
          `<!DOCTYPE html>
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
          'Every tag in this lesson belongs in the head, except the h1 that is already in the body.',
          [
            raw('The document starts with <!DOCTYPE html>.', /^\s*<!doctype html>/i),
            attr('The html element declares lang="en".', 'html', 'lang', 'en'),
            text('The title is "Kodingu field notes".', 'title', 'Kodingu field notes'),
            attr(
              'The description meta tag carries the expected sentence.',
              'meta[name="description"]',
              'content',
              'Short notes about the web.'
            ),
            attr(
              'The canonical link points at https://example.com/notes.',
              'link[rel="canonical"]',
              'href',
              'https://example.com/notes'
            ),
            attrIncludes('The robots meta tag allows indexing.', 'meta[name="robots"]', 'content', 'index')
          ]
        )
      ),
      lesson(
        'html-22',
        'Link previews with Open Graph',
        8,
        'Describe a page for chat apps and social feeds with Open Graph and Twitter tags.',
        [
          p('When someone pastes a link into a chat, the app builds a preview card. It reads Open Graph tags before it reads the page. Without them the card is a bare URL.'),
          code(
            'html',
            `<meta property="og:title" content="Field notes from Kodingu">
<meta property="og:description" content="Short notes about the web.">
<meta property="og:type" content="article">
<meta property="og:image" content="https://example.com/field-notes.png">
<meta name="twitter:card" content="summary_large_image">`
          ),
          p('Open Graph uses property, not name. The image must be an absolute URL, because the app reading it has no idea which folder the page lives in.'),
          note('The four tags here mirror the page: a title, a description, a type, and an image. Twitter reads its own card tag, and most apps fall back to the Open Graph tags when the Twitter ones are missing.')
        ],
        quiz(
          'Which attribute does an Open Graph tag use instead of name?',
          ['property', 'rel', 'itemprop'],
          0,
          'Open Graph tags use property. Microdata uses itemprop and links use rel.'
        ),
        challenge(
          'Add a preview card to the page head: an Open Graph title "Field notes from Kodingu", the description "Short notes about the web.", the type "article", an absolute image URL, and a large Twitter card.',
          [
            'Add og:title with the value "Field notes from Kodingu".',
            'Add og:description with the value "Short notes about the web.".',
            'Add og:type with the value "article".',
            'Add og:image with an absolute https URL.',
            'Add twitter:card with the value "summary_large_image".'
          ],
          `<head>
    <meta charset="UTF-8">
    <title>Field notes</title>
    <meta name="description" content="Short notes about the web.">
  </head>`,
          `<head>
    <meta charset="UTF-8">
    <title>Field notes</title>
    <meta name="description" content="Short notes about the web.">
    <meta property="og:title" content="Field notes from Kodingu">
    <meta property="og:description" content="Short notes about the web.">
    <meta property="og:type" content="article">
    <meta property="og:image" content="https://example.com/field-notes.png">
    <meta name="twitter:card" content="summary_large_image">
  </head>`,
          'Write og:title and the other Open Graph tags with property, then add one Twitter tag with name.',
          [
            attr(
              'The Open Graph title is "Field notes from Kodingu".',
              'meta[property="og:title"]',
              'content',
              'Field notes from Kodingu'
            ),
            attr(
              'The Open Graph description matches the page description.',
              'meta[property="og:description"]',
              'content',
              'Short notes about the web.'
            ),
            attr('The Open Graph type is "article".', 'meta[property="og:type"]', 'content', 'article'),
            attrStarts(
              'The Open Graph image is an absolute https URL.',
              'meta[property="og:image"]',
              'content',
              'https://'
            ),
            attr(
              'The Twitter card is a large image card.',
              'meta[name="twitter:card"]',
              'content',
              'summary_large_image'
            )
          ]
        )
      ),
      lesson(
        'html-23',
        'Structured data with JSON-LD',
        9,
        'Describe a course to search engines with a JSON-LD block using schema.org types.',
        [
          p('Open Graph describes a link. JSON-LD describes the thing on the page. A search engine can read a course, an event, or a recipe and show it differently in results.'),
          code(
            'html',
            `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Kodingu HTML",
  "description": "Learn the structure of a web page.",
  "provider": { "@type": "Organization", "name": "Kodingu" }
}
</script>`
          ),
          p('The script element carries data, not code. Browsers ignore it and search engines parse it. The @context names the vocabulary, and @type names the kind of thing being described.'),
          note('JSON has no comments and no trailing commas. A single stray comma makes the whole block unreadable, so paste it into a validator before shipping.')
        ],
        quiz(
          'What does the @type key in a JSON-LD block describe?',
          ['The file format', 'The kind of thing on the page', 'The language of the page'],
          1,
          '@type names the schema.org type, such as Course or Article. The format is always JSON.'
        ),
        challenge(
          'Add a JSON-LD block that describes a Course named "Kodingu HTML", with the description "Learn the structure of a web page." and a provider named "Kodingu".',
          [
            'Use a script element with type="application/ld+json".',
            'The block parses as valid JSON.',
            'Set @context to https://schema.org and @type to Course.',
            'Set name to "Kodingu HTML" and description to "Learn the structure of a web page.".',
            'Give the provider the name "Kodingu".'
          ],
          `<head>
    <meta charset="UTF-8">
    <title>Kodingu HTML</title>
  </head>`,
          `<head>
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
          'The script needs type="application/ld+json". Inside it, write one JSON object with @context, @type, name, description, and provider.',
          [
            exists(
              'A JSON-LD script element exists.',
              'script[type="application/ld+json"]'
            ),
            check('The block is valid JSON.', ({ doc }) => parseJsonLd(doc) !== null),
            check('The type is Course and the context is schema.org.', ({ doc }) => {
              const data = parseJsonLd(doc) || {};
              return data['@type'] === 'Course' && String(data['@context']).includes('schema.org');
            }),
            check('The name and description match the course.', ({ doc }) => {
              const data = parseJsonLd(doc) || {};
              return (
                data.name === 'Kodingu HTML' &&
                data.description === 'Learn the structure of a web page.'
              );
            }),
            check(
              'The provider is named Kodingu.',
              ({ doc }) => parseJsonLd(doc)?.provider?.name === 'Kodingu'
            )
          ]
        )
      )
    ]
  ),
  lessonModule(
    'html-m6',
    'Media and accessible content',
    'Three lessons on responsive images, video with captions, and the landmarks every page needs.',
    [
      lesson(
        'html-24',
        'Responsive images',
        9,
        'Serve a wide and a narrow image with srcset, sizes, and reserved space.',
        [
          p('One image file cannot suit both a phone and a wide screen. A large file wastes data on a phone. A small file looks soft on a large screen. The srcset attribute offers the browser a set to choose from.'),
          code(
            'html',
            `<img
  src="field-notes.jpg"
  srcset="field-notes-480.jpg 480w, field-notes-960.jpg 960w"
  sizes="(max-width: 600px) 100vw, 50vw"
  alt="Open field notes on a desk"
  width="960"
  height="640">`
          ),
          p('Each candidate carries its real width: 480w or 960w. The sizes attribute tells the browser how wide the image will be drawn. With both, the browser picks the smallest file that still looks sharp.'),
          note('Width and height on the image reserve space before the file loads. Without them the text below jumps when the image arrives.')
        ],
        quiz(
          'What does the w unit in srcset describe?',
          ['The file size in kilobytes', 'The real width of the candidate image', 'The screen width'],
          1,
          'The w descriptor is the intrinsic width of that file, so 960w means the image is 960 pixels wide.'
        ),
        challenge(
          'Add a responsive image with two candidates (480w and 960w), a sizes rule for narrow and wide screens, the alt text "Open field notes on a desk", and reserved width and height.',
          [
            'Use an img element with src="field-notes.jpg".',
            'Offer both field-notes-480.jpg 480w and field-notes-960.jpg 960w in srcset.',
            'Include a sizes rule with max-width: 600px.',
            'Set alt to "Open field notes on a desk".',
            'Set width="960" and height="640".'
          ],
          `<body>
    <h1>Field notes</h1>
    <img src="field-notes.jpg" alt="">
  </body>`,
          `<body>
    <h1>Field notes</h1>
    <img
      src="field-notes.jpg"
      srcset="field-notes-480.jpg 480w, field-notes-960.jpg 960w"
      sizes="(max-width: 600px) 100vw, 50vw"
      alt="Open field notes on a desk"
      width="960"
      height="640">
  </body>`,
          'Both candidates go in one srcset attribute, separated by a comma. The sizes value starts with the narrow-screen rule.',
          [
            exists('The page contains an image.', 'img'),
            attr('The image has descriptive alt text.', 'img', 'alt', 'Open field notes on a desk'),
            check('srcset offers both the 480w and 960w candidates.', ({ doc }) => {
              const srcset = doc.querySelector('img')?.getAttribute('srcset') || '';
              return srcset.includes('480w') && srcset.includes('960w');
            }),
            attrIncludes(
              'sizes includes a narrow-screen rule at 600px.',
              'img',
              'sizes',
              'max-width: 600px'
            ),
            check('The image reserves its space with width and height.', ({ doc }) => {
              const image = doc.querySelector('img');
              return (
                image?.getAttribute('width') === '960' &&
                image?.getAttribute('height') === '640'
              );
            })
          ]
        )
      ),
      lesson(
        'html-25',
        'Video, audio, and captions',
        8,
        'Embed a video with controls, a poster, a captions track, and a fallback link.',
        [
          p('The video element plays a file inside the page. Controls give the viewer play, volume, and captions without any script. A poster image fills the frame before playback starts.'),
          code(
            'html',
            `<video controls width="640" poster="cover.jpg">
  <source src="tour.mp4" type="video/mp4">
  <track kind="captions" src="tour-en.vtt" srclang="en" label="English">
  <p>Your browser cannot play this video. <a href="tour.mp4">Download it instead</a>.</p>
</video>`
          ),
          p('The source element names the file and its type. A track with kind="captions" carries the words for people who cannot hear the audio, and the srclang tells the browser which language it is.'),
          note('Content between the tags is the fallback. It appears when the browser cannot play the file, so put a link there instead of leaving the element empty.')
        ],
        quiz(
          'Which element carries the captions for a video?',
          ['<source>', '<track>', '<poster>'],
          1,
          'A track element with kind="captions" points at a WebVTT file. source points at the video file.'
        ),
        challenge(
          'Embed a video with controls and a poster, an MP4 source, an English captions track, and a fallback paragraph with a download link.',
          [
            'Use a video element with the controls attribute.',
            'Add a source with src="tour.mp4" and type="video/mp4".',
            'Add a track with kind="captions", src="tour-en.vtt", srclang="en", and label="English".',
            'Set a poster image.',
            'Include fallback text with a link to tour.mp4.'
          ],
          `<body>
    <h1>Field notes</h1>
    <video width="640"></video>
  </body>`,
          `<body>
    <h1>Field notes</h1>
    <video controls width="640" poster="cover.jpg">
      <source src="tour.mp4" type="video/mp4">
      <track kind="captions" src="tour-en.vtt" srclang="en" label="English">
      <p>Your browser cannot play this video. <a href="tour.mp4">Download it instead</a>.</p>
    </video>
  </body>`,
          'The source, the track, and the fallback paragraph all sit inside the video element, after each other.',
          [
            exists('The video has player controls.', 'video[controls]'),
            check('The MP4 source is declared with its type.', ({ doc }) => {
              const source = doc.querySelector('video source');
              return (
                source?.getAttribute('src') === 'tour.mp4' &&
                source?.getAttribute('type') === 'video/mp4'
              );
            }),
            check('The captions track is English and labelled.', ({ doc }) => {
              const track = doc.querySelector('video track');
              return (
                track?.getAttribute('kind') === 'captions' &&
                track?.getAttribute('src') === 'tour-en.vtt' &&
                track?.getAttribute('srclang') === 'en' &&
                track?.getAttribute('label') === 'English'
              );
            }),
            check(
              'The video has a poster image.',
              ({ doc }) => Boolean(doc.querySelector('video')?.getAttribute('poster'))
            ),
            check('The fallback text links to the video file.', ({ doc }) => {
              return (
                (doc.querySelector('video')?.textContent || '').includes('Download') &&
                doc.querySelector('video a')?.getAttribute('href') === 'tour.mp4'
              );
            })
          ]
        )
      ),
      lesson(
        'html-26',
        'Landmarks and skip links',
        9,
        'Give a page a header, a labelled navigation, a main region, and a skip link.',
        [
          p('A landmark is a region with a name a screen reader can jump to. The elements header, nav, main, and footer create landmarks without any attributes.'),
          code(
            'html',
            `<a class="skip-link" href="#main">Skip to content</a>
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
          ),
          p('The skip link is the first thing a keyboard user reaches. It jumps past the navigation to the main region. The main element needs an id so the link has somewhere to land.'),
          note('Only one main region belongs on a page. A second main makes the shortcut ambiguous. Header and footer can repeat if they belong to separate articles.')
        ],
        quiz(
          'Which element holds the primary content of a page?',
          ['<section>', '<main>', '<article>'],
          1,
          'main marks the primary content and should appear once per page. section and article group content inside it.'
        ),
        challenge(
          'Build the page skeleton: a skip link to #main, a header with a navigation labelled "Main", a main region with id="main" and an h1, and a footer.',
          [
            'The first link is a skip link to #main with the text "Skip to content".',
            'Include a header element.',
            'Include a nav element with aria-label="Main" and at least one link.',
            'Include a main element with id="main" and an h1 inside it.',
            'Include a footer element.'
          ],
          `<body>
  <h1>Field notes</h1>
  <p>A page without landmarks is hard to navigate with a screen reader.</p>
</body>`,
          `<body>
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
          'The skip link goes first in the body. The main element keeps its id and holds the h1.',
          [
            check('The first link is a skip link to #main.', ({ doc }) => {
              const first = doc.querySelector('a');
              return (
                first?.getAttribute('href') === '#main' &&
                (first.textContent || '').trim() === 'Skip to content'
              );
            }),
            exists('The page has a header.', 'header'),
            check(
              'The navigation is labelled and contains a link.',
              ({ doc }) => Boolean(doc.querySelector('nav[aria-label="Main"] a'))
            ),
            exists('The main region has id="main".', 'main#main'),
            exists('The h1 lives inside the main region.', 'main#main h1'),
            exists('The page has a footer.', 'footer')
          ]
        )
      )
    ]
  )
];
