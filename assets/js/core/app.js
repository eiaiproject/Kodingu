import { courses } from '../data/course-index.js';

export { escapeHtml } from './html.js';
export * from './storage.js';
export * from './chrome.js';
export * from './seo.js';
export * from './preview.js';

export function findCourse(id) {
  return courses.find((course) => course.id === id) || null;
}
