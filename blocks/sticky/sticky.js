/**
 * decorates the sticky, mainly the nav
 * @param {Element} block The sticky block element
 */
export default async function decorate(block) {
  const anchorLinks = block.querySelectorAll('.button-container > a');

  if (!anchorLinks.length) {
    // eslint-disable-next-line no-console
    console.error('Anchor links not found. Please author them!!');
    return;
  }

  anchorLinks.forEach((anchor) => {
    const anchorId = anchor.hash.split('#').pop();
    const element = document.querySelector(`#${anchorId}`);
    if (element) {
      element.style['scroll-margin-top'] = '250px';
    }
  });
}
