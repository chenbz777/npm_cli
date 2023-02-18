#!/usr/bin/env node

const fs = require('fs');
const exec = require('child_process').execSync;
const inquirer = require('inquirer');

function terminal(command) {
  return exec(command).toString();
}

console.log(terminal('git commit -a -m "docs: 版本号"'));

init();

async function init() {
  const isGitInit = await gitInit();

  if (isGitInit) {
    main();
  }
}

async function gitInit() {

  let result = false;

  if (!fs.existsSync('./.git')) {

    const { isGitInit } = await inquirer.prompt([
      {
        type: 'confirm',
        message: '[提示] 检测到未初始化仓库,是否需要帮您初始化:',
        name: 'isGitInit',
        default: true,
      }
    ]);

    if (isGitInit) {
      console.log('[提示] 自动帮您初始化仓库');
      terminal('git init');

      result = true;
    } else {
      console.log('[提示] 未初始化仓库,无法进行后续操作!');

      result = false;
    }

  } else {
    result = true;
  }

  return result;
}

function main() {

  const choices = [
    '上推代码',
    '拉取代码',
    '提交代码到[本地]仓库',
    '分支管理',
    '克隆仓库',
    '修改远程地址',
  ];

  inquirer.prompt([
    {
      type: 'rawlist',
      message: '[git] 请选择操作',
      name: 'type',
      choices,
      loop: false,
    }
  ]).then(answers => {

    const { type } = answers;

    const index = choices.indexOf(type);

    switch (index) {
      case 0:
        pushCode();
        break;
      case 1:
        pullCode();
        break;
      case 2:
        submitCodeLocal();
        break;
      case 3:
        branchManagement();
        break;
      case 4:
        cloneRemote();
        break;
      case 5:
        updateRemoteUrl();
        break;
      default:
        console.log('无法解析');
    }
  });
}

async function pushCode() {

  await isGitRemoteUrl();

  const choices = [
    '新增一个功能',
    '修复一个Bug',
    '文档变更',
    '代码格式（不影响功能，例如空格、分号等格式修正）',
    '代码重构',
    '改善性能',
    '测试',
    '变更项目构建或外部依赖(例如scopes: webpack、gulp、npm等)',
    '更改持续集成软件的配置文件和package中的scripts命令, 例如scopes: Travis, Circle等',
    '变更构建流程或辅助工具',
    '代码回退',
  ];

  const commitTypeArr = [
    'feat:',
    'fix:',
    'docs:',
    'style:',
    'refactor:',
    'perf:',
    'test:',
    'build:',
    'ci:',
    'chore:',
    'revert:',
  ];

  const { branchLocalArr, branchRemoteArr } = branchList();

  const { localBranch, remoteBranch, commitType, commitText } = await inquirer.prompt([
    {
      type: 'list',
      message: '[输入] 请选择要提交[本地]哪个分支(默认 master):',
      name: 'localBranch',
      choices: branchLocalArr,
      loop: false,
      default: 'master',
      when: function (answers) {
        return branchLocalArr.length;
      }
    },
    {
      type: 'input',
      message: '[输入] 请输入要提交[本地]哪个分支(默认 master):',
      name: 'localBranch',
      default: 'master',
      when: function (answers) {
        return !branchLocalArr.length;
      }
    },
    {
      type: 'list',
      message: '[输入] 请选择要提交到[远程]哪个分支(默认 master):',
      name: 'remoteBranch',
      choices: branchRemoteArr,
      loop: false,
      default: 'master',
      when: function (answers) {
        return branchRemoteArr.length;
      }
    },
    {
      type: 'input',
      message: '[输入] 请输入要提交到[远程]哪个分支(默认 master):',
      name: 'remoteBranch',
      default: 'master',
      when: function (answers) {
        return !branchRemoteArr.length;
      }
    },
    {
      type: 'rawlist',
      message: '[输入] 选择本次提交性质(默认 1):',
      name: 'commitType',
      choices,
      loop: false,
      default: '新增一个功能',
    },
    {
      type: 'input',
      message: '[输入] 请输入本次提交描述:',
      name: 'commitText',
    },
  ]);

  const choicesIndex = choices.indexOf(commitType);

  console.log('[提示] 上推代码中...');

  terminal(`git commit -a -m "${commitTypeArr[choicesIndex]} ${commitText}"`);
  terminal(`git push origin ${localBranch}:${remoteBranch}`);

  console.log('[提示] 上推代码完成');
}

