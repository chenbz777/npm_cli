#!/usr/bin/env node

const fs = require('fs');
const exec = require('child_process').execSync;
const inquirer = require('inquirer');

function terminal(command) {
  return exec(command).toString();
}

function init() {
  inquirer.prompt([
    {
      type: 'rawlist',
      message: '[npm]请选择操作',
      name: 'type',
      choices: [
        '登录',
        '退出登录',
        '初次发布',
        '发布',
        '更新补丁号',
        '更新次版本号',
        '更新主版本号',
      ],
    }
  ]).then(answers => {

    const { type } = answers;

    switch (type) {
      case '登录':
        terminal('npm login');
        break;
      case '退出登录':
        terminal('npm logout');
        break;
      case '初次发布':
        terminal('npm publish --access public');
        break;
      case '发布':
        terminal('npm publish');
        break;
      case '更新补丁号':
        terminal('npm version patch');
        break;
      case '更新次版本号':
        terminal('npm version minor');
        break;
      case '更新主版本号':
        terminal('npm version major');
        break;
      default:
        console.log('无法解析');
    }
  });
}

init();