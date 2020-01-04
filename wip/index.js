window.addEventListener('load', async () => {
  const archiveUrl = 'fatcow-hosting-icons-3.9.2.zip';

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
    console.log(`Downloading the last ${rangeOffetFromEnd}b from the end`);

    // Download the last few kilobytes of the file to look for the end of central directory record
    // https://en.wikipedia.org/wiki/Zip_(file_format)#End_of_central_directory_record_(EOCD)
    const response = await fetch(archiveUrl, {
      headers: { 'Range': `bytes=${archiveSize - rangeOffetFromEnd}-${archiveSize}` }
    });

    const arrayBuffer = await response.arrayBuffer();
    dataView = new DataView(arrayBuffer);

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
    console.log(`Downloading an exact range (${cdOffsetFromStart}-${cdOffsetFromStart + cdSize} (${cdSize}b)) with the central directory structure`);

    // TODO: Download only the missing portion not the entire central directory structure range
    const response = await fetch(archiveUrl, {
      headers: { 'Range': `bytes=${cdOffsetFromStart}-${cdOffsetFromStart + cdSize}` }
    });

    const arrayBuffer = await response.arrayBuffer();
    dataView = new DataView(arrayBuffer);
  }
  // TODO: Reconfigure the data view to capture the entire central directory exactly
  else {
    throw new Error('TODO: Reset the data view to contain only the central directory');
  }

  const entries = [];
  let index = 0;
  do {
    const fileNameLength = dataView.getUint16(index + 28, true);
    const extraFieldLength = dataView.getUint16(index + 30, true);
    const fileCommentLength = dataView.getUint16(index + 32, true);
    const name = String.fromCharCode(...new Uint8Array(dataView.buffer, index + 46, fileNameLength));
    const offset = dataView.getUint32(index + 42, true);
    const size = 30 /* local header */ + fileNameLength + dataView.getUint32(index + 20, true);

    // TODO: Filter out directory entries (probably using internal/external file attributes at 38/38)
    entries.push({ name, offset, size });
    index = index + 46 + fileNameLength + extraFieldLength + fileCommentLength;
  }
  while (index < dataView.byteLength - 1);

  async function handleEntryButtonClick(event) {
    const name = event.currentTarget.dataset.name;
    const entry = entries.find(e => e.name === name);

    // Capture to survive the async flow
    const button = event.currentTarget;

    console.log('Downloading the actual file range');
    const response = await fetch(archiveUrl, {
      headers: { 'Range': `bytes=${entry.offset}-${entry.offset + entry.size}` }
    });

    let arrayBuffer = await response.arrayBuffer();
    const uncompressed = new DataView(arrayBuffer).getUint32(22, true);

    arrayBuffer = arrayBuffer.slice(30 + entry.name.length);
    const zip = UZIP.inflateRaw(new Uint8Array(arrayBuffer));
    const blob = new Blob([zip], { type: 'image/png' });

    console.log(zip.length, uncompressed, blob, URL.createObjectURL(blob));

    const iconImg = document.createElement('img');
    iconImg.src = URL.createObjectURL(blob);
    button.append(iconImg);
  }

  for (const entry of entries) {
    const entryButton = document.createElement('button');
    entryButton.textContent = entry.name;
    entryButton.dataset.name = entry.name;
    entryButton.addEventListener('click', handleEntryButtonClick);
    document.body.append(entryButton);
  }


});