async function pullCode() {

  await isGitRemoteUrl();

  const { branchLocalArr, branchRemoteArr } = branchList();

  const { localBranch, remoteBranch } = await inquirer.prompt([
    {
      type: 'list',
      message: '[输入] 请选择要拉取[远程]哪个分支(默认 master):',
      name: 'remoteBranch',
      choices: branchRemoteArr,
      loop: false,
      default: 'master',
      when: function (answers) {
        return branchRemoteArr.length;
      }
    },
    {
      type: 'input',
      message: '[输入] 请输入要拉取[远程]哪个分支(默认 master):',
      name: 'remoteBranch',
      default: 'master',
      when: function (answers) {
        return !branchRemoteArr.length;
      }
    },
    {
      type: 'list',
      message: '[输入] 请选择要拉取到[本地]哪个分支(默认 master):',
      name: 'localBranch',
      choices: branchLocalArr,
      loop: false,
      default: 'master',
      when: function (answers) {
        return branchLocalArr.length;
      }
    },
    {
      type: 'input',
      message: '[输入] 请输入要拉取到[本地]哪个分支(默认 master):',
      name: 'localBranch',
      default: 'master',
      when: function (answers) {
        return !branchLocalArr.length;
      }
    },
  ]);

  console.log('[提示] 拉取代码中...');

  terminal(`git pull origin ${remoteBranch}:${localBranch}`);

  console.log('[提示] 拉取代码完成');
}

async function submitCodeLocal() {

  const choices = [
    '新增一个功能',
    '修复一个Bug',
    '文档变更',
    '代码格式（不影响功能，例如空格、分号等格式修正）',
    '代码重构',
    '改善性能',
    '测试',
    '变更项目构建或外部依赖(例如scopes: webpack、gulp、npm等)',
    '更改持续集成软件的配置文件和package中的scripts命令, 例如scopes: Travis, Circle等',
    '变更构建流程或辅助工具',
    '代码回退',
  ];

  const commitTypeArr = [
    'feat:',
    'fix:',
    'docs:',
    'style:',
    'refactor:',
    'perf:',
    'test:',
    'build:',
    'ci:',
    'chore:',
    'revert:',
  ];

  const { localNowBranch } = branchList();

  console.log(`[提示] 当前分支为: ${localNowBranch}`);

  const { commitType, commitText } = await inquirer.prompt([
    {
      type: 'rawlist',
      message: '[输入] 选择本次提交性质(默认 1):',
      name: 'commitType',
      choices,
      loop: false,
      default: '新增一个功能',
    },
    {
      type: 'input',
      message: '[输入] 请输入本次提交描述:',
      name: 'commitText',
    },
  ]);

  const choicesIndex = choices.indexOf(commitType);

  console.log('[提示] 代码提交中...');

  terminal(`git commit -a -m "${commitTypeArr[choicesIndex]} ${commitText}"`);

  console.log('[提示] 代码提交完成');
}

async function isGitRemoteUrl() {
  const oldGitRemoteUrl = terminal('git remote -v');

  if (!oldGitRemoteUrl) {
    console.log('[提示] 检测到未设置远程仓库地址');

    const { gitRemoteUrl } = await inquirer.prompt([
      {
        type: 'input',
        message: '[输入] 请输入远程仓库地址:',
        name: 'gitRemoteUrl'
      }
    ]);

    terminal(`git remote add origin ${gitRemoteUrl}`);
  }
}

function branchList() {
  const branchStr = terminal('git branch -a');
  const tempBranchArr = branchStr.split('\n');
  const branchLocalArr = [];
  const branchRemoteArr = [];
  let localNowBranch = '';

  tempBranchArr.forEach(branch => {
    if (branch) {
      let tempBranchStr = branch.replace(/\s*/g, '');

      if (tempBranchStr.indexOf('*') != -1) {
        localNowBranch = tempBranchStr.replace('*', '');
        tempBranchStr = tempBranchStr.replace('*', '');
      }

      if (tempBranchStr.indexOf('remotes/origin/') != -1) {
        branchRemoteArr.push(tempBranchStr.replace('remotes/origin/', ''));
      } else {
        branchLocalArr.push(tempBranchStr);
      }
    }
  });

  return {
    branchLocalArr,
    branchRemoteArr,
    localNowBranch,
  }
}

