import archiveUrl from './archiveUrl.js';

export default async function extractIcon(icons, /** @type {string} */ fileName, /** @type {string} */ dimension) {
  const entry = icons[fileName][dimension];

  const response = await fetch(archiveUrl, {
    headers: { 'Range': `bytes=${entry.offset}-${entry.offset + entry.size}` }
  });

  let arrayBuffer = await response.arrayBuffer();
  arrayBuffer = arrayBuffer.slice(30 + entry.name.length);
  const uint8Array = UZIP.inflateRaw(new Uint8Array(arrayBuffer));
  const blob = new Blob([uint8Array], { type: 'image/png' });

  console.log(dimension, fileName, 'UZIP decoded:', uint8Array.slice(0, 10), uint8Array.slice(-10), uint8Array.length);
  const response2 = new Response(arrayBuffer);
  const arrayBuffer2 = await response2.arrayBuffer();
  const uint8Array2 = new Uint8Array(arrayBuffer2.slice(5, -1));
  console.log(dimension, fileName, 'Response decoded:', uint8Array2.slice(0, 10), uint8Array2.slice(-10), uint8Array2.length);

  return URL.createObjectURL(blob);
}
