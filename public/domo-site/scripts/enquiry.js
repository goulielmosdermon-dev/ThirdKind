document.querySelector('.enquiry-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const t = value => window.DomoI18n?.t(value) || value;
  const subject = `${t('Project enquiry from')} ${data.get('name')}`;
  const body = [
    `${t('Name')}: ${data.get('name')}`,
    `${t('Email')}: ${data.get('email')}`,
    data.get('company') ? `${t('Company')}: ${data.get('company')}` : '',
    data.get('phone') ? `${t('Phone')}: ${data.get('phone')}` : '',
    '', String(data.get('message'))
  ].filter((line, index) => line || index >= 4).join('\n');
  window.location.href = `mailto:info@domogroup.gr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  form.querySelector('.enquiry-status').textContent = t('Email draft requested. Review and send it from your email app.');
});

window.addEventListener('languagechange', () => {const status = document.querySelector('.enquiry-status');if(status.textContent) status.textContent = window.DomoI18n?.t('Email draft requested. Review and send it from your email app.') || 'Email draft requested. Review and send it from your email app.';});
