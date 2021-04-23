import store from 'store-css';

// import external font stylesheet
store.css('https://fonts.googleapis.com/css?family=Merriweather|Roboto:700', { crossOrigin: 'anonymous' });

/* observe body font
const bodyFont = new Observer('Merriweather', {weight: 400});
bodyFont.load().then(() => {document.documentElement.classList.add('merriweather-ready')});

// observe heading font
const headingFont = new Observer('Roboto', {weight: 700});
headingFont.load().then(() => {document.documentElement.classList.add('roboto-ready')});
*/
