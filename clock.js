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
let startTimeMs = 0;
let stoppedAtUnix = 0;

function resetOffsets() {
  offsets = {
    second: 0,
    minute: 0,
    hour: 0,
    day: 0,
    month: 0,
    year: 0,
    base: 180
  }

  for(key in offsetText) offsetText[key].innerHTML = "0"
};

resetOffsets();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatTime(num) {
  if(num < 10) return '0' + num;
  return num;
}

function changeOffset(elementId, num) {
  console.log('changing offset', num, offsets);
  flash(false, false, elementId);

  switch (elementId) {
    case 'second-up': case 'second-down':
      offsets.second += num;
      offsetText.second.innerHTML = offsets.second;
      break;
    case 'minute-up': case 'minute-down':
      offsets.minute += num;
      offsetText.minute.innerHTML = offsets.minute;
      break;
    case 'hour-up':case 'hour-down':
      offsets.hour += num;
      offsetText.hour.innerHTML = offsets.hour;
      break;
    case 'day-up': case 'day-down':
      offsets.day += num;
      break;
    case 'month-up': case 'month-down':
      offsets.month += num;
      break;
    case 'year-up': case 'year-down':
      offsets.year += num;
      break;
  }
}


const tick = async () => {
  updateClock();

  await sleep(1);
  tick();
}

function updateClock() {
  const time = new Date(new Date().getTime() + calculateTotalOffsetInMs())

  //console.log(time)

  let secondRotation = (time.getSeconds() * ROTATION_INCREMENT) + offsets.base
  let minuteRotation = (time.getMinutes() * ROTATION_INCREMENT) + offsets.base
  let hourRotation = (time.getHours() * (60 / 12) * ROTATION_INCREMENT) + offsets.base

  hour.hand.setAttribute("transform", "rotate(" + hourRotation + " 380 380)");
  minute.hand.setAttribute("transform", "rotate(" + minuteRotation + " 380 380)");
  second.hand.setAttribute("transform", "rotate(" + secondRotation + " 380 380)");

  document.getElementById("digital-clock").innerHTML = convertToDigitalTime(time);

  document.getElementById("date").innerHTML = formatTime(time.getDate()) + "&nbsp;&nbsp;&nbsp;" + formatTime(time.getMonth() + 1) + "&nbsp;&nbsp;&nbsp;" + time.getFullYear()

  unixText.innerHTML = time.getTime() +
    (offsets.second * 1000) + (offsets.minute * 60 * 1000) + (offsets.hour * 60 * 60 * 1000);

  document.getElementById("time-period").innerHTML = (time.getHours() > 11) ? "PM" : "AM";

  if(stopwatchOn) document.getElementById("stopwatch").innerHTML = formatTimeDiscrepency(new Date().getTime() - startTimeMs);

  function formatTimeDiscrepency(elapsedTimeMs) {
    const minuteInMs = 1000 * 60;

    //Reset timer if it goes on for too long,
    if(elapsedTimeMs > minuteInMs * 99) elapsedTimeMs = 0;

    const minutes = Math.floor(elapsedTimeMs / minuteInMs);
    elapsedTimeMs = elapsedTimeMs - (minutes * minuteInMs);

    const seconds = Math.floor(elapsedTimeMs / 1000);
    elapsedTimeMs = elapsedTimeMs - (seconds * 1000);

    return formatTime(minutes) + ":" + formatTime(seconds) + ":" + elapsedTimeMs;
  }

  function calculateTotalOffsetInMs() {
    return (offsets.year * 12 * 30 * 24 * 60 * 60 * 1000) +
      (offsets.month * 30 * 24 * 60 * 60 * 1000) +
      (offsets.day * 24 * 60 * 60 * 1000) +
      (offsets.hour * 60 * 60 * 1000) +
      (offsets.minute * 60 * 1000) +
      (offsets.second * 1000);
  }

  function convertToDigitalTime(date) {
    return formatTime(date.getHours()) + ':'
    + formatTime(date.getMinutes()) + ':'
    + formatTime(date.getSeconds());
  }

  // console.log('Millsecond discrepency : ' + (new Date().getTime() - time.getTime()) + 'ms')
}

const flash = async (visible, repeat, elementId) => {
  document.getElementById(elementId).setAttribute("opacity", visible + 0);
  await sleep(300);
  if (!visible || repeat) flash(!visible, repeat, elementId);
}

function stopwatchChangeState(newState) {
  if(newState) startTimeMs = new Date().getTime();
  stopwatchOn = newState;

  flash(false, false, ((newState) ? 'start' : 'stop' ) + '-button')
}

tick();
