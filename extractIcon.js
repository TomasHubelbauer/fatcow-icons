import archiveUrl from './archiveUrl.js';

let rangeWarning = false;

export default async function extractIcon(icons, /** @type {string} */ fileName, /** @type {string} */ dimension) {
  const entry = icons[fileName][dimension];

  const response = await fetch(archiveUrl, {
    headers: { 'Range': `bytes=${entry.offset}-${entry.offset + entry.size}` }
  });

  let arrayBuffer = await response.arrayBuffer();
  if (+response.headers.get('Content-Length') !== entry.size) {
    if (!rangeWarning) {
      console.log('Entire archive downloaded while extracting an icon as the server does not support range requests');
      rangeWarning = true;
    }

    arrayBuffer = arrayBuffer.slice(entry.offset, entry.offset + entry.size);
  }

  const zipUint8Array = new Uint8Array(arrayBuffer, 0, 10);
  const pngUint8Array = new Uint8Array(arrayBuffer, 30 + entry.name.length + 5, 10);
  console.log(
    fileName, dimension,
    zipUint8Array, String.fromCharCode(...zipUint8Array).replace(/\n/g, ' '),
    pngUint8Array, String.fromCharCode(...pngUint8Array).replace(/\n/g, ' '),
    '…'
  );

  // Note that the first 30+ bytes are the local file header and file name
  // Note that I don't know why the extra 5 bytes at the start and 1 at the end are there
  const uint8Array = new Uint8Array(arrayBuffer.slice(30 + entry.name.length).slice(5));
  const blob = new Blob([uint8Array], { type: 'image/png' });
  return URL.createObjectURL(blob);
}
