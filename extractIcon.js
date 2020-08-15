import archiveUrl from './archiveUrl.js';

export default async function extractIcon(icons, /** @type {string} */ fileName, /** @type {string} */ dimension) {
  const entry = icons[fileName][dimension];

  const response = await fetch(archiveUrl, {
    headers: { 'Range': `bytes=${entry.offset}-${entry.offset + entry.size}` }
  });

  let arrayBuffer = await response.arrayBuffer();
  arrayBuffer = arrayBuffer.slice(30 + entry.name.length);
  const blob = new Blob([UZIP.inflateRaw(new Uint8Array(arrayBuffer))], { type: 'image/png' });

  return URL.createObjectURL(blob);
}
