#!/usr/bin/env node

console.log('[提示] 欢迎使用chenbz工具箱 \n')

const inquirer = require('inquirer');

const choices = [
  'git',
  'npm',
];

const prompList = [
  {
    type: 'list',
    message: '请选择要使用的工具:',
    name: 'type',
    choices,
    loop: false,
  }
];

inquirer.prompt(prompList).then(answers => {

  const { type } = answers;

  const index = choices.indexOf(type);

  switch (index) {
    case 0:
      require('./bin/git');
      break;
    case 1:
      require('./bin/npm');
      break;
    default:
      console.log('无法解析');
  }
});