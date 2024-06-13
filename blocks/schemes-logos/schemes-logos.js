import { createOptimizedPicture } from '../../scripts/aem.js';
import { getPaths } from '../../scripts/utils.js';

async function getSchemesAndBrochures(responseFirst, responseSecond) {
  try {
    const [schemesRes, brochuresRes] = await Promise.all([responseFirst, responseSecond]);
    const schemes = await schemesRes.json();
    const brochures = await brochuresRes.json();

    return { schemes, brochures };
  } catch (error) {
    throw new Error('Error occurred during API call for either brochures or schemes', error);
  }
}

export default async function decorate(block) {
  const responseFirst = await fetch('/scheme-logos.json');
  const responseSecond = await fetch('/brochures.json');

  const { brochures, schemes } = await getSchemesAndBrochures(responseFirst, responseSecond);
  const url = new URL(window.location.href);
  /**
   * TODO: Modify to meet outvest requirements, currently
   * hardcoding invest to render the block.
   */
  let currentClient = getPaths().get('siteName');
  // Default for Sidekick library and index
  if (url.pathname === 'srcdoc' || url.pathname === '/') {
    currentClient = 'invest';
  }
  const schemesList = [];
  try {
    brochures.data.forEach((plan) => {
      if (!schemesList.includes(plan.Scheme)) {
        if (plan.Client.toLowerCase().includes(currentClient.toLowerCase())) {
          schemesList.push(plan.Scheme);
        }
      }
    });
  } catch (err) {
    throw new Error('There was a problem parsing brochures', err);
  }

  const ul = document.createElement('ul');
  schemesList.forEach((scheme) => {
    const [schemeData] = schemes.data.filter((e) => (
      e.Schemes.toLowerCase() === scheme.toLowerCase()
    ));
    const li = document.createElement('li');
    const img = document.createElement('img');
    const a = document.createElement('a');
    a.href = schemeData.URL;
    img.src = `/common/assets/images/${schemeData['Image Name']}`;
    img.alt = `${schemeData.Schemes} logo`;
    a.append(img);
    li.append(a);
    ul.append(li);
  });

  ul.querySelectorAll('img').forEach((img) => img.replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '120' }])));
  block.innerHTML = '';
  block.append(ul);
}
