const ROTATION_INCREMENT = 360 / 60;

const hour = {
  hand: document.getElementById("hour-hand"),
  slider:  document.getElementById("hour-slider"),
  text: document.getElementById("hour-offset-text")
}

const minute =  {
  hand: document.getElementById("minute-hand"),
  slider: document.getElementById("minute-slider"),
  text: document.getElementById("minute-offset-text")
}

const second = {
  hand: document.getElementById("second-hand"),
  slider:  document.getElementById("second-slider"),
  text: document.getElementById("second-offset-text")
}

const offsetText = {
  second: document.getElementById("second-offset-text"),
  minute: document.getElementById("minute-offset-text"),
  hour: document.getElementById("hour-offset-text")
}

const unixText = document.getElementById("unix-time");

let offsets = {};

let stopwatchOn = false;
let startTimeMs = new Date().getTime();

function resetOffsets() {
  offsets = {
    second: 0,
    minute: 0,
    hour: 0,
    base: 180
  }

  for(key in offsetText) offsetText[key].innerHTML = "0"
};

resetOffsets();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function convertToDigitalTime(date) {
  return formatTime(date.getHours(), offsets.hour, 24) + ':'
  + formatTime(date.getMinutes(), offsets.minute, 60) + ':'
  + formatTime(date.getSeconds(), offsets.second, 60);
}

function formatTime(num, offset, max) {
  num = (offset) ? num + parseInt(offset) : num

  if(num < 10) return '0' + num;
  else if (num >= max) return formatTime(num - max, 0);
  return num;
}

function changeOffset(elementId, num) {
  console.log('changing offset', num, offsets);
  flash(false, false, elementId);

  switch (elementId) {
    case 'second-up':
    case 'second-down':
      offsets.second = safeCalc(offsets.second, num, 60);
      offsetText.second.innerHTML = offsets.second;
      break;
    case 'minute-up':
    case 'minute-down':
      offsets.minute = safeCalc(offsets.minute, num, 60);
      offsetText.minute.innerHTML = offsets.minute;
      break;
    case 'hour-up':
    case 'hour-down':
      offsets.hour = safeCalc(offsets.hour, num, 24);
      offsetText.hour.innerHTML = offsets.hour;
      break;
  }

  function safeCalc(offset, num, max) {
    const newOffset = offset + num;
    if(newOffset >= max) return newOffset - max
    else if(newOffset < 0) return max + newOffset
    return newOffset;
  }

}


const tick = async () => {
  updateClock();
  await sleep(100);
  tick();
}

function updateClock() {
  const time = new Date();

  let secondRotation = (time.getSeconds() * ROTATION_INCREMENT) + (offsets.second * ROTATION_INCREMENT) + offsets.base
  let minuteRotation = (time.getMinutes() * ROTATION_INCREMENT) + (offsets.minute * ROTATION_INCREMENT)  + offsets.base
  let hourRotation = (time.getHours() * (60 / 12) * ROTATION_INCREMENT) + (offsets.hour * ((60 / 12) * ROTATION_INCREMENT))  + offsets.base

  hour.hand.setAttribute("transform", "rotate(" + hourRotation + " 380 380)");
  minute.hand.setAttribute("transform", "rotate(" + minuteRotation + " 380 380)");
  second.hand.setAttribute("transform", "rotate(" + secondRotation + " 380 380)");

  document.getElementById("digital-clock").innerHTML = convertToDigitalTime(new Date());

  document.getElementById("date").innerHTML = formatTime(time.getDate()) + "&nbsp;&nbsp;" + formatTime(time.getMonth() + 1) + "&nbsp;&nbsp;" + time.getFullYear()

  unixText.innerHTML = time.getTime() +
    (offsets.second * 1000) + (offsets.minute * 60 * 1000) + (offsets.hour * 60 * 60 * 1000);

  if(stopwatchOn) document.getElementById("stopwatch").innerHTML = formatTimeDiscrepency(time.getTime() - startTimeMs);

  function formatTimeDiscrepency(elapsedTimeMs) {
    const minuteInMs = 1000 * 60;

    //Reset timer if it goes on for too long,
    if(elapsedTimeMs > minuteInMs * 99) elapsedTimeMs = 0;

    const minutes = Math.floor(elapsedTimeMs / minuteInMs);
    elapsedTimeMs = elapsedTimeMs - (minutes * minuteInMs);

    const seconds = Math.floor(elapsedTimeMs / 1000);
    elapsedTimeMs = elapsedTimeMs - (seconds * 1000);

    return formatTime(minutes, 0, 60) + ":" + formatTime(seconds, 0, 60) + ":" + elapsedTimeMs;
  }
}

const flash = async (visible, repeat, elementId) => {
  document.getElementById(elementId).setAttribute("opacity", (visible) ? 1 : 0);

  await sleep(300);

  if (!visible || repeat) flash(!visible, repeat, elementId);
}

function stopwatchChangeState(newState) {
  if(newState) startTimeMs = new Date().getTime();
  stopwatchOn = newState;
}

tick();
// flash(false, true, 'terminal-text');
