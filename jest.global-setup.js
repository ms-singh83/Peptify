// Pin a DST-observing timezone so date/schedule tests behave the same on every machine.
module.exports = async () => {
  process.env.TZ = 'America/New_York';
};
