/** Tailwind config for the events page. Scans events.html and the card markup
 *  built in api/events.js. Regenerate the stylesheet with `make css`. */
module.exports = {
  content: [
    './events.html',
    './api/events.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Rajdhani', 'system-ui', 'sans-serif'],
        body: ['Saira', 'system-ui', 'sans-serif'],
      },
      colors: {
        dojo: { red: '#df3f33', navy: '#0C111D', bg: '#f5f5f5' },
      },
    },
  },
};
