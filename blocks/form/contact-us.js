import {
  CONTACTUS_SUCCESS_MESSAGE,
  getFormInputs,
  errorResponseHandler,
} from './helper.js';
import { getApiURL } from '../../scripts/utils.js';

function contactusPayload(payload) {
  const transformedObject = {
    Context: 'Contact Us',
    From: payload.email,
    FromName: `${payload.firstName} ${payload.lastName}`,
    MessageHtml: `Name: ${payload.firstName}<br/>Surname: ${payload.lastName}<br/>Email: ${payload.email}<br/>Contact Number: ${payload.phone}<br/><br/>Message from Client: <br/><br/>${payload.enquiry}<br/><br/>`,
    ReplyTo: payload.email,
    Subject: `Contact us: ${payload.firstName} ${payload.lastName}`,
  };

  return transformedObject;
}

function contactusResponse(form) {
  const divElement = document.createElement('div');
  divElement.classList.add('field-wrapper', 'message-wrapper');
  const paragraph = document.createElement('p');
  paragraph.classList.add('success');
  paragraph.textContent = CONTACTUS_SUCCESS_MESSAGE;
  divElement.appendChild(paragraph);
  form.insertBefore(divElement, form.firstChild);
}

function contactUsSubmitError(form, error) {
  // eslint-disable-next-line no-console
  console.error(error);
  errorResponseHandler();
  form.querySelector('button[type="submit"]').disabled = false;
}

// Function to handle contact us submission
export default async function contactUsSubmission(form) {
  const apiBasePath = await getApiURL();
  const apiUrl = `${apiBasePath}Comms/ContactUs/SendEmail`;
  const payload = getFormInputs([...form.elements]);
  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contactusPayload(payload)),
  };
  try {
    const response = await fetch(apiUrl, fetchOptions);
    if (response.ok) {
      contactusResponse(form);
    } else {
      const error = await response.text();
      throw new Error(error);
    }
  } catch (e) {
    contactUsSubmitError(form, e);
  } finally {
    form.setAttribute('data-submitting', 'false');
  }
}
