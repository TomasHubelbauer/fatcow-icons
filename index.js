const archiveUrl = 'fatcow-hosting-icons-3.9.2.zip';
let icons;

window.addEventListener('load', async () => {
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

  console.log('Parsing entries');
  icons = {};
  let index = 0;

  // TODO: Filter out directory entries better (probably using internal/external file attributes at 38/38)
  do {
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

  console.log('Parsed', Object.keys(icons).length, 'entries');

  if (location.search) {
    const filter = new URLSearchParams(location.search).get('search').trim();
    const keys = Object.keys(icons).filter(icon => icon.toUpperCase().includes(filter.toUpperCase()));
    const _icons = icons;
    icons = {};
    for (const key of keys) {
      icons[key] = _icons[key];
    }

    document.getElementsByName('search')[0].value = filter;
    resultsDiv.textContent = `Showing ${Object.keys(icons).length} matching icons`;
  } else {
    resultsDiv.textContent = `Showing all ${Object.keys(icons).length} icons`;
  }

  renderList();
  windowList();
  window.addEventListener('scroll', handleWindowScroll, { passive: true /* We do not need `preventDefault` */ });

  // Handle `resize` for debugging responsive layout, no harm done leaving this in
  window.addEventListener('resize', handleWindowScroll, { passive: true /* We do not need `preventDefault` */ });
});

function renderList() {
  const iconsDiv = document.getElementById('iconsDiv');
  iconsDiv.innerHTML = '';

  const fragment = document.createDocumentFragment();

  for (let key of Object.keys(icons)) {
    const iconDiv = document.createElement('div');
    iconDiv.className = 'iconDiv';
    iconDiv.id = key;
    fragment.append(iconDiv);
  }

  iconsDiv.append(fragment);
}

async function extractIcon(fileName, dimension) {
  const entry = icons[fileName][dimension];

  const response = await fetch(archiveUrl, {
    headers: { 'Range': `bytes=${entry.offset}-${entry.offset + entry.size}` }
  });

  let arrayBuffer = await response.arrayBuffer();
  arrayBuffer = arrayBuffer.slice(30 + entry.name.length);
  const blob = new Blob([UZIP.inflateRaw(new Uint8Array(arrayBuffer))], { type: 'image/png' });

  return URL.createObjectURL(blob);
}

async function handleDownloadButtonClick(event) {
  const name = event.currentTarget.dataset.name;
  const type = event.currentTarget.dataset.type;
  const dimension = event.currentTarget.dataset.dimension;

  if (type === 'ico') {
    alert('Sorry, ICO downloads are not available at the moment. Contact me at tomas@hubelbauer.net');
    return;
  }

  const url = await extractIcon(name, dimension);
  const downloadA = document.getElementById('downloadA');
  downloadA.href = url;
  downloadA.target = '_blank';
  downloadA.download = `${name}-${dimension}.${type}`;
  downloadA.click();
}

function renderItem(fileName) {
  const iconDiv = document.getElementById(fileName);

  // Double check the element is still on the screen since it has been requested
  const boundingClientRect = iconDiv.getBoundingClientRect();
  if (boundingClientRect.bottom < 0 && boundingClientRect.top > window.innerHeight) {
    // Bail if the element has not been on the screen long enough
    return;
  }

  if (iconDiv.textContent !== '') {
    // Bail since this item has already been rendered
    return;
  }

  const icon16Img = document.createElement('img');
  icon16Img.title = fileName + ' 16';
  icon16Img.className = 'icon16';
  extractIcon(fileName, '16')
    .then(url => icon16Img.src = url)
    .catch(console.log)
    ;

  const icon32Img = document.createElement('img');
  icon32Img.title = fileName + ' 32';
  icon32Img.className = 'icon32';
  extractIcon(fileName, '32')
    .then(url => icon32Img.src = url)
    .catch(console.log)
    ;

  const nameSpan = document.createElement('span');
  nameSpan.textContent = fileName.replace(/_/g, ' ');

  const png16Button = document.createElement('button');
  png16Button.textContent = '16\npng';
  png16Button.dataset.name = fileName;
  png16Button.dataset.type = 'png';
  png16Button.dataset.dimension = '16';
  png16Button.addEventListener('click', handleDownloadButtonClick);

  const png32Button = document.createElement('button');
  png32Button.textContent = '32\npng';
  png32Button.dataset.name = fileName;
  png32Button.dataset.type = 'png';
  png32Button.dataset.dimension = '32';
  png32Button.addEventListener('click', handleDownloadButtonClick);

  const ico16Button = document.createElement('button');
  ico16Button.textContent = '16\nico';
  ico16Button.dataset.name = fileName;
  ico16Button.dataset.type = 'ico';
  ico16Button.dataset.dimension = '16';
  ico16Button.addEventListener('click', handleDownloadButtonClick);

  const ico32Button = document.createElement('button');
  ico32Button.textContent = '32\nico';
  ico32Button.dataset.name = fileName;
  ico32Button.dataset.type = 'ico';
  ico32Button.dataset.dimension = '32';
  ico32Button.addEventListener('click', handleDownloadButtonClick);

  iconDiv.append(icon16Img, icon32Img, nameSpan, png16Button, png32Button, ico16Button, ico32Button);
}

let scrollTimeout;
let lastScroll;
function windowList() {
  const iconDivs = [...document.getElementsByClassName('iconDiv')];
  if (window.scrollY < lastScroll) {
    iconDivs.reverse();
  }

  for (const iconDiv of iconDivs) {
    const boundingClientRect = iconDiv.getBoundingClientRect();
    if (boundingClientRect.bottom >= 0 && boundingClientRect.top <= window.innerHeight) {
      if (iconDiv.textContent === '') {
        // Render the item if it sticks on the screen for at least tenth of a second
        window.setTimeout(renderItem, 100, iconDiv.id);
      }
    } else {
      // Clear the element if rendered but not visible
      if (iconDiv.textContent !== '') {
        // Release the object URLs to avoid leaking their memory
        iconDiv.querySelectorAll('img').forEach(img => URL.revokeObjectURL(img.src));
        iconDiv.textContent = '';
      }
    }
  }

  // Mark the timeout as expired so another scroll stroke can initiate a render
  scrollTimeout = undefined;
  lastScroll = window.scrollY;
}

function handleWindowScroll() {
  if (!scrollTimeout) {
    scrollTimeout = window.setTimeout(windowList, 100);
    return;
  }

  // Ignore this scroll stroke if we are already set to render
}
