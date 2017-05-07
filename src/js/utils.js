var moment = require('moment');

module.exports = {

  formatNumber(num, decimals, regularSep, decimalSep) {

    if(!num)
      return num;

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
    // let locale = 'en';
    let mDate = moment(date);
    return `${mDate.format('DD')} ${mDate.format('MMMM')} ${mDate.format('YYYY')}`
  },

  formatDateShort(date) {
    // let locale = 'en';
    let mDate = moment(date);
    return `${mDate.format('DD')} ${mDate.format('MMM')} ${mDate.format('YYYY')}`
    // return `${date.toLocaleString(locale, {day: '2-digit'})} ${date.toLocaleString(locale, {month: 'short' })} ${date.toLocaleString(locale, {year: 'numeric'})}`
  },

  formatDateShortNotDay(date) {
    // let locale = 'en';
    // return `${date.toLocaleString(locale, {month: 'short' })} ${date.toLocaleString(locale, {year: 'numeric'})}`
    let mDate = moment(date);
    return `${mDate.format('MMM')} ${mDate.format('YYYY')}`
  },

  formatDateShortNotYear(date) {
    // let locale = 'en';
    // return `${date.toLocaleString(locale, {month: 'short' })} ${date.toLocaleString(locale, {day: '2-digit'})}`
    let mDate = moment(date);
    return `${mDate.format('MMM')} ${mDate.format('DD')}`
  },

  formatDate(date) {
    // let locale = 'en';
    // return `${date.toLocaleString(locale, {day: '2-digit'})}/${date.toLocaleString(locale, {month: '2-digit' })}/${date.toLocaleString(locale, {year: 'numeric'})}`
    let mDate = moment(date);
    return `${mDate.format('MM')}/${mDate.format('DD')}/${mDate.format('YYYY')}`
  }

};
