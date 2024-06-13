import { getApiURL } from '../../scripts/utils.js';
import {
  getMonthDifference,
  getMonthName,
  getFormInputs,
  errorResponseHandler,
  renderProposalBlock,
} from './helper.js';

function educationCalcAPIData(form) {
  const goalCategory = form.querySelector('#goalCategory').value;
  const startingDeposit = parseInt(form.querySelector('#startingDeposit').value, 10);
  const startDate = form.querySelector('#startingDate').value;
  const inputElements = form.querySelectorAll(['#colLeft input', '#colRight input']);

  let total = 0;

  inputElements.forEach((input) => {
    const numericValue = parseFloat(input.value.replace(/[^\d.-]/g, ''));
    if (!Number.isNaN(numericValue)) {
      total += numericValue;
    }
  });
  total += startingDeposit;
  const months = getMonthDifference(Date.now(), startDate);
  // eslint-disable-next-line object-curly-newline
  return { startingDeposit, total, months, goalCategory };
}

function educationCalcPayload(form) {
  const { startingDeposit, total } = educationCalcAPIData(form);
  const formInputs = form.querySelectorAll(['form input', 'form select']);
  const payload = getFormInputs(formInputs);

  const requestData = {
    _Type: 'Education',
    _Subtype: 'Form',
    IsTarget: true,
    GoalName: payload.goalName,
    ForWho: payload.forWho,
    GoalCategory: payload.goalCategory,
    Residence: payload.residence,
    StartingDeposit: startingDeposit,
    TargetAmount: total,
    AdjustedTargetAmount: parseInt(payload.AdjustedTargetAmount, 10),
    NoOfPayments: 1,
    TimeHorizonMonths: 9,
    InflationPercent: (parseInt(payload.InflationPercent, 10) * 100),
    UseInflatedAmount: true,
    StartingDate: new Date(payload.startingDate),
    TuitionFees: parseInt(payload.tuitionFees, 10),
    ResidenceAmount: parseInt(payload.ResidenceAmount, 10),
    Books: parseInt(payload.booksAmount, 10),
    Travel: parseInt(payload.travelAmount, 10),
    Aftercare: parseInt(payload.AftercareAmount, 10),
  };

  return requestData;
}

function resetQuote(e) {
  e.preventDefault();
  document.querySelector('.education-calculator > .section-container > .form-wrapper > .form form').reset();
}

function educationCalcProposal(responseData, form) {
  if (responseData && responseData.Success) {
    const adjustedTargetAmount = form.querySelector('#AdjustedTargetAmount');
    const inflationPercent = form.querySelector('#InflationPercent');
    const startDateObj = new Date(form.querySelector('#startingDate').value);
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
    const educationPayload = educationCalcPayload(form);
    renderProposalBlock(apiResponse, 'education', educationPayload);
    // after block generation attaching reset listner
    const resetQuoteAnchor = document.querySelector('a.reset-quote');
    if (resetQuoteAnchor) {
      resetQuoteAnchor.addEventListener('click', (e) => resetQuote(e));
    }
  } else {
    errorResponseHandler();
  }
}

async function educationCalcGetAPICall(form) {
  const apiBasePath = await getApiURL();
  // eslint-disable-next-line object-curly-newline
  const { startingDeposit, total, months, goalCategory } = educationCalcAPIData(form);
  const apiUrl = `${apiBasePath}Calcs/InflatedAmount/${total}/${startingDeposit}/${months}/1/${goalCategory}?_=${Date.now()}`;
  try {
    const response = await fetch(apiUrl);
    if (response.ok) {
      const responseData = await response.json();
      educationCalcProposal(responseData, form);
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

export default function educationCalcSubmission(form) {
  const fieldElements = form.querySelectorAll('.form-wrapper form > div');
  fieldElements.forEach((element) => {
    element.classList.remove('hide');
  });

  const inputs = form.querySelectorAll('.form-wrapper form input');
  const selects = form.querySelectorAll('.form-wrapper form select');
  inputs.forEach((input) => {
    input.addEventListener('blur', () => educationCalcGetAPICall(form));
  });

  selects.forEach((input) => {
    input.addEventListener('blur', () => educationCalcGetAPICall(form));
  });
  educationCalcGetAPICall(form);
}
