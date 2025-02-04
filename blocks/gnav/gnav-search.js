import { createOptimizedPicture, sampleRUM } from '../../scripts/aem.js';
import {
  fetchBlogArticleIndex, getArticleTaxonomy,
  createTag,
} from '../../scripts/scripts.js';

function decorateCard(hit) {
  const {
    title, description, image, tags,
  } = hit;

  const tax = getArticleTaxonomy(hit);
  let category = tax?.category;
  if (!category) {
    // eslint-disable-next-line prefer-destructuring
    category = JSON.parse(tags)[0];
  }
  const path = hit.path.split('.')[0];
  const picture = createOptimizedPicture(image, title, false, [{ width: '750' }]);
  const pictureTag = picture.outerHTML;
  const html = `
  <div class="article-card-image">${pictureTag}</div>
  <div class="article-card-body">
    <p class="article-card-category">${category}</p>
    <h3>${title}</h3>
    <p>${description}</p>
  </div>`;
  return createTag('a', { class: 'article-card', href: path }, html);
}

function highlightTextElements(terms, elements) {
  elements.forEach((e) => {
    const matches = [];
    const txt = e.textContent;
    terms.forEach((term) => {
      const offset = txt.toLowerCase().indexOf(term);
      if (offset >= 0) {
        matches.push({ offset, term });
      }
    });
    matches.sort((a, b) => a.offset - b.offset);
    let markedUp = '';
    if (!matches.length) markedUp = txt;
    else {
      markedUp = txt.substr(0, matches[0].offset);
      matches.forEach((hit, i) => {
        markedUp += `<mark class="gnav-search-highlight">${txt.substr(hit.offset, hit.term.length)}</mark>`;
        if (matches.length - 1 === i) {
          markedUp += txt.substr(hit.offset + hit.term.length);
        } else {
          markedUp += txt.substring(hit.offset + hit.term.length, matches[i + 1].offset);
        }
      });
      e.innerHTML = markedUp;
    }
  });
}

async function populateSearchResults(searchTerms, resultsContainer) {
  const limit = 12;
  const terms = searchTerms.toLowerCase().split(' ').map((e) => e.trim()).filter((e) => !!e);
  resultsContainer.innerHTML = '';

  if (terms.length) {
    await fetchBlogArticleIndex();
    const articles = window.blogIndex.data;

    const hits = [];
    let i = 0;
    for (; i < articles.length; i += 1) {
      const e = articles[i];
      const text = [e.category, e.title, e.teaser].join(' ').toLowerCase();

      if (terms.every((term) => text.includes(term))) {
        if (hits.length === limit) {
          break;
        }
        hits.push(e);
      }
    }
    hits.forEach((hit) => {
      const card = decorateCard(hit);
      resultsContainer.appendChild(card);
    });

    if (!hits.length) {
      resultsContainer.classList.add('no-Results');
    } else {
      resultsContainer.classList.remove('no-Results');
    }

    highlightTextElements(terms, resultsContainer.querySelectorAll('h3, .article-card-category, .article-card-body > p'));
  }
}

export default function onSearchInput(value, resultsContainer, advancedLink) {
  populateSearchResults(value, resultsContainer);
  sampleRUM('search', { source: '.gnav-search-input', target: value });
  if (advancedLink) {
    const href = new URL(advancedLink.href);
    href.searchParams.set('q', value);
    advancedLink.href = href.toString();
  }
}
