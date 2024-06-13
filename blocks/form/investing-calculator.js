import {
  getFormInputs,
  errorResponseHandler,
} from './helper.js';
import { getApiURL } from '../../scripts/utils.js';

function investingPayload(payload) {
  const transformedObject = {
    GoalCategory: 5,
    GoalName: payload.goalName,
    IsTarget: false,
    _Subtype: 'NoTarget',
    _Type: 'JustSaving',
  };

  return transformedObject;
}

function investingSubmitError(form, error) {
  // eslint-disable-next-line no-console
  console.error(error);
  errorResponseHandler();
  form.querySelector('button[type="submit"]').disabled = false;
}

// Function to handle investing submission
export default async function investingCalcSubmission(form) {
  const apiBasePath = await getApiURL();
  const apiUrl = `${apiBasePath}BudgetTool/Savings/NoTarget`;
  const payload = getFormInputs([...form.elements]);
  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(investingPayload(payload)),
  };
  try {
    const response = await fetch(apiUrl, fetchOptions);
    if (response.ok) {
      // contactusResponse();
      const responseData = await response.json();
      window.location.href = responseData.Data.RedirectUrl;
    } else {
      const error = await response.text();
      throw new Error(error);
    }
  } catch (e) {
    investingSubmitError(form, e);
  } finally {
    form.setAttribute('data-submitting', 'false');
  }
}
