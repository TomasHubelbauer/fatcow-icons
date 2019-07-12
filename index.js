window.addEventListener('load', async () => {
  const response = await fetch('filename-list.txt');
  const text = await response.text();

  const resultsDiv = document.getElementById('resultsDiv');

  let fileNames = text.split('\n');

  // Remove the last element caused by the newline at the end of the file
  // Do this at runtime because it's too easy to not notice an IDE added it
  if (fileNames[fileNames.length - 1] === '') {
    fileNames.pop();
  }

  if (location.search) {
    const filter = new URLSearchParams(location.search).get('search').trim();
    fileNames = fileNames.filter(fileName => fileName.toUpperCase().includes(filter.toUpperCase()));

    document.getElementsByName('search')[0].value = filter;
    resultsDiv.textContent = `Showing ${fileNames.length} matching icons`;
  } else {
    resultsDiv.textContent = `Showing all ${fileNames.length} icons`;
  }

  renderList(fileNames);
  windowList();
  window.addEventListener('scroll', handleWindowScroll, { passive: true /* We do not need `preventDefault` */ });

  // Handle `resize` for debugging responsive layout, no harm done leaving this in
  window.addEventListener('resize', handleWindowScroll, { passive: true /* We do not need `preventDefault` */ });
});

function renderList(fileNames) {
  const iconsDiv = document.getElementById('iconsDiv');
  iconsDiv.innerHTML = '';

  const fragment = document.createDocumentFragment();

  for (let fileName of fileNames) {
    const iconDiv = document.createElement('div');
    iconDiv.className = 'iconDiv';
    iconDiv.id = fileName;
    fragment.append(iconDiv);
  }

  iconsDiv.append(fragment);
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
  icon16Img.src = '16-png/' + fileName + '.png';

  const icon32Img = document.createElement('img');
  icon32Img.title = fileName + ' 32';
  icon32Img.className = 'icon32';
  icon32Img.src = '32-png/' + fileName + '.png';

  const nameSpan = document.createElement('span');
  nameSpan.textContent = fileName.replace(/_/g, ' ');

  const png16A = document.createElement('a');
  png16A.textContent = '16\npng';
  png16A.href = '16-png/' + fileName + '.png';
  png16A.target = '_blank';
  png16A.download = '16-' + fileName + '.png';

  const png32A = document.createElement('a');
  png32A.textContent = '32\npng';
  png32A.href = '32-png/' + fileName + '.png';
  png32A.target = '_blank';
  png32A.download = '32-' + fileName + '.png';

  const ico16A = document.createElement('a');
  ico16A.textContent = '16\nico';
  ico16A.href = '16-ico/' + fileName + '.ico';
  ico16A.target = '_blank';
  ico16A.download = '16-' + fileName + '.ico';

  const ico32A = document.createElement('a');
  ico32A.textContent = '32\nico';
  ico32A.href = '32-ico/' + fileName + '.ico';
  ico32A.target = '_blank';
  ico32A.download = '32-' + fileName + '.ico';

  iconDiv.append(icon16Img, icon32Img, nameSpan, png16A, png32A, ico16A, ico32A);
}

let scrollTimeout;

function windowList() {
  for (const iconDiv of document.getElementsByClassName('iconDiv')) {
    const boundingClientRect = iconDiv.getBoundingClientRect();
    if (boundingClientRect.bottom >= 0 && boundingClientRect.top <= window.innerHeight) {
      if (iconDiv.textContent === '') {
        // Render the item if it sticks on the screen for at least tenth of a second
        window.setTimeout(renderItem, 100, iconDiv.id);
      }
    } else {
      if (iconDiv.textContent !== '') {
        // Clear the element if rendered but not visible
        iconDiv.textContent = '';
      }
    }
  }

  // Mark the timeout as expired so another scroll stroke can initiate a render
  scrollTimeout = undefined;
}

function handleWindowScroll() {
  if (!scrollTimeout) {
    scrollTimeout = window.setTimeout(windowList, 100);
    return;
  }

  // Ignore this scroll stroke if we are already set to render
}
