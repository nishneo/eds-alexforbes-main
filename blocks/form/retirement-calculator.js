import {
  getFormInputs,
  errorResponseHandler,
  getGoogleClientId,
} from './helper.js';
import { getApiURL, getApiKey } from '../../scripts/utils.js';

function retirementPayload(payload) {
  const transformedObject = {
    Age: `${payload.age}`,
    EacFees: payload.eacProvideValue ? `${payload.eacProvideValue}` : '3.0',
    GoogleClientId: getGoogleClientId(),
    LumpSum: `${payload.lumpSum}`,
    Monthly: `${payload.monthly}`,
    RetirementAge: `${payload.retirementAge}`,
    Transfer: `${payload.transfer}`,
    _Subtype: 'Form',
    _Type: 'RaFeesOutcome',
  };

  return transformedObject;
}

function retirementResponse(form, result) {
  const txtInfo = form.querySelector('#txtInfo');
  const txtOnefee = form.querySelector('#txtOnefee');
  const resultPercent = form.querySelector('#resultPercent');
  const resultAmount = form.querySelector('#resultAmount');

  txtInfo.innerHTML = `Paying ${result.SavedPercentageFormatted} less in fees means you could retire with up to ${result.PercentageMoreAtRetirement}% more if you switch to our innovative ONEfee.`;
  txtOnefee.innerHTML = `${result.EacFeeFormatted}`;
  resultPercent.innerHTML = `<h3>${result.SavedPercentageFormatted}</h3> less in fees`;
  resultAmount.innerHTML = `${result.SavedAmountFormatted}`;
}

function retirementSubmitError(form, error = {}) {
  // eslint-disable-next-line no-console
  console.error(error);
  errorResponseHandler();
  form.querySelector('button[type="submit"]').disabled = false;
}

// Function to handle contact us submission
export default async function retirementSubmission(form) {
  const apiBasePath = await getApiURL();
  const apiUrl = `${apiBasePath}Calcs/Setup/RetirementFees`;
  const apiKey = await getApiKey();
  const payload = getFormInputs([...form.elements]);
  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify(retirementPayload(payload)),
  };
  try {
    const response = await fetch(apiUrl, fetchOptions);
    if (response.ok) {
      const result = await response.json();
      if (result && result.Success && result.Success === true) {
        retirementResponse(form, result.Data);
      } else {
        retirementSubmitError(form);
      }
      form.querySelector('button[type="submit"]').disabled = false;
    } else {
      const error = await response.text();
      throw new Error(error);
    }
  } catch (e) {
    retirementSubmitError(form, e);
  } finally {
    form.setAttribute('data-submitting', 'false');
  }
}
