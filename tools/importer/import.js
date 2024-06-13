/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global WebImporter */
/* eslint-disable no-console, class-methods-use-this */
const createCardNotificationBlock = (document, container) => {
  const articleHeading = container.querySelector('.notification-body .heading').innerText;
  const articleImg = container.querySelector('.notification-body img');

  const img = document.createElement('img');
  img.src = articleImg.src;
  img.alt = articleImg.alt;

  const h4 = document.createElement('h4');
  h4.innerText = articleHeading;

  const articleDesc = container.querySelector('.notification-body .content>p:last-child');
  WebImporter.DOMUtils.removeSpans(container);
  const tab = WebImporter.DOMUtils.createTable([['cards (notification)'], [[h4, img, articleDesc]]], document);

  container.parentElement.prepend(tab);
  return tab;
};

export default {
  transformDOM: ({ document }) => {
    const main = document.querySelector('body');
    const notificationContainer = document.querySelector('.notification-container');
    if (notificationContainer) {
      createCardNotificationBlock(document, notificationContainer);
    }

    // final cleanup
    WebImporter.DOMUtils.remove(main, [
      'header',
      '.header',
      'nav',
      '.nav',
      'footer',
      '.footer',
      'iframe',
      'noscript',
      '.cookie-policy',
      '.notification-container',
    ]);

    return main;
  },
};
