// eslint-disable-next-line import/no-cycle
import { sampleRUM, loadScript } from './aem.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// google analytics
const gaId = 'G-GF3K5S9X84';
loadScript(`https://www.googletagmanager.com/gtag/js?id=${gaId}`, () => {
  // eslint-disable-next-line
  window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', gaId);
});

// google tag manager
const gtmId = 'GTM-K6TJPF57';
if (gtmId) {
  const GTMScript = document.createElement('script');
  GTMScript.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${gtmId}');`;
  document.head.append(GTMScript);

  const GTMFrame = document.createElement('no-script');
  GTMFrame.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
  height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
  document.body.prepend(GTMFrame);
}
