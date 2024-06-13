import {
  fetchPlaceholders, getMetadata, loadCSS,
} from '../../scripts/aem.js';
import { createElementWithClasses, getPaths } from '../../scripts/utils.js';
import { loadFragment } from '../fragment/fragment.js';
import { getRootPath } from '../../scripts/scripts.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 600px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-logo');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-logo'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-logo .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('role', 'button');
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('role');
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }
  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const pathsMap = getPaths();
  const sitePath = pathsMap.get('sitePath');
  const regionPath = pathsMap.get('regionPath');

  const firstNav = `${regionPath}/nav`;
  const secondNav = `${sitePath}/nav`;

  const fragmentFirstLevel = await loadFragment(firstNav);
  const fragmentSecondLevel = await loadFragment(secondNav);

  // decorate nav DOM
  const nav = createElementWithClasses('nav', 'position-fixed', 'sm-hidden', 'gnav', 'nav');
  nav.id = 'nav';
  while (fragmentFirstLevel && fragmentFirstLevel.firstElementChild) {
    nav.append(fragmentFirstLevel.firstElementChild);
  }

  while (fragmentSecondLevel.firstElementChild) nav.append(fragmentSecondLevel.firstElementChild);

  for (let i = 0; i < nav.children.length; i += 1) {
    const section = nav.children[i];
    if (section && section.dataset.styles) {
      section.classList.add(`nav-${section.dataset.styles}`);
    }
  }

  // Create a new div with class 'second-level'
  const secondLevelDiv = createElementWithClasses('div');
  secondLevelDiv.classList.add('second-level');
  // Create a container div inside 'secondLevel' div
  const containerDiv = createElementWithClasses('div', 'second-level-container');
  secondLevelDiv.appendChild(containerDiv);

  // Append the desired sections to the 'secondLevel' div
  const logoSection = nav.querySelector('.nav-logo');
  const menuItemSection = nav.querySelector('.nav-menu-item');
  const buttonsSection = nav.querySelector('.nav-buttons');

  if (menuItemSection) {
    containerDiv.appendChild(menuItemSection);
    const firstUL = menuItemSection?.querySelector('ul');
    firstUL?.classList.add('first-ul');

    // Add class "second-ul" to second level <ul> elements
    const secondULs = firstUL.querySelectorAll('.first-ul > li > ul');
    secondULs.forEach((secondUL) => {
      secondUL.classList.add('second-ul');

      const parentLI = secondUL.parentElement;
      parentLI.addEventListener('click', (event) => {
        if (event.target === parentLI) {
          secondUL.classList.toggle('active');
        }
      });

      // Add class "third-ul" to third level <ul> elements
      const thirdULs = secondUL.querySelectorAll('li > ul');
      thirdULs.forEach((thirdUL) => {
        thirdUL.classList.add('third-ul');
        const parentLIThird = thirdUL.parentElement;
        parentLIThird.addEventListener('click', (event) => {
          if (event.target === parentLIThird) {
            thirdUL.classList.toggle('active');
          }
        });
      });
    });
  }
  if (buttonsSection) {
    containerDiv.appendChild(buttonsSection);
    const firstUL = buttonsSection?.querySelector('ul');
    firstUL?.classList.add('first-ul-login-dropdown');
    const greeting = buttonsSection?.querySelector('.first-ul-login-dropdown > li');
    greeting.classList.add('greeting-button');
    // Add class "second-ul" to second level <ul> elements
    const secondULs = firstUL.querySelectorAll('.first-ul-login-dropdown > li > ul');
    secondULs.forEach((secondUL) => {
      secondUL.classList.add('second-ul-login-dropdown');
      const parentLI = secondUL.parentElement;
      parentLI.addEventListener('click', (event) => {
        if (event.target === parentLI) {
          secondUL.classList.toggle('active');
        }
      });
    });
    const loginButton = buttonsSection.querySelectorAll('.nav-buttons li')[3];
    if (loginButton) {
      loginButton?.classList.add('login-button');
      loginButton.querySelectorAll('a')[0].classList.add('secondary', 'button');
      buttonsSection.querySelectorAll('.nav-buttons li:nth-child(3) a')[0].classList.add('button');
    }
  }
  const firstLevelContainer = nav.querySelector('.nav-first-level');
  if (firstLevelContainer) {
    firstLevelContainer.insertAdjacentElement('afterend', secondLevelDiv);
  }

  const navFirstLevel = nav.querySelector('.nav-first-level');
  const firstLevelLink = navFirstLevel.querySelector('.button');
  if (firstLevelLink) {
    firstLevelLink.className = '';
    firstLevelLink.closest('.button-container').className = '';
  }

  function getDirectTextContent(menuItem) {
    const menuLink = menuItem.querySelector(':scope > a');
    if (menuLink) {
      return menuLink.textContent.trim();
    }
    return Array.from(menuItem.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent)
      .join(' ');
  }

  async function buildBreadcrumbsFromNavTree(navigation, currentUrl) {
    const crumbs = [];
    const homeUrl = document.querySelector('.nav-first-level a').href;
    let menuItem = Array.from(navigation.querySelectorAll('a')).find((a) => a.href === currentUrl);
    if (menuItem) {
      do {
        const link = menuItem.querySelector(':scope > a');
        crumbs.unshift({ title: getDirectTextContent(menuItem), url: link ? link.href : null });
        menuItem = menuItem.closest('ul')?.closest('li');
      } while (menuItem);
    } else if (currentUrl !== homeUrl) {
      crumbs.unshift({ title: getMetadata('og:title'), url: currentUrl });
    }

    const placeholders = await fetchPlaceholders();
    const homePlaceholder = placeholders.breadcrumbsHomeLabel || 'Home';

    crumbs.unshift({ title: homePlaceholder, url: homeUrl });

    // last link is current page and should not be linked
    if (crumbs.length > 1) {
      crumbs[crumbs.length - 1].url = null;
    }
    crumbs[crumbs.length - 1]['aria-current'] = 'page';
    return crumbs;
  }

  async function buildBreadcrumbs() {
    const breadcrumbs = createElementWithClasses('nav');
    breadcrumbs.className = 'breadcrumbs';

    const crumbs = await buildBreadcrumbsFromNavTree(document.querySelector('.nav-logo'), document.location.href);

    const ol = createElementWithClasses('ol');
    ol.append(...crumbs.map((item) => {
      const li = createElementWithClasses('li');
      if (item['aria-current']) {
        li.classList.add('active');
        li.setAttribute('aria-current', item['aria-current']);
      }
      if (item.url) {
        const a = createElementWithClasses('a');
        a.href = item.url;
        a.textContent = item.title;
        li.append(a);
      } else {
        li.textContent = item.title;
      }
      return li;
    }));

    breadcrumbs.append(ol);
    return breadcrumbs;
  }

  const navSections = nav.querySelector('.nav-logo');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  function parseJwt(token, key) {
    const jsonArray = JSON.parse(atob(token.split('.')[1]));
    const value = jsonArray[key];
    return value;
  }

  function hideByClassName(className) {
    document.getElementsByClassName(className)[0].style.display = 'none';
  }

  function showByClassName(className, displayType) {
    document.getElementsByClassName(className)[0].style.display = displayType || 'block';
  }

  function setInnerHTML(className, text) {
    document.getElementsByClassName(className)[0].innerHTML += text;
  }

  function showLoggedInUser(greetingText) {
    setInnerHTML('greeting-button', greetingText);
    hideByClassName('login-button');
    showByClassName('greeting-button', 'flex');
  }

  function showLogInButton(loginText) {
    setInnerHTML('greeting-button', loginText);
    showByClassName('login-button', 'flex');
    hideByClassName('greeting-button');
  }

  // hamburger for mobile
  const hamburger = createElementWithClasses('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon">&#9776;</span></button>`;
  const hamburgerButton = hamburger.querySelector('button');

  hamburgerButton.addEventListener('click', () => {
    nav.classList.toggle('sm-hidden');
  });

  // Close menu when clicked outside
  document.addEventListener('click', (event) => {
    const isClickedOutside = !nav.contains(event.target) && !hamburgerButton.contains(event.target);
    if (isClickedOutside) {
      nav.classList.add('sm-hidden');
    }
  });

  nav.setAttribute('aria-expanded', 'false');

  const navWrapper = createElementWithClasses('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.prepend(hamburger);
  navWrapper.append(nav);
  block.append(navWrapper);

  // Getting breadcrumb
  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    navWrapper.append(await buildBreadcrumbs());
  }

  function login() {
    const loginText = document.querySelector('.login-button a')?.innerHTML;
    if (!loginText) return;
    if (sessionStorage.getItem('access_token')) {
      const nickname = parseJwt(sessionStorage.getItem('access_token'), 'nickname');
      let tokenExpiryTime = parseJwt(sessionStorage.getItem('access_token'), 'exp');
      tokenExpiryTime *= 1000; // converted seconds into milliseconds
      const currentTime = Date.now();
      if (currentTime < tokenExpiryTime) { // token is valid, User is logged in
        showLoggedInUser(nickname);
        setTimeout(login, tokenExpiryTime - currentTime);// check after 30 minutes if token expired
      } else { // token has been expired
        showLogInButton(loginText);
      }
    } else { // no login  token
      showLogInButton(loginText);
    }
  }
  login();
  // Search block used to initialize search for now.
  function isSearchBlockPresent() {
    return block.querySelector('.search') || false;
  }

  if (isSearchBlockPresent()) {
    const gnavPath = getMetadata('gnav') || `${getRootPath()}/gnav`;
    block.setAttribute('data-gnav-source', gnavPath);
    await loadCSS(`${window.hlx.codeBasePath}/blocks/gnav/gnav.css`);
    const gnav = await import('../gnav/gnav.js');
    gnav.default(block);
  }

  const observer = new ResizeObserver((entries) => {
    if (entries[0].target.offsetWidth < 600) {
      const logos = navSections.querySelectorAll('picture');
      if (logos.length > 1) {
        hamburger.append(navSections);
        logos[0].style.display = 'none';
        logos[1].style.display = 'flex';
        logos[1].querySelector('img').classList.add('mobile-logo');
      }
    } else {
      const logos = logoSection.querySelectorAll('picture');
      if (logos.length > 1) {
        logos[1].style.display = 'none';
        logos[0].style.display = 'block';
      }
      containerDiv.prepend(logoSection);
    }
  });

  observer.observe(document.querySelector('header'));

  block.parentElement.classList.add('appear');
}
