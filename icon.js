import parseEntries from './parseEntries.js';
import extractIcon from './extractIcon.js';

const statusP = document.getElementById('statusP');
const icons = await parseEntries(message => statusP.textContent = message);
const name = location.hash.slice('#'.length);
document.getElementById('icon32Img').src = await extractIcon(icons, name, '32');
document.getElementById('icon16Img').src = await extractIcon(icons, name, '16');
statusP.remove();
