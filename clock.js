const ROTATION_INCREMENT = 360 / 60;

const msPerSecond = 1000; const msPerMinute = msPerSecond * 60; const msPerHour = msPerMinute * 60;
const msPerDay = msPerHour * 24; const msPerMonth = msPerDay * 30; const msPerYear = msPerMonth * 12;

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

let alarmTimes = [];

let time = new Date();

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

function timezoneOffset(hourOffset) {
  resetOffsets();

  offsets.hour = hourOffset;
  offsetText.hour.innerHTML = offsets.hour;
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

let configuringAlarm = false;

function updateClock() {
  time = new Date(new Date().getTime() + calculateTotalOffsetInMs())

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
    (offsets.second * msPerSecond) + (offsets.minute * msPerMinute) + (offsets.hour * msPerHour);

  document.getElementById("time-period").innerHTML = (time.getHours() > 11) ? "PM" : "AM";

  if(stopwatchOn) document.getElementById("stopwatch").innerHTML = formatTimeDiscrepency(new Date().getTime() - startTimeMs);



  if(alarmTimes && !configuringAlarm && alarmTimes[0] < time.getTime()) {
    //Activates a upto tenth of a second late to avoid missing the exact ms
    if (alarmTimes[0] > time.getTime() - 100){
      //Removes alarm to prevent additional dialogs
      window.alert("Ding ding! You're Alarm for " +  new Date(alarmTimes[0]) + " is going off!");
      alarmTimes.shift();
    }
    else {
      let removedAlarms = [];

      while (alarmTimes[0] < time.getTime()) {
        removedAlarms.push(new Date(alarmTimes.shift()));
        console.log(alarmTimes);
      }

      window.alert("Due to an offset change making the alarm(s) appear in the past, the alarm(s) at " + removedAlarms  + " have been removed.");
      let configuringAlarm = false;
    }
  }


  function formatTimeDiscrepency(elapsedTimeMs) {

    //Reset timer if it goes on for too long,
    if(elapsedTimeMs > msPerMinute * 99) elapsedTimeMs = 0;

    const minutes = Math.floor(elapsedTimeMs / msPerMinute);
    elapsedTimeMs = elapsedTimeMs - (minutes * msPerMinute);

    const seconds = Math.floor(elapsedTimeMs / msPerSecond);
    elapsedTimeMs = elapsedTimeMs - (seconds * msPerSecond);

    return formatTime(minutes) + ":" + formatTime(seconds) + ":" + elapsedTimeMs;
  }

  function calculateTotalOffsetInMs() {
    return (offsets.year * msPerYear) +
      (offsets.month * msPerMonth) +
      (offsets.day * msPerDay) +
      (offsets.hour * msPerHour) +
      (offsets.minute * msPerMinute) +
      (offsets.second * msPerSecond);
  }

  function convertToDigitalTime(date) {
    return formatTime(date.getHours()) + ':'
    + formatTime(date.getMinutes()) + ':'
    + formatTime(date.getSeconds());
  }

  // console.log('Millsecond discrepency : ' + (new Date().getTime() - time.getTime()) + 'ms')
}

const alarmPattern = new RegExp('([0-9]{4}-[0-3][0-9]-[0-3][0-9]).*?-.*?([0-2][0-9]:[0-5][0-9]:[0-5][0-9])');


const setNewAlarm = function () {
  const timeString = document.getElementById('alarm-text').value;

  flash(false, false, 'alarm-button');

  //2015-03-25T12:10:00Z
  let alarmTimeUnix = null

  if(!timeString.match(alarmPattern)) window.alert("Invalid date format, must conform to - " +
  "[yyyy-mm-dd - hh:mm:ss] exactly. e.g. 1970-01-01 - 00:00:00, all 1 digit numbers must have 0's in front of them.");
  else {
    let match = alarmPattern.exec(timeString);

    alarmTimeUnix = new Date(match[1] + 'T' + match[2] + 'Z').getTime();

    if(time.getTime() > alarmTimeUnix) {
      window.alert("Cannot set alarm in the past! Change Offsets to set this alarm.");
    } else {
      alarmTimes.push(alarmTimeUnix);
      alarmTimes.sort();

      window.alert("New alarm set for " + new Date(alarmTimeUnix));
    }
  }
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
