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

const unixText = document.getElementById("unix-time");

let offset =  {
  second: 0,
  minute: 0,
  hour: 0,
  base: 180
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function convertToDigitalTime(date) {
  return formatTime(date.getHours(), offset.hour, 24) + ':'
  + formatTime(date.getMinutes(), offset.minute, 60) + ':'
  + formatTime(date.getSeconds(), offset.second, 60);
}

function cum() {
  console.log('yeet');
}

function formatTime(num, offset, max) {
  num = num + parseInt(offset)

  if(num < 10) return '0' + num
  else if (num >= max) return formatTime(num - max, 0)
  return num;
}

second.slider.oninput = function() {
  offset.second = this.value;
  second.text.innerHTML = this.value;
  updateClock();
}

minute.slider.oninput = function() {
  offset.minute = this.value;
  minute.text.innerHTML = this.value;
  updateClock();
}

hour.slider.oninput = function() {
  offset.hour = this.value;
  hour.text.innerHTML = this.value;
  updateClock();
}

const tick = async () => {
  updateClock();
  await sleep(100);
  tick();
}

function updateClock() {
  const time = new Date();

  let secondRotation = (time.getSeconds() * ROTATION_INCREMENT) + (offset.second * ROTATION_INCREMENT) + offset.base
  let minuteRotation = (time.getMinutes() * ROTATION_INCREMENT) + (offset.minute * ROTATION_INCREMENT)  + offset.base
  let hourRotation = (time.getHours() * (60 / 12) * ROTATION_INCREMENT) + (offset.hour * ((60 / 12) * ROTATION_INCREMENT))  + offset.base

  hour.hand.setAttribute("transform", "rotate(" + hourRotation + " 380 380)");
  minute.hand.setAttribute("transform", "rotate(" + minuteRotation + " 380 380)");
  second.hand.setAttribute("transform", "rotate(" + secondRotation + " 380 380)");

  document.getElementById("digital-clock").innerHTML = convertToDigitalTime(new Date());

  unixText.innerHTML = time.getTime() +
    (offset.second * 1000) + (offset.minute * 60 * 1000) + (offset.hour * 60 * 60 * 1000)
}

const flash = async (visible) => {
  document.getElementById("command-input").setAttribute("opacity", (visible) ? 1 : 0);

  await sleep(1000);
  flash(!visible);
}

tick();
flash(true);
