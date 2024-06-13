import { getApiURL } from '../../scripts/utils.js';

export const CONTACTUS_SUCCESS_MESSAGE = 'Thank you for sending us an email. We will get in contact with you as soon as possible.';
export const ERROR_MESSAGE = 'Something went wrong! Please try again later.';
export const LEAD_SUCCESS_MESSAGE = 'Thank you for providing your details, we will be in contact you.';

function formatDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

export function calculateFutureDate() {
  const currentDate = formatDate();
  const [year, month] = currentDate.split('-').map(Number);
  const futureDate = new Date(year, month - 1 + 6, 2);
  const formattedFutureDate = futureDate.toISOString().slice(0, 10);
  return formattedFutureDate;
}

export function getMonthDifference(date1, date2) {
  const date1Obj = new Date(date1);
  const date2Obj = new Date(date2);

  const utcDate1 = new Date(
    Date.UTC(date1Obj.getFullYear(), date1Obj.getMonth(), date1Obj.getDate()),
  );
  const utcDate2 = new Date(
    Date.UTC(date2Obj.getFullYear(), date2Obj.getMonth(), date2Obj.getDate()),
  );

  let monthsDifference = (utcDate2.getFullYear() - utcDate1.getFullYear()) * 12
    + (utcDate2.getMonth() - utcDate1.getMonth()) - 1;

  if (utcDate2 < utcDate1) {
    monthsDifference *= -1;
  }

  return monthsDifference;
}

export function getMonthName(date) {
  const monthNames = [
    'January', 'February', 'March',
    'April', 'May', 'June', 'July',
    'August', 'September', 'October',
    'November', 'December',
  ];

  const monthIndex = date.getMonth();
  return monthNames[monthIndex];
}

export function getFormInputs(form) {
  const inputs = {};

  form.forEach((field) => {
    if (field.name && field.type !== 'submit' && !field.disabled) {
      if (field.type === 'radio') {
        if (field.checked) inputs[field.name] = field.value;
      } else if (field.type === 'checkbox') {
        if (field.checked) inputs[field.name] = inputs[field.name] ? `${inputs[field.name]},${field.value}` : field.value;
      } else if (field.type === 'number') {
        inputs[field.name] = parseInt(field.value, 10);
      } else {
        inputs[field.name] = field.value;
      }
    }
  });

  return inputs;
}

export function errorResponseHandler() {
  const fieldWrapper = document.querySelector('.form.block');
  const existingMesageContainer = document.querySelector('.field-wrapper.message-wrapper');

  if (existingMesageContainer) {
    existingMesageContainer.remove();
  }

  const divElement = document.createElement('div');
  divElement.classList.add('field-wrapper', 'message-wrapper');
  const paragraph = document.createElement('p');
  paragraph.classList.add('error');
  paragraph.textContent = ERROR_MESSAGE;

  divElement.appendChild(paragraph);
  fieldWrapper.insertBefore(divElement, fieldWrapper.firstChild);

  const submit = document.querySelector('button[type="submit"]');
  if (submit) submit.disabled = false;
}

async function targetAPICall(e, payload) {
  e.preventDefault();
  const apiBasePath = await getApiURL();
  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  fetchOptions.body = JSON.stringify(payload);
  const targetAPI = `${apiBasePath}BudgetTool/Savings/Target`;
  const response = await fetch(targetAPI, fetchOptions);
  if (response.ok) {
    const responseData = await response.json();
    window.location.href = responseData.Data.RedirectUrl;
  } else {
    const error = await response.text();
    throw new Error(error);
  }
}

export function renderProposalBlock(apiResponse, formType, payload) {
  const containerElement = document.querySelector('.form-container .section-container'); // Change 'container' to the actual ID of the container element
  const existingContainer = document.querySelector('.section.box-container');
  let htmlCode = '<div class="section box-container" data-section-status="loaded"><div class="section-container"><div class="box-wrapper"><div class="box block" data-block-name="box" data-block-status="loaded"><div><div><h2 id="primary-care">You will need R {{amount}} by {{date}}.</h2><p>We calculated this amount by adding together all of the items in your {{formType}} budget and increasing it by inflation.</p><p>The amount shown here is an estimate and for guidance only. We cannot guarantee this will be sufficient for your needs. We estimated inflation at {{inflationRate}}% per year.</p><p class="button-container">{{resetBtn}}<a class="start-quote button" href="{{continueLink}}" title="Continue" class="button">Continue</a></p></div></div></div></div></div>';
  let resetBtn = '';
  if (formType === 'emergency') {
    htmlCode = '<div class="section box-container" data-section-status="loaded"><div class="section-container"><div class="box-wrapper"><div class="box block" data-block-name="box" data-block-status="loaded"><div><div><h2 id="primary-care">You will need R {{amount}} by {{date}}.</h2><p>We believe that having 3 months\' income in an emergency fund and increasing it by inflation is a great idea. We will help you save towards this over the next 3 years.</p><p>The amount shown here is an estimate and for guidance only. We cannot guarantee this will be sufficient for your needs. We estimated inflation at {{inflationRate}}% per year.</p><p class="button-container"><a class="start-quote button" href="{{continueLink}}" title="Continue" class="button">Continue</a></p></div></div></div></div></div>';
  }
  if (formType === 'wedding' || formType === 'education') {
    resetBtn = '<a class="reset-quote button secondary" href="#" title="Reset" class="button">Reset</a>&nbsp;&nbsp;';
  }

  htmlCode = htmlCode.replace('{{amount}}', apiResponse.amount);
  htmlCode = htmlCode.replace('{{date}}', apiResponse.date);
  htmlCode = htmlCode.replace('{{inflationRate}}', apiResponse.inflationRate);
  htmlCode = htmlCode.replace('{{continueLink}}', apiResponse.continueLink);
  htmlCode = htmlCode.replace('{{formType}}', formType);
  htmlCode = htmlCode.replace('{{resetBtn}}', resetBtn);

  // proposal block exist then remove proposal block
  if (existingContainer) {
    existingContainer.remove();
  }

  // render proposal block
  containerElement.insertAdjacentHTML('afterend', htmlCode);
  const startQuoteAnchor = document.querySelector('a.start-quote');

  if (startQuoteAnchor) {
    startQuoteAnchor.addEventListener('click', (e) => targetAPICall(e, payload));
  }
}

export function getGoogleClientId() {
  const cookies = document.cookie.split(';');
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith('_ga=')) {
      const value = cookie.substring(4);
      const clientId = value.split('.').slice(2).join('.');
      return clientId;
    }
  }

  return null;
}
