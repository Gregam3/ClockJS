const ROTATION_INCREMENT = 360 / 60;

const hourHand = document.getElementById("hour-hand");
const minuteHand = document.getElementById("minute-hand");
const secondHand = document.getElementById("second-hand");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function convertToDigitalTime(date) {
  return formatTime(date.getHours()) + ':'
  + formatTime(date.getMinutes()) + ':'
  + formatTime(date.getSeconds());
}

function formatTime(num) {
  if(num < 10) return '0' + num
  return num;
}

const tick = async () => {
  const time = new Date();

  hourHand.setAttribute("transform", "rotate(" + (time.getHours() * (60 / 12)) * ROTATION_INCREMENT + " 200 200)");
  minuteHand.setAttribute("transform", "rotate(" + time.getMinutes() * ROTATION_INCREMENT + " 200 200)");
  secondHand.setAttribute("transform", "rotate(" + time.getSeconds() * ROTATION_INCREMENT + " 200 200)");

  document.getElementById("digital-clock").innerHTML = convertToDigitalTime(new Date());

  //To ensure seconds are accurate
  await sleep(1000 - time.getMilliseconds());
  tick();
}

tick();
