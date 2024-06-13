export default function decorate(block) {
  [...block.children].forEach((item) => {
    const links = item.querySelectorAll('a');
    if (links.length) {
      links.forEach((link) => {
        if (link && link.hasAttribute('title')) {
          link.removeAttribute('title');
        }
      });
    }
  });
}
