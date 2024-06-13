import { readBlockConfig } from '../../scripts/aem.js';
import { createElemWithClass } from '../../scripts/scripts.js';
import { getPaths } from '../../scripts/utils.js';

function updateAriaLabelForSocialIcons(element) {
  element.querySelectorAll('ul li').forEach((li) => {
    const iconLabel = li.querySelector('a span').classList[1].split('icon-').pop();
    li.querySelector('a').setAttribute('aria-label', iconLabel);
  });
}

function updateAriaLabelFromInnerText(element) {
  element.querySelectorAll('a').forEach((link, index) => {
    if (link.innerText.trim() === '') {
      link.setAttribute('aria-label', `generic link ${index}`);
    } else {
      link.setAttribute('aria-label', link.innerText);
    }
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';
  const pathsMap = getPaths();
  const footerPathVal = `${pathsMap.get('sitePath')}/footer`;
  // window.hlx.codeBasePath + concatinate from query string
  const footerPath = cfg.footer || footerPathVal;
  const resp = await fetch(`${footerPath}.plain.html`);
  const html = await resp.text();
  const footer = document.createElement('div');
  footer.innerHTML = html;

  const footerDown = createElemWithClass('div', 'footer-bottom');
  footerDown.append(footer.children[footer.children.length - 1]);
  updateAriaLabelForSocialIcons(footerDown);
  footer.removeChild(footer.lastChild);

  const footerTop = createElemWithClass('div', 'footer-top');
  footerTop.append(...footer.children);
  updateAriaLabelFromInnerText(footerTop);

  footer.innerHTML = '';
  footer.append(footerTop);
  footer.append(footerDown);

  block.append(footer);
}
