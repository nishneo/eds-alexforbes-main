import {
  LEAD_SUCCESS_MESSAGE,
  getFormInputs,
  errorResponseHandler,
  getGoogleClientId,
} from './helper.js';
import { getApiKey, getApiURL } from '../../scripts/utils.js';

function ifaLeadPayload(payload) {
  const transformedObject = {
    LeadType: 'NewAgencyLead',
    Source: 'Web',
    GoogleClientId: getGoogleClientId(),
    FormResponseId: null,
    ContactName: payload.name,
    BusinessName: payload.businessName,
    ContactPhoneNo: payload.phone,
    ContactEmail: payload.email,
  };

  return transformedObject;
}

function ifaLeadResponse(form) {
  const divElement = document.createElement('div');
  divElement.classList.add('field-wrapper', 'message-wrapper');
  const paragraph = document.createElement('p');
  paragraph.classList.add('success');
  paragraph.textContent = LEAD_SUCCESS_MESSAGE;
  divElement.appendChild(paragraph);
  form.insertBefore(divElement, form.firstChild);
}

function ifaLeadSubmitError(form, error) {
  // eslint-disable-next-line no-console
  console.error(error);
  errorResponseHandler();
  form.querySelector('button[type="submit"]').disabled = false;
}

// Function to handle contact us submission
export default async function ifaLeadSubmission(form) {
  const apiBasePath = await getApiURL();
  const apiKey = await getApiKey();
  const apiUrl = `${apiBasePath}Lead/NewAgency`;
  const payload = getFormInputs([...form.elements]);
  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify(ifaLeadPayload(payload)),
  };
  try {
    const response = await fetch(apiUrl, fetchOptions);
    if (response.ok) {
      ifaLeadResponse(form);
    } else {
      const error = await response.text();
      throw new Error(error);
    }
  } catch (e) {
    ifaLeadSubmitError(form, e);
  } finally {
    form.setAttribute('data-submitting', 'false');
  }
}