async function branchManagement() {

  const { branchLocalArr, branchRemoteArr, localNowBranch } = branchList();

  const choices = [
    '列出所有分支',
    '新建[本地]分支',
    '切换[本地]分支',
    '删除[本地]分支',
    '新建[远程]分支(新建后自动上传代码)',
    '关联[本地]分支到[远程]指定分支',
    '删除[远程]分支',
  ];

  const { branch_type } = await inquirer.prompt([
    {
      type: 'rawlist',
      message: '[输入] 选择要执行的内容(默认 1):',
      name: 'branch_type',
      choices,
      default: '列出所有分支',
    },
  ]);

  const index = choices.indexOf(branch_type);

  switch (index) {
    case 0:
      console.log(terminal('git branch -a'));

      break;
    case 1:
      const { branchName: branchName1, checkoutNewBranch } = await inquirer.prompt([
        {
          type: 'input',
          message: '[输入] 请输入分支名称:',
          name: 'branchName'
        },
        {
          type: 'confirm',
          message: '[输入] 是否需要切换到新分支:',
          name: 'checkoutNewBranch',
          default: true,
        }
      ]);

      terminal(`git branch ${branchName1}`);

      if (checkoutNewBranch) {
        terminal(`git checkout ${branchName1}`);
      }

      break;
    case 2:
      const { branchName: branchName2 } = await inquirer.prompt([
        {
          type: 'list',
          message: '[输入] 请选择[本地]分支名称:',
          name: 'branchName',
          choices: branchLocalArr,
        }
      ]);

      terminal(`git checkout ${branchName2}`);

      break;
    case 3:
      if (branchLocalArr.length === 0) {
        console.log('[提示] 无法读取到[本地]分支信息');
      } else if (branchLocalArr.length === 1) {
        console.log('[提示] 当前仅一个分支, 无法进行删除操作');
      } else {
        const { branchName: branchName3, switchNewBranchName } = await inquirer.prompt([
          {
            type: 'list',
            message: '[输入] 请选择要删除的[本地]分支名称:',
            name: 'branchName',
            choices: branchLocalArr,
          },
          {
            type: 'list',
            message: '[输入] 请选择要切换到新的[本地]分支名称:',
            name: 'switchNewBranchName',
            choices: branchLocalArr,
            when: function (answers) {

              branchLocalArr.splice(branchLocalArr.indexOf(answers.branchName), 1);

              return localNowBranch === answers.branchName;
            }
          }
        ]);

        if (switchNewBranchName) {
          terminal(`git checkout ${switchNewBranchName}`);
        }

        terminal(`git branch -D ${branchName3}`);
      }

      break;
    case 4:
      const { branchName: branchName4 } = await inquirer.prompt([
        {
          type: 'input',
          message: '[输入] 请输入分支名称:',
          name: 'branchName'
        }
      ]);

      if (branchLocalArr.indexOf(branchName4) === -1) {
        terminal(`git branch ${branchName4}`);
      }
      if (localNowBranch !== branchName4) {
        terminal(`git checkout ${branchName4}`);
      }

      terminal(`git push origin ${branchName4}`);
      terminal(`git branch --set-upstream-to=origin/${branchName4}`);

      break;
    case 5:
      const { branchRemoteName, branchLocalName } = await inquirer.prompt([
        {
          type: 'list',
          message: '[输入] 请选择[远程]分支名称:',
          name: 'branchRemoteName',
          choices: branchRemoteArr,
        },
        {
          type: 'list',
          message: '[输入] 请选择[本地]分支名称:',
          name: 'branchLocalName',
          choices: branchLocalArr,
          default: localNowBranch,
        }
      ]);

      terminal(`git branch --set-upstream-to=origin/${branchRemoteName} ${branchLocalName}`);

      break;
    case 6:
      const { branchName: branchName6 } = await inquirer.prompt([
        {
          type: 'list',
          message: '[输入] 请选择[远程]分支名称:',
          name: 'branchName',
          choices: branchRemoteArr,
        }
      ]);

      terminal(`git push origin --delete ${branchName6}`);

      break;
    default:
      console.log('无法解析');
  }
}

async function cloneRemote() {

  const { projectUrl, projectBranch } = await inquirer.prompt([
    {
      type: 'input',
      message: '[输入] 请输入仓库地址:',
      name: 'projectUrl',
    },
    {
      type: 'input',
      message: '[输入] 请输入要克隆的分支(默认 master):',
      name: 'projectBranch',
      default: 'master',
    }
  ]);

  terminal(`git clone -b ${projectBranch} ${projectUrl}`);
}

async function updateRemoteUrl() {

  const { gitRemoteUrl } = await inquirer.prompt([
    {
      type: 'input',
      message: '[输入] 请输入新的远程仓库地址:',
      name: 'gitRemoteUrl',
    },
  ]);

  const oldGitRemoteUrl = terminal('git remote -v');

  if (oldGitRemoteUrl) {
    terminal(`git remote set-url origin ${gitRemoteUrl}`);
  } else {
    terminal(`git remote add origin ${gitRemoteUrl}`);
  }
}
