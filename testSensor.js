const getTemperature = require('./sensors/temperatureSensor');
const getVibration = require('./sensors/vibrationSensor');
const getCurrent = require('./sensors/currentSensor');

const temperature = getTemperature();
const vibration = getVibration();
const current = getCurrent();

console.log("Temperature:", temperature, "°C");
console.log("Vibration:", vibration);
console.log("Electrical Current:", current, "A");