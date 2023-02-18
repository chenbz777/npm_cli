const exec = require('child_process').execSync;

function terminal(command) {
  return exec(command).toString();
}

module.exports = {
  terminal,
}