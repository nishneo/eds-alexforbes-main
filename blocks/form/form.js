import createField from './form-fields.js';
import { sampleRUM } from '../../scripts/aem.js';
import contactUsSubmission from './contact-us.js';
import holidayCalcSubmission from './holiday-calculator.js';
import educationCalcSubmission from './education-calculator.js';
import investingCalcSubmission from './investing-calculator.js';
import weddingCalcSubmission from './wedding-calculator.js';
import emergencyCalcSubmission from './emergency-calculator.js';
import ifaLeadSubmission from './ifalead-form.js';
import retirementSubmission from './retirement-calculator.js';

async function createForm(formHref) {
  const { pathname } = new URL(formHref);
  const resp = await fetch(pathname);
  const json = await resp.json();

  const form = document.createElement('form');
  // eslint-disable-next-line prefer-destructuring
  form.dataset.action = pathname.split('.json')[0];

  const fields = await Promise.all(json.data.map((fd) => createField(fd, form)));
  fields.forEach((field) => {
    if (field) {
      form.append(field);
    }
  });

  // group fields into fieldsets
  const fieldsets = form.querySelectorAll('fieldset');
  fieldsets.forEach((fieldset) => {
    form.querySelectorAll(`[data-fieldset="${fieldset.name}"`).forEach((field) => {
      fieldset.append(field);
    });
  });

  return form;
}

function getFormType(form) {
  const objWithFormType = [form.elements].find((obj) => obj.formType !== undefined);
  const formType = objWithFormType ? objWithFormType.formType?.value : null;
  return formType;
}

function handleSubmitError(form, error) {
  // eslint-disable-next-line no-console
  console.error(error);
  form.querySelector('button[type="submit"]').disabled = false;
  sampleRUM('form:error', { source: '.form', target: error.stack || error.message || 'unknown error' });
}

function generatePayload(form) {
  const payload = {};

  [...form.elements].forEach((field) => {
    if (field.name && field.type !== 'submit' && !field.disabled) {
      if (field.type === 'radio') {
        if (field.checked) payload[field.name] = field.value;
      } else if (field.type === 'checkbox') {
        if (field.checked) payload[field.name] = payload[field.name] ? `${payload[field.name]},${field.value}` : field.value;
      } else {
        payload[field.name] = field.value;
      }
    }
  });

  return payload;
}

// Function to handle generic form submission
async function genericSubmission(form) {
  try {
    // create payload
    const payload = generatePayload(form);
    const response = await fetch(form.dataset.action, {
      method: 'POST',
      body: JSON.stringify({ data: payload }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      sampleRUM('form:submit', { source: '.form', target: form.dataset.action });
      if (form.dataset.confirmation) {
        window.location.href = form.dataset.confirmation;
      }
    } else {
      const error = await response.text();
      throw new Error(error);
    }
  } catch (e) {
    handleSubmitError(form, e);
  } finally {
    form.setAttribute('data-submitting', 'false');
  }
}

// Function to handle form submission based on form type
async function handleSubmit(form) {
  if (form.getAttribute('data-submitting') === 'true') return;

  const submit = form.querySelector('button[type="submit"]');
  try {
    form.setAttribute('data-submitting', 'true');
    submit.disabled = true;

    const formType = getFormType(form);
    // Determine form submission logic based on form type
    switch (formType) {
      case 'contact-us':
        await contactUsSubmission(form);
        break;
      case 'lead':
        await ifaLeadSubmission(form);
        break;
      case 'holiday':
        // hide submit button
        submit.style.display = 'none';
        holidayCalcSubmission(form);
        break;
      case 'education':
        submit.style.display = 'none';
        educationCalcSubmission(form);
        break;
      case 'investing':
        investingCalcSubmission(form);
        break;
      case 'wedding':
        submit.style.display = 'none';
        weddingCalcSubmission(form);
        break;
      case 'emergency':
        // hide submit button
        submit.style.display = 'none';
        emergencyCalcSubmission(form);
        break;
      case 'retirement':
        retirementSubmission(form);
        break;
      default:
        await genericSubmission(form);
        break;
    }
  } catch (e) {
    handleSubmitError(form, e);
  } finally {
    form.setAttribute('data-submitting', 'false');
  }
}

function handleFormManipulation(form) {
  const formType = getFormType(form);
  if (formType === 'retirement') {
    const eacUseIndustry = form.querySelector('.chkEacUseIndustry');
    const eacFees = form.querySelector('.chkEacFees');
    const chkEacUseIndustry = form.querySelector('#chkEacUseIndustry');
    const chkEacFees = form.querySelector('#chkEacFees');
    const inputEacProvideValue = form.querySelector('#eacProvideValue');
    const inputEacFees = form.querySelector('#eacFees');

    const handleEacUseIndustryClick = () => {
      chkEacFees.checked = !chkEacUseIndustry.checked;
      inputEacFees.disabled = chkEacUseIndustry.checked;
      inputEacProvideValue.disabled = !chkEacUseIndustry.checked;
    };

    const handleEacFeesClick = () => {
      chkEacUseIndustry.checked = !chkEacFees.checked;
      inputEacFees.disabled = !chkEacFees.checked;
      inputEacProvideValue.disabled = chkEacFees.checked;
    };

    eacUseIndustry.addEventListener('click', handleEacUseIndustryClick);
    eacFees.addEventListener('click', handleEacFeesClick);
  }
}

export default async function decorate(block) {
  const formLink = block.querySelector('a[href$=".json"]');
  if (!formLink) return;

  const form = await createForm(formLink.href);
  block.replaceChildren(form);
  const submit = form.querySelector('button[type="submit"]');

  handleFormManipulation(form);

  // adding invalid class for html5 validations style
  submit.addEventListener('click', () => {
    const valid = form.checkValidity();
    if (!valid) {
      const firstInvalidEl = form.querySelector(':invalid:not(fieldset)');
      firstInvalidEl.classList.add('invalid');
      if (firstInvalidEl) {
        firstInvalidEl.focus();
      }
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const valid = form.checkValidity();
    if (valid) {
      handleSubmit(form);
    } else {
      const firstInvalidEl = form.querySelector(':invalid:not(fieldset)');
      if (firstInvalidEl) {
        firstInvalidEl.focus();
        firstInvalidEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
}
