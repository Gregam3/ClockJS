var rotation = 0;
var hand = document.getElementById("hand")

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
  while (true) {
    hand.groupTransform.rotate.angle = rotation;
    rotation += 6;
    document.getElementById("digital-clock").innerHTML = convertToDigitalTime(new Date());

    await sleep(1000);
  }
}

startClock();
