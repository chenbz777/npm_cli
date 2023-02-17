#!/usr/bin/env node

const fs = require('fs');
const exec = require('child_process').execSync;
const inquirer = require('inquirer');

function terminal(command) {
  return exec(command).toString();
}

function init() {

  const choices = [
    '登录',
    '退出登录',
    '初次发布',
    '发布',
    '更新补丁号',
    '更新次版本号',
    '更新主版本号',
  ];

  inquirer.prompt([
    {
      type: 'rawlist',
      message: '[npm] 请选择操作',
      name: 'type',
      choices,
    }
  ]).then(answers => {

    const { type } = answers;

    const index = choices.indexOf(type);

    switch (index) {
      case 0:
        terminal('npm login');
        break;
      case 1:
        terminal('npm logout');
        break;
      case 2:
        terminal('npm publish --access public');
        break;
      case 3:
        terminal('npm publish');
        break;
      case 4:
        terminal('npm version patch');
        break;
      case 5:
        terminal('npm version minor');
        break;
      case 6:
        terminal('npm version major');
        break;
      default:
        console.log('无法解析');
    }
  });
}

init();