import { getApiURL } from '../../scripts/utils.js';
import {
  getMonthDifference,
  getMonthName,
  getFormInputs,
  errorResponseHandler,
  renderProposalBlock,
} from './helper.js';

const defaultValueArray = [
  {
    title: 'Silver',
    isActive: false,
    defaultValues: {
      Venue: 4800,
      FurnitureHire: 6000,
      Decor: 2400,
      Transport: 0,
      Flowers: 6000,
      WeddingCake: 1600,
      Catering: 12000,
      Drinks: 2000,
      Dress: 3600,
      Shoes: 1600,
      Groom: 2000,
      Makeup: 600,
      Invites: 1450,
      Photography: 6000,
      ThankYouGift: 1400,
      UnexpectedExpenses: 2400,
      WeddingPlannerAmount: 0,
      Honeymoon: 0,
      GroomsRing: 0,
      BridesRing: 0,
      BridesMaids: 3000,
      Lobola: 0,
    },
  },
  {
    title: 'Gold',
    isActive: false,
    defaultValues: {
      Venue: 12000,
      FurnitureHire: 15000,
      Decor: 6000,
      Transport: 3500,
      Flowers: 15000,
      WeddingCake: 4000,
      Catering: 30000,
      Drinks: 5000,
      Dress: 9000,
      Shoes: 4000,
      Groom: 5000,
      Makeup: 1500,
      Invites: 3600,
      Photography: 15000,
      ThankYouGift: 3400,
      UnexpectedExpenses: 6000,
      WeddingPlannerAmount: 10,
      Honeymoon: 0,
      GroomsRing: 0,
      BridesRing: 0,
      BridesMaids: 5000,
      Lobola: 0,
    },
  },
  {
    title: 'Platinum',
    isActive: true,
    defaultValues: {
      Venue: 21000,
      FurnitureHire: 26250,
      Decor: 10500,
      Transport: 6125,
      Flowers: 26250,
      WeddingCake: 7000,
      Catering: 52500,
      Drinks: 8750,
      Dress: 15750,
      Shoes: 7000,
      Groom: 12000,
      Makeup: 2625,
      Invites: 6325,
      Photography: 26250,
      ThankYouGift: 5950,
      UnexpectedExpenses: 10500,
      WeddingPlannerAmount: 10,
      Honeymoon: 0,
      GroomsRing: 0,
      BridesRing: 0,
      BridesMaids: 8750,
      Lobola: 0,
    },
  },
];

let elem;
let tabs;
let typeOfWeddingElem;

function weddingAssignDefaultValues() {
  const selectedValue = typeOfWeddingElem?.value;

  defaultValueArray.forEach((item) => {
    if ((item.title).toLowerCase() === selectedValue.toLowerCase()) {
      Object.keys(item.defaultValues).forEach((key) => {
        const value = item.defaultValues[key];
        const inputField = elem.querySelector(key) || elem.querySelector(`[name=${key}]`);

        if (inputField) {
          inputField.value = value;
        }
      });
    }
  });

  tabs.forEach((tab) => {
    tab.classList.remove('active');
    if (typeOfWeddingElem.value === tab.value.toLowerCase()) tab.classList.add('active');
  });
}

function weddingCalcAPIData() {
  const inputElements = elem.querySelectorAll(['#colLeft input', '#colRight input']);
  const startingDeposit = parseInt(elem.querySelector('#startingDeposit').value, 10);
  const startDate = elem.querySelector('#startDate').value;
  const whenNeedMoney = elem.querySelector('#timeHorizonMonthList').value;
  let total = 0;

  inputElements.forEach((input) => {
    const numericValue = parseFloat(input.value.replace(/[^\d.-]/g, ''));
    if (!Number.isNaN(numericValue)) {
      total += numericValue;
    }
  });
  total += startingDeposit;

  const months = getMonthDifference(Date.now(), startDate);
  const monthDiff = months ? months - parseInt(whenNeedMoney, 10) : 0;

  return { startingDeposit, total, monthDiff };
}

