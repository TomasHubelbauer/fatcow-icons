window.addEventListener('load', async () => {
  const response = await fetch('filename-list.txt');
  const text = await response.text();

  const resultsDiv = document.getElementById('resultsDiv');

  let fileNames = text.split('\n');

  // Remove the last element caused by the newline at the end of the file
  fileNames.pop();

  if (location.search) {
    const filter = new URLSearchParams(location.search).get('search');
    fileNames = fileNames.filter(fileName => fileName.includes(filter));

    document.getElementsByName('search')[0].value = filter;
    resultsDiv.textContent = `Found ${fileNames.length} icons matching "${filter}". Hover over the icons to load them.`;
  } else {
    resultsDiv.textContent = `There are ${fileNames.length} icons in the FatCow icon set v3.9.2. Hover over the icons to load them.`;
  }

  const iconsDiv = document.getElementById('iconsDiv');
  for (let fileName of fileNames) {
    const icon16Img = document.createElement('img');
    icon16Img.title = fileName + ' 16';
    icon16Img.className = 'icon16';
    icon16Img.dataset.src = '16-png/' + fileName + '.png';
    icon16Img.addEventListener('pointerover', handleIconHover);

    const icon32Img = document.createElement('img');
    icon32Img.title = fileName + ' 32';
    icon32Img.className = 'icon32';
    icon32Img.dataset.src = '32-png/' + fileName + '.png';
    icon32Img.addEventListener('pointerover', handleIconHover);

    const png16A = document.createElement('a');
    png16A.textContent = '16 PNG';
    png16A.href = '16-png/' + fileName + '.png';
    png16A.target = '_blank';
    png16A.download = '16-' + fileName + '.png';

    const png32A = document.createElement('a');
    png32A.textContent = '32 PNG';
    png32A.href = '32-png/' + fileName + '.png';
    png32A.target = '_blank';
    png32A.download = '32-' + fileName + '.png';

    const ico16A = document.createElement('a');
    ico16A.textContent = '16 ico';
    ico16A.href = '16-ico/' + fileName + '.ico';
    ico16A.target = '_blank';
    ico16A.download = '16-' + fileName + '.ico';

    const ico32A = document.createElement('a');
    ico32A.textContent = '32 ico';
    ico32A.href = '32-ico/' + fileName + '.ico';
    ico32A.target = '_blank';
    ico32A.download = '32-' + fileName + '.ico';

    iconsDiv.append(icon16Img, icon32Img, png16A, png32A, ico16A, ico32A, document.createTextNode(fileName), document.createElement('br'));
  }
});

function handleIconHover() {
  event.currentTarget.src = event.currentTarget.dataset.src;
}
