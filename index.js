#!/usr/bin/env node

console.log('🚀 欢迎使用chenbz工具箱 \n')

const inquirer = require('inquirer');

const prompList = [
  {
    type: 'list',
    message: '请选择要使用的工具:',
    name: 'type',
    choices: [
      "Git",
    ],
  }
];

inquirer.prompt(prompList).then(answers => {

  const { type } = answers;

  switch (type) {
    case 'Git':
      require('./bin/git');
      break;
    default:
      console.log('无法解析');
  }
});