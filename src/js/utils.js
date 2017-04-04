module.exports = {

  formatNumber(num, decimals, regularSep, decimalSep) {
    decimals = decimals || 0;
    regularSep = regularSep || ',';
    decimalSep = decimalSep || '.';

    num = num.toFixed(decimals);
    num = num.replace('.', decimalSep);
    num = num.split(decimalSep);
    num[0] = num[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, `$1${regularSep}`);
    num = num[1] ? num[0] + decimalSep + num[1] : num[0];

    return num;
  },

  formatDateComplete(date) {
    let locale = 'en';
    return `${date.toLocaleString(locale, {day: '2-digit'})} ${date.toLocaleString(locale, {month: 'long' })} ${date.toLocaleString(locale, {year: 'numeric'})}`
  },

  formatDateShort(date) {
    let locale = 'en';
    return `${date.toLocaleString(locale, {day: '2-digit'})} ${date.toLocaleString(locale, {month: 'short' })} ${date.toLocaleString(locale, {year: 'numeric'})}`
  },

  formatDateNotYear(date) {
    let locale = 'en';
    return `${date.toLocaleString(locale, {month: 'short' })} ${date.toLocaleString(locale, {year: 'numeric'})}`
  },

  formatDate(date) {
    let locale = 'en';
    return `${date.toLocaleString(locale, {day: '2-digit'})}/${date.toLocaleString(locale, {month: '2-digit' })}/${date.toLocaleString(locale, {year: 'numeric'})}`
  }

};
