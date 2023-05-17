import archiveUrl from './archiveUrl.js';

export default async function parseEntries(log) {
  // Download the HEAD response to find out what the size of the archive is
  const headResponse = await fetch(archiveUrl, {
    method: 'HEAD'
  });

  const archiveSize = Number(headResponse.headers.get('Content-Length'));

  let dataView;

  // Search for the end of central directory record signature (0x06054b50)
  let eocdOffsetFromEnd;
  do {
    // TODO: Fetch only the missing preceeding part not it and the part we already have when retrying
    const rangeOffetFromEnd = dataView ? dataView.byteLength * 2 : 1024;
    log(`Downloading the last ${rangeOffetFromEnd}b from the end`);

    // Download the last few kilobytes of the file to look for the end of central directory record
    // https://en.wikipedia.org/wiki/Zip_(file_format)#End_of_central_directory_record_(EOCD)
    const response = await fetch(archiveUrl, {
      headers: { 'Range': `bytes=${archiveSize - rangeOffetFromEnd}-${archiveSize}` }
    });

    const arrayBuffer = await response.arrayBuffer();
    if (+response.headers.get('Content-Length') === archiveSize) {
      console.log('Entire archive downloaded while searching for EOCD as the server does not support range requests');
      dataView = new DataView(arrayBuffer.slice(archiveSize - rangeOffetFromEnd, archiveSize));
    }
    else {
      dataView = new DataView(arrayBuffer);
    }

    for (let index = 4; index < dataView.byteLength - 4; index++) {
      if (dataView.getUint8(dataView.byteLength - index + 3) !== 0x06) {
        continue;
      }

      if (dataView.getUint8(dataView.byteLength - index + 2) !== 0x05) {
        continue;
      }

      if (dataView.getUint8(dataView.byteLength - index + 1) !== 0x4b) {
        continue;
      }

      if (dataView.getUint8(dataView.byteLength - index) !== 0x50) {
        continue;
      }

      eocdOffsetFromEnd = index;
      break;
    }
  }
  // TODO: Stop at a threshold so on bug we avoid progressively downloading the whole archive for nothing
  while (!eocdOffsetFromEnd);

  // Parse the central directory record offset and size
  const cdOffsetFromStart = dataView.getUint32(dataView.byteLength - eocdOffsetFromEnd + 16, true);
  const cdSize = dataView.getUint32(dataView.byteLength - eocdOffsetFromEnd + 12, true);

  // Fetch yet larger chunk if the central directory structure if out of the bounds still
  if (archiveSize - cdOffsetFromStart > dataView.byteLength) {
    log(`Downloading an exact range (${cdOffsetFromStart}-${cdOffsetFromStart + cdSize} (${cdSize}b)) with the central directory structure`);

    // TODO: Download only the missing portion not the entire central directory structure range
    const response = await fetch(archiveUrl, {
      headers: { 'Range': `bytes=${cdOffsetFromStart}-${cdOffsetFromStart + cdSize}` }
    });

    const arrayBuffer = await response.arrayBuffer();
    if (+response.headers.get('Content-Length') === archiveSize) {
      console.log('Entire archive downloaded while fetching exact EOCD as the server does not support range requests');
      dataView = new DataView(arrayBuffer.slice(cdOffsetFromStart, cdOffsetFromStart + cdSize));
    }
    else {
      dataView = new DataView(arrayBuffer);
    }
  }
  // TODO: Reconfigure the data view to capture the entire central directory exactly
  else {
    throw new Error('TODO: Reset the data view to contain only the central directory');
  }

  log('Parsing entries');
  const icons = {};
  let index = 0;

  // TODO: Filter out directory entries better (probably using internal/external file attributes at 38/38)
  do {
    // See https://en.wikipedia.org/wiki/ZIP_(file_format)#Central_directory_file_header
    // Note that this is not https://en.wikipedia.org/wiki/ZIP_(file_format)#Local_file_header
    const compressionMethod = dataView.getUint16(index + 8, true);
    if (compressionMethod !== 0) {
      throw new Error(`Unsupported compression method ${compressionMethod} - only store is supported`);
    }

    const fileNameLength = dataView.getUint16(index + 28, true);
    const extraFieldLength = dataView.getUint16(index + 30, true);
    const fileCommentLength = dataView.getUint16(index + 32, true);
    const name = String.fromCharCode(...new Uint8Array(dataView.buffer, index + 46, fileNameLength));
    const offset = dataView.getUint32(index + 42, true);
    const size = 30 /* local header */ + fileNameLength + dataView.getUint32(index + 20, true);
    index = index + 46 + fileNameLength + extraFieldLength + fileCommentLength;

    // Filter out the 16x16 directory entry
    if (name === 'FatCow_Icons16x16/') {
      continue;
    }

    // Ditch all 32x32 entries (we will use the 16x16 names)
    if (name === 'FatCow_Icons32x32/') {
      continue;
    }

    const dimension = name.slice('FatCow_Icons'.length, 'FatCow_Icons__'.length);
    const icon = name.slice('FatCow_Icons__x__/'.length).slice(0, -'.png'.length);

    if (!icons[icon]) {
      icons[icon] = {};
    }

    icons[icon][dimension] = { name, offset, size, dimension };
  }
  while (index < dataView.byteLength - 1);

  return icons;
}
