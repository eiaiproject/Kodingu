export async function runSeries(items, task, index = 0) {
  if (index >= items.length) return;
  await task(items[index], index);
  await runSeries(items, task, index + 1);
}
