import { getApiURL } from '../../scripts/utils.js';
import {
  getMonthDifference,
  getMonthName,
  getFormInputs,
  errorResponseHandler,
  renderProposalBlock,
} from './helper.js';

function holidayCalcAPIData(form) {
  const inputElements = form.querySelectorAll(['#colLeft input', '#colRight input']);
  const startingDeposit = parseInt(form.querySelector('#startingDeposit').value, 10);
  const startDate = form.querySelector('#startDate').value;
  const whenNeedMoney = form.querySelector('#timeHorizonMonthList').value;
  let total = 0;

  inputElements.forEach((input) => {
    const numericValue = parseFloat(input.value.replace(/[^\d.-]/g, ''));
    if (!Number.isNaN(numericValue)) {
      total += numericValue;
    }
  });

  const months = getMonthDifference(Date.now(), startDate);
  const monthDiff = months ? months - parseInt(whenNeedMoney, 10) : 0;

  return { startingDeposit, total, monthDiff };
}

function holidayCalcPayload(form) {
  const { startingDeposit, total } = holidayCalcAPIData(form);
  const formInputs = form.querySelectorAll(['form input', 'form select']);
  const payload = getFormInputs(formInputs);

  const requestData = {
    _Type: 'Holiday',
    _Subtype: 'Form',
    IsTarget: true,
    GoalName: payload.goalName,
    GoalCategory: 4,
    StartingDeposit: startingDeposit,
    TimeHorizonMonths: parseInt(payload.timeHorizonMonthList, 10),
    TargetAmount: total,
    AdjustedTargetAmount: parseInt(payload.AdjustedTargetAmount, 10),
    NoOfPayments: 1,
    InflationPercent: (parseInt(payload.InflationPercent, 10) * 100),
    UseInflatedAmount: true,
    StartingDate: new Date(payload.startDate),
    Fuel: parseInt(payload.Fuel, 10),
    Padkos: parseInt(payload.Padkos, 10),
    Flights: parseInt(payload.Flights, 10),
    CarHire: parseInt(payload.CarHire, 10),
  };

  return requestData;
}

function holidayCalcProposal(responseData, form) {
  if (responseData && responseData.Success) {
    const adjustedTargetAmount = form.querySelector('#AdjustedTargetAmount');
    const inflationPercent = form.querySelector('#InflationPercent');
    const startDateObj = new Date(form.querySelector('#startDate').value);
    const dateValue = `${getMonthName(startDateObj)} ${startDateObj.getFullYear()}`;
    const apiResponse = {
      amount: responseData.Data.InflatedTargetAmount,
      date: dateValue,
      inflationRate: responseData.Data.Percentage * 100,
      continueLink: '#',
      restLink: null,
    };

    adjustedTargetAmount.value = responseData.Data.InflatedTargetAmount;
    inflationPercent.value = responseData.Data.Percentage;
    const holidayPayload = holidayCalcPayload(form);
    renderProposalBlock(apiResponse, 'holiday', holidayPayload);
  } else {
    errorResponseHandler();
  }
}

async function holidayCalcGetAPICall(form) {
  const apiBasePath = await getApiURL();
  const { startingDeposit, total, monthDiff } = holidayCalcAPIData(form);
  const apiUrl = `${apiBasePath}Calcs/InflatedAmount/${total}/${startingDeposit}/${monthDiff}/1/1/4?_=${Date.now()}`;

  try {
    const response = await fetch(apiUrl);
    if (response.ok) {
      const responseData = await response.json();
      holidayCalcProposal(responseData, form);
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

export default function holidayCalcSubmission(form) {
  const fieldElements = form.querySelectorAll('.form-wrapper form > div');

  fieldElements.forEach((element) => {
    element.classList.remove('hide');
  });

  const inputs = form.querySelectorAll('.form-wrapper form input');
  const selects = form.querySelectorAll('.form-wrapper form select');

  inputs.forEach((input) => {
    input.addEventListener('blur', () => holidayCalcGetAPICall(form));
  });

  selects.forEach((input) => {
    input.addEventListener('blur', () => holidayCalcGetAPICall(form));
  });
}
