import parseEntries from './parseEntries.js';
import extractIcon from './extractIcon.js';

let icons;

const iconsDiv = document.getElementById('iconsDiv');
icons = await parseEntries(message => iconsDiv.textContent = message);

if (location.search) {
  document.getElementsByName('search')[0].value = location.search.slice('?'.length);
}

document.getElementsByName('search')[0].addEventListener('input', event => {
  history.replaceState(null, null, '?' + event.currentTarget.value);
  renderList();
  windowList();
});

let scrollTimeout;
let lastScroll;

renderList();
windowList();
window.addEventListener('scroll', handleWindowScroll, { passive: true /* We do not need `preventDefault` */ });

// Handle `resize` for debugging responsive layout, no harm done leaving this in
window.addEventListener('resize', handleWindowScroll, { passive: true /* We do not need `preventDefault` */ });

function renderList() {
  let filteredIcons = icons;
  if (location.search) {
    filteredIcons = {};
    const filter = location.search.slice('?'.length);
    const keys = Object.keys(icons).filter(icon => icon.toUpperCase().includes(filter.toUpperCase()));
    for (const key of keys) {
      filteredIcons[key] = icons[key];
    }

    resultsDiv.textContent = `Showing ${Object.keys(filteredIcons).length} matching icons`;
  }
  else {
    resultsDiv.textContent = `Showing all ${Object.keys(icons).length} icons`;
  }

  const iconsDiv = document.getElementById('iconsDiv');
  iconsDiv.innerHTML = '';

  const fragment = document.createDocumentFragment();

  for (let key of Object.keys(filteredIcons)) {
    const iconDiv = document.createElement('div');
    iconDiv.className = 'iconDiv';
    iconDiv.id = key;
    fragment.append(iconDiv);
  }

  iconsDiv.append(fragment);
}

async function handleDownloadButtonClick(event) {
  const name = event.currentTarget.dataset.name;
  const type = event.currentTarget.dataset.type;
  const dimension = event.currentTarget.dataset.dimension;

  if (type === 'ico') {
    alert('Sorry, ICO downloads are not available at the moment. Contact me at tomas@hubelbauer.net');
    return;
  }

  const url = await extractIcon(icons, name, dimension);
  const downloadA = document.getElementById('downloadA');
  downloadA.href = url;
  downloadA.target = '_blank';
  downloadA.download = `${name}-${dimension}.${type}`;
  downloadA.click();
}

function renderItem(fileName) {
  const iconDiv = document.getElementById(fileName);

  // Ignore if this is being called while the list is being rebuilt (`innerHTML = ''`)
  if (iconDiv === null) {
    return;
  }

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
  extractIcon(icons, fileName, '16')
    .then(url => icon16Img.src = url)
    .catch(console.log)
    ;

  const icon32Img = document.createElement('img');
  icon32Img.title = fileName + ' 32';
  icon32Img.className = 'icon32';
  extractIcon(icons, fileName, '32')
    .then(url => icon32Img.src = url)
    .catch(console.log)
    ;

  const nameA = document.createElement('a');
  nameA.textContent = fileName.replace(/_/g, ' ');
  nameA.href = `icon.html#${fileName}`;
  nameA.target = '_blank';

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

  iconDiv.append(icon16Img, icon32Img, nameA, png16Button, png32Button, ico16Button, ico32Button);
}

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
