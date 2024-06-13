function closeAllOtherFaqs(faq) {
  document.querySelectorAll('.faq-accordion').forEach((acc) => {
    if (acc !== faq && acc.classList.contains('active')) {
      acc.classList.remove('active');
    }
  });
}

function toggleFaq(e) {
  const faq = e.target.parentElement;
  closeAllOtherFaqs(faq);
  faq.classList.toggle('active');
}

function addFaqEventListeners(block) {
  block.querySelectorAll('.faq-question').forEach((question) => {
    question.addEventListener('click', toggleFaq);
    question.addEventListener('keydown', (event) => {
      const { keyCode } = event;
      if (keyCode === 32 || keyCode === 13) {
        toggleFaq(event);
      }
    });
  });
}

async function handleDynamicAccordion(block, faqs) {
  if (!block.closest('.faq-container').dataset.accordiontype) {
    return faqs;
  }

  return faqs;
}

export default async function decorate(block) {
  let faqs = [];
  const rows = Array.from(block.children);
  rows.forEach((row) => {
    const cells = Array.from(row.children);
    const question = cells[0] && cells[0].textContent;
    const answer = cells[1] && cells[1].innerHTML;
    faqs.push({
      question, answer,
    });
  });

  block.innerHTML = '';

  faqs = await handleDynamicAccordion(block, faqs);

  faqs.forEach((faq, i) => {
    const { question, answer } = faq;

    const accordion = document.createElement('div');
    accordion.className = 'faq-accordion';
    block.append(accordion);

    const questionDiv = document.createElement('div');
    questionDiv.className = 'faq-question';
    accordion.append(questionDiv);
    questionDiv.innerHTML = question;

    const chevron = document.createElement('i');
    chevron.className = 'chevron';
    questionDiv.append(chevron);

    const answerDiv = document.createElement('div');
    answerDiv.className = 'faq-answer';
    accordion.append(answerDiv);
    answerDiv.innerHTML = answer;

    if (i === 0) {
      accordion.classList.add('active');
    }
  });

  /**
   * Look for anchor tags and add a class if it's a link
   * pointing to a PDF file. This is to render them similar to
   * how PDF links are rendered outside this block.
   */
  const anchorEls = Array.from(block.querySelectorAll('a'));
  anchorEls.forEach((el) => {
    if (el.href.includes('.pdf')) {
      el.classList.add('faq-file');
    }
  });

  addFaqEventListeners(block);
}
