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

  // See if `new Response` constructor can be used instead of `UZIP.inflateRaw`
  // TODO: Remove this once tested out
  console.log(dimension, fileName, 'UZIP decoded:', uint8Array.slice(0, 100), uint8Array.length);
  for (const encoding of ['gzip', 'compress', 'deflate', 'br']) {
    try {
      const response = new Response(arrayBuffer, { headers: { 'Content-Encoding': encoding } });
      const arrayBuffer2 = await response.arrayBuffer();
      const uint8Array2 = new Uint8Array(arrayBuffer2);
      console.log(dimension, fileName, encoding, 'decoded:', uint8Array2.slice(0, 100), uint8Array2.length);
    }
    catch (error) {
      console.log(dimension, fileName, encoding, 'decoding failed', error);
    }
  }

  return URL.createObjectURL(blob);
}
