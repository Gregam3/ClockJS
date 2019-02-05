const ROTATION_INCREMENT = 360 / 60

let hand = document.getElementById("hand")

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

const startClock = async () => {
  let rotation = new Date().getSeconds() * ROTATION_INCREMENT;

  while (true) {
    hand.setAttribute("transform", "rotate(" + rotation + " 200 200)");
    rotation += ROTATION_INCREMENT;
    document.getElementById("digital-clock").innerHTML = convertToDigitalTime(new Date());

    await sleep(1000);
  }
}

startClock();
