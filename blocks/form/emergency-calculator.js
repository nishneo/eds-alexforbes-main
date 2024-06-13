import { getApiURL } from '../../scripts/utils.js';
import {
  getMonthName,
  getFormInputs,
  errorResponseHandler,
  renderProposalBlock,
} from './helper.js';

function emergencyCalcAPIData(form) {
  const income = parseInt(form.querySelector('#income').value, 10);
  const startingDeposit = parseInt(form.querySelector('#startingDeposit').value, 10);

  return { startingDeposit, income };
}

function emergencyCalcPayload(form) {
  const formInputs = form.querySelectorAll(['form input']);
  const payload = getFormInputs(formInputs);

  const requestData = {
    AdjustedTargetAmount: parseInt(payload.AdjustedTargetAmount, 10),
    GoalCategory: 1,
    GoalName: payload.goalName,
    Income: parseInt(payload.income, 10),
    InflationPercent: (parseInt(payload.InflationPercent, 10) * 100),
    IsTarget: true,
    NoOfPayments: 1,
    StartingDeposit: parseInt(payload.startingDeposit, 10),
    TargetAmount: (parseInt(payload.income, 10) * 3),
    TimeHorizonMonths: 36,
    UseInflatedAmount: true,
    _Type: 'EmergencyFund',
    _Subtype: 'Form',
  };

  return requestData;
}

async function emergencyCalcGetAPICall(form) {
  const apiBasePath = await getApiURL();
  const { startingDeposit, income } = emergencyCalcAPIData(form);
  const apiUrl = `${apiBasePath}Calcs/InflatedAmount/${income}/${startingDeposit}/0/1/1/1?_=${Date.now()}`;
  try {
    const response = await fetch(apiUrl);
    if (response.ok) {
      const responseData = await response.json();
      // eslint-disable-next-line
      emergencyCalcProposal(responseData, form);
    } else {
      const error = await response.text();
      errorResponseHandler();
      throw new Error(error);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    errorResponseHandler();
  } finally {
    // form.setAttribute('data-submitting', 'false');
  }
}

function emergencyCalcProposal(responseData, form) {
  if (responseData && responseData.Success) {
    const adjustedTargetAmount = form.querySelector('#AdjustedTargetAmount');
    const inflationPercent = form.querySelector('#InflationPercent');
    const startDateObj = new Date();
    const dateValue = `${getMonthName(startDateObj)} ${startDateObj.getFullYear() + 3}`;
    const apiResponse = {
      amount: responseData.Data.InflatedTargetAmount,
      date: dateValue,
      inflationRate: responseData.Data.Percentage * 100,
      continueLink: '#',
      restLink: null,
    };

    adjustedTargetAmount.value = responseData.Data.InflatedTargetAmount;
    inflationPercent.value = responseData.Data.Percentage;
    const emergencyPayload = emergencyCalcPayload(form);
    renderProposalBlock(apiResponse, 'emergency', emergencyPayload);

    const inputs = form.querySelectorAll('.form-wrapper form input[type="number"]');
    inputs.forEach((input) => {
      input.addEventListener('blur', () => emergencyCalcGetAPICall(form));
    });
  } else {
    errorResponseHandler();
  }
}

export default function emergencyCalcSubmission(form) {
  const inputs = form.querySelectorAll('.form-wrapper form input:not(#goalName)');

  inputs.forEach((input) => {
    input.addEventListener('blur', () => emergencyCalcGetAPICall(form));
  });

  emergencyCalcGetAPICall(form);
}
