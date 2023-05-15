import archiveUrl from './archiveUrl.js';

export default async function extractIcon(icons, /** @type {string} */ fileName, /** @type {string} */ dimension) {
  const entry = icons[fileName][dimension];

  const response = await fetch(archiveUrl, {
    headers: { 'Range': `bytes=${entry.offset}-${entry.offset + entry.size}` }
  });

  // Use the `Response` constructor to decode the encoded ZIP file slice
  const arrayBuffer = await new Response(await response.arrayBuffer()).arrayBuffer();

  // Note that the first 30+ bytes are the local file header and file name
  // Note that I don't know why the extra 5 bytes at the start and 1 at the end are there
  const uint8Array = new Uint8Array(arrayBuffer.slice(30 + entry.name.length).slice(5, -1));
  const blob = new Blob([uint8Array], { type: 'image/png' });
  return URL.createObjectURL(blob);
}
