function getTemperature() {
    const minTemperature = 20;
    const maxTemperature = 100;

    const temperature =
        Math.floor(Math.random() * (maxTemperature - minTemperature + 1))
        + minTemperature;

    return temperature;
}

module.exports = getTemperature;