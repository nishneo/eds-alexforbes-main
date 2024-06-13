/* eslint-disable import/no-cycle */
import { getSiteConfig } from './scripts.js';

export function getEnvironment() {
  const origin = window.location.origin.toLowerCase();
  switch (true) {
    case origin.includes('localhost'):
      return 'local';
    case origin.includes('main'):
      return 'test';
    case origin.includes('tst.'):
      return 'test';
    default:
      return 'production';
  }
}

/**
 * Extracts various paths from a given currentPagePath URL string and stores them in a Map.
 * @param {string} currentPagePath - The URL string from which paths are to be extracted.
 * @returns {Map} - A Map containing the extracted paths with corresponding keys.
 */
// Disable eslint rule for this line
// eslint-disable-next-line import/prefer-default-export
export function getPaths() {
  let validPath = window.location.pathname;
  // condition for sidekick + path not have /za/en/invest
  if ((validPath === 'srcdoc') || (validPath.match(/\/(?!\/)/g) && (validPath.match(/\/(?!\/)/g)).length < 3)) {
    validPath = '/za/en/invest';
  }

  try {
    // Extract the path segments
    const pathSegments = validPath.split('/');
    // Initialize the map to store the paths
    const pathsMap = new Map();

    // Extract and store the region name and path
    pathsMap.set('regionName', pathSegments[1]);
    pathsMap.set('regionPath', `/${pathSegments[1]}`);

    // Extract and store the country name and path
    pathsMap.set('countryName', pathSegments[2]);
    pathsMap.set('countryPath', `/${pathSegments[1]}/${pathSegments[2]}`);

    // Extract and store the site name and path
    pathsMap.set('siteName', pathSegments[3] || 'invest');
    pathsMap.set('sitePath', pathSegments[3] ? `/${pathSegments[1]}/${pathSegments[2]}/${pathSegments[3]}` : `/${pathSegments[1]}/${pathSegments[2]}/invest`);

    // Extract env
    pathsMap.set('envName', getEnvironment());
    pathsMap.set('envURL', window.location.origin);

    return pathsMap;
  } catch (error) {
    // console.error('Invalid URL:', error);
    return null; // or handle the error as needed
  }
}

export async function getApiURL() {
  let apiUrl = '';
  const environment = getEnvironment();
  const siteConfig = await getSiteConfig('invest');
  const version = siteConfig.apiVersion;
  switch (environment) {
    case 'local':
      apiUrl = siteConfig.apiLocal;
      break;
    case 'test':
      apiUrl = `${siteConfig.apiTest}${version}/`;
      break;
    case 'production':
      apiUrl = `${siteConfig.apiProd}${version}/`;
      break;
    default:
      apiUrl = `${siteConfig.apiProd}${version}/`;
      break;
  }

  return apiUrl;
}

export async function getApiKey() {
  let apiKey = '';
  const environment = getEnvironment();
  const siteConfig = await getSiteConfig('invest');
  switch (environment) {
    case 'local':
      apiKey = siteConfig.apiKeyTest;
      break;
    case 'test':
      apiKey = siteConfig.apiKeyTest;
      break;
    case 'production':
      apiKey = siteConfig.apiKeyProd;
      break;
    default:
      apiKey = siteConfig.apiKeyProd;
      break;
  }

  return apiKey;
}

/**
* Add classes to elements.
* @param {String} tag Element tag
* @param {Array} classes classlist
*/
export function addClassToElement(element, ...classes) {
  classes.forEach((className) => {
    if (className) {
      element.classList.add(className);
    }
  });
}

/**
* create element with class.
* @param {String} tag Element tag
* @param {Array} classes classlist
*/
export function createElementWithClasses(tag, ...classes) {
  const element = document.createElement(tag);
  addClassToElement(element, ...classes);
  return element;
}
