import {
  cssHas as cssHasRule,
  cssIncludes as cssIncludesRule,
  textOf,
  textsOf
} from './data-helpers.js';

export const p = (text) => ({ type: 'p', text });
export const note = (text) => ({ type: 'note', text });
export const code = (lang, source) => ({ type: 'code', lang, code: source });

export const quiz = (question, options, answer, explanation) => ({
  question,
  options,
  answer,
  explanation
});

export const challenge = (prompt, requirements, starter, solution, hint, tests) => ({
  prompt,
  requirements,
  starter,
  solution,
  hint,
  tests
});

export const lesson = (id, title, minutes, objective, theory, ...practice) => {
  const [quizData, challengeData, extra = {}] = practice;
  return {
    id,
    title,
    minutes,
    xp: 25,
    ...extra,
    objective,
    theory,
    quiz: quizData,
    challenge: challengeData
  };
};

export const lessonModule = (id, title, description, lessons) => ({
  id,
  title,
  description,
  lessons
});

const makeTest = (label, run, source) => ({
  label,
  run,
  ...(source ? { source } : {})
});

export const check = makeTest;
export const raw = (label, pattern) =>
  makeTest(
    label,
    ({ raw: source }) => pattern.test(source),
    `({ raw: source }) => ${pattern.toString()}.test(source)`
  );
export const exists = (label, selector) =>
  makeTest(
    label,
    ({ doc }) => Boolean(doc.querySelector(selector)),
    `({ doc }) => Boolean(doc.querySelector(${JSON.stringify(selector)}))`
  );
export const text = (label, selector, expected) =>
  makeTest(
    label,
    ({ doc }) => textOf(doc, selector) === expected,
    `({ doc }) => textOf(doc, ${JSON.stringify(selector)}) === ${JSON.stringify(expected)}`
  );
export const texts = (label, selector, expected) =>
  makeTest(
    label,
    ({ doc }) => textsOf(doc, selector).join('|') === expected.join('|'),
    `({ doc }) => textsOf(doc, ${JSON.stringify(selector)}).join('|') === ${JSON.stringify(expected.join('|'))}`
  );
export const attr = (label, selector, name, expected) =>
  makeTest(
    label,
    ({ doc }) => doc.querySelector(selector)?.getAttribute(name) === expected,
    `({ doc }) => doc.querySelector(${JSON.stringify(selector)})?.getAttribute(${JSON.stringify(name)}) === ${JSON.stringify(expected)}`
  );
export const attrIncludes = (label, selector, name, expected) =>
  makeTest(
    label,
    ({ doc }) => (doc.querySelector(selector)?.getAttribute(name) || '').includes(expected),
    `({ doc }) => (doc.querySelector(${JSON.stringify(selector)})?.getAttribute(${JSON.stringify(name)}) || '').includes(${JSON.stringify(expected)})`
  );
export const attrStarts = (label, selector, name, expected) =>
  makeTest(
    label,
    ({ doc }) => (doc.querySelector(selector)?.getAttribute(name) || '').startsWith(expected),
    `({ doc }) => (doc.querySelector(${JSON.stringify(selector)})?.getAttribute(${JSON.stringify(name)}) || '').startsWith(${JSON.stringify(expected)})`
  );
export const count = (label, selector, expected) =>
  makeTest(
    label,
    ({ doc }) => doc.querySelectorAll(selector).length === expected,
    `({ doc }) => doc.querySelectorAll(${JSON.stringify(selector)}).length === ${expected}`
  );
export const css = (label, selector, property, expected, media) =>
  makeTest(label, ({ css: source }) => cssHasRule(source, selector, property, expected, media));
export const cssIncludes = (label, selector, property, expected) =>
  makeTest(label, ({ css: source }) => cssIncludesRule(source, selector, property, expected));
