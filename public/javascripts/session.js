const SESSION_ID = location.href.split('/')[4];
const socket = io.connect('https://sunrintv.kro.kr');
// const socket = io.connect('');

$(document).ready(() => {
  console.log(SESSION_ID);
});