import { createOptimizedPicture } from '../../scripts/aem.js';

function handleClose(block) {
  const closeBtn = block.querySelectorAll('.icon-close');
  closeBtn[0]?.addEventListener('click', () => {
    block.style.display = 'none';
  });
}

function decorateCardNotification(block) {
  const closeIcon = '<span class="icon icon-close" title="close"><img data-icon-name="close" src="/icons/close.svg" alt="" loading="lazy"></span>';
  const isNotification = block.classList.contains('notification');

  if (isNotification) {
    const cardBody = block.querySelectorAll('.cards-card-body');
    cardBody[0].innerHTML += closeIcon;
    handleClose(block);
  }
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1) {
        div.className = div.querySelector('picture') ? 'cards-card-image' : 'cards-card-icon';
      } else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => img.closest('picture')?.replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);

  decorateCardNotification(block);
}