function weddingCalcPayload() {
  const { startingDeposit } = weddingCalcAPIData();
  const formInputs = elem.querySelectorAll(['form input', 'form select']);
  const payload = getFormInputs(formInputs);

  const requestData = {
    _Type: 'Wedding',
    _Subtype: 'Form',
    IsTarget: true,
    GoalName: payload.goalName,
    GoalCategory: payload.GoalCategory,
    StartingDeposit: startingDeposit,
    TimeHorizonMonths: payload.TimeHorizon,
    TargetAmount: payload.TotalAmount,
    AdjustedTargetAmount: +payload.AdjustedTargetAmount,
    NoOfPayments: 1,
    InflationPercent: (parseInt(payload.InflationPercent, 10) * 100),
    UseInflatedAmount: true,

    WeddingDate: payload.WeddingDate,
    WhenNeedMoney: payload.WhenNeedMoney,
    WithdrawlDate: payload.WithdrawlDate,
    Venue: payload.Venue,
    FurnitureHire: payload.FurnitureHire,
    Decor: payload.Decor,
    Transport: payload.Transport,
    Flowers: payload.Flowers,
    WeddingCake: payload.WeddingCake,
    Catering: payload.Catering,
    Drinks: payload.Drinks,
    Dress: payload.Dress,
    Shoes: payload.Shoes,
    Groom: payload.Groom,
    Makeup: payload.Makeup,
    Invites: payload.Invites,
    Photography: payload.Photography,
    ThankYouGift: payload.ThankYouGift,
    UnexpectedExpenses: payload.UnexpectedExpenses,
    WeddingPlanner: payload.WeddingPlannerAmount,
    Honeymoon: payload.Honeymoon,
    GroomsRing: payload.GroomsRing,
    BridesRing: payload.BridesRing,
    Bridesmaids: payload.Bridesmaids,
    Lobola: payload.Lobola,
  };
  return requestData;
}

function resetQuote(e) {
  e.preventDefault();
  weddingAssignDefaultValues();
}

function weddingCalcProposal(responseData) {
  if (responseData?.Success) {
    const adjustedTargetAmount = elem.querySelector('#AdjustedTargetAmount');
    const inflationPercent = elem.querySelector('#InflationPercent');
    const startDateObj = new Date(elem.querySelector('#startDate').value);
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
    const weddingPayload = weddingCalcPayload();
    renderProposalBlock(apiResponse, 'wedding', weddingPayload);
    // after block generation attaching reset listner
    const resetQuoteAnchor = document.querySelector('a.reset-quote');
    if (resetQuoteAnchor) {
      resetQuoteAnchor.addEventListener('click', (e) => resetQuote(e));
    }
  } else {
    errorResponseHandler();
  }
}

async function weddingCalcGetAPICall() {
  weddingCalcPayload();
  const apiBasePath = await getApiURL();
  const { startingDeposit, total, monthDiff } = weddingCalcAPIData();
  const apiUrl = `${apiBasePath}Calcs/InflatedAmount/${total}/${startingDeposit}/${monthDiff}/1/1/4?_=${Date.now()}`;

  try {
    const response = await fetch(apiUrl);
    if (response.ok) {
      const responseData = await response.json();
      weddingCalcProposal(responseData);
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

export default function weddingCalcSubmission(form) {
  elem = form;
  tabs = elem.querySelectorAll('#colfull-tab input[type="button"]');
  typeOfWeddingElem = elem.querySelector('.wedding-calculator form #category');
  weddingAssignDefaultValues();
  tabs.forEach((tab) => {
    if (typeOfWeddingElem.value === tab.value.toLowerCase()) tab.classList.add('active');
    tab.addEventListener('click', () => {
      tabs.forEach((sibling) => {
        sibling.classList.remove('active');
      });
      typeOfWeddingElem.value = tab.value.toLowerCase();
      tab.classList.add('active');
      weddingAssignDefaultValues();
      weddingCalcGetAPICall();
    });
  });
  const fieldElements = elem.querySelectorAll('.form-wrapper form > div');

  fieldElements.forEach((element) => {
    element.classList.remove('hide');
  });
  weddingCalcGetAPICall();
  const inputs = elem.querySelectorAll('.form-wrapper form input');
  const selects = elem.querySelectorAll('.form-wrapper form select');

  inputs.forEach((input) => {
    input.addEventListener('blur', weddingCalcGetAPICall);
  });

  selects.forEach((input) => {
    input.addEventListener('change', weddingCalcGetAPICall);
  });
}
