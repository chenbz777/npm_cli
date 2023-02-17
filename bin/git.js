#!/usr/bin/env node

const fs = require('fs');
const exec = require('child_process').execSync;
const inquirer = require('inquirer');

function terminal(command) {
  return exec(command).toString();
}

git_init();

async function git_init() {
  if (!fs.existsSync('./.git')) {

    const { git_init } = await inquirer.prompt([
      {
        type: 'confirm',
        message: '[提示] 检测到未初始化仓库,是否需要帮您初始化:',
        name: 'git_init',
        default: true,
      }
    ]);

    if (git_init) {
      console.log('[提示] 自动帮您初始化仓库');
      terminal('git init');

      init();
    } else {
      console.log('❌ 未初始化仓库,无法进行后续操作!');
    }

  } else {
    init();
  }
}

function init() {

  const choices = [
    '上传代码',
    '分支管理',
    '克隆仓库',
    '修改远程地址',
  ];

  const prompList = [
    {
      type: 'rawlist',
      message: '[git] 请选择操作',
      name: 'type',
      choices,
    }
  ];

  inquirer.prompt(prompList).then(answers => {

    const { type } = answers;

    const index = choices.indexOf(type);

    switch (index) {
      case 0:
        upload_code();
        break;
      case 1:
        branch_management();
        break;
      case 2:
        clone_remote();
        break;
      case 3:
        update_remote_url();
        break;
      default:
        console.log('无法解析');
    }
  });
}

async function upload_code() {

  console.log('[提示] 上传代码');

  let git_remote_url = terminal('git remote -v');

  if (!git_remote_url) {
    console.log('[提示] 检测到未设置远程仓库地址');
    const { text } = await inquirer.prompt([
      {
        type: 'input',
        message: '[输入] 请输入远程仓库地址:',
        name: 'text'
      }
    ]);

    git_remote_url = text;

    terminal(`git remote add origin ${git_remote_url}`);
  } else {
    console.log('[提示] 读取到远程仓库地址:');
    console.log(terminal('git remote -v'));
  }

  // console.log('[提示] 列出所有分支');
  // console.log(terminal('git branch -a'));

  const choices = [
    '新增一个功能',
    '修复一个Bug',
    '文档变更',
    '代码格式（不影响功能，例如空格、分号等格式修正）',
    '代码重构',
    '改善性能',
    '测试',
    '变更项目构建或外部依赖（例如scopes: webpack、gulp、npm等）',
    '更改持续集成软件的配置文件和package中的scripts命令，例如scopes: Travis, Circle等',
    '变更构建流程或辅助工具',
    '代码回退',
  ];

  const commit_type_arr = [
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

  const { branch_local_arr, branch_remote_arr } = branch_list();

  if (branch_local_arr.length === 0) {
    branch_local_arr.push('master');
  }

  if (branch_remote_arr.length === 0) {
    branch_remote_arr.push('master');
  }

  const { local_branch, remote_branch, commit_type, commit_m } = await inquirer.prompt([
    // {
    //   type: 'input',
    //   message: '[输入] 请输入要提交[本地]哪个分支(默认 master):',
    //   name: 'local_branch',
    //   default: 'master',
    // },
    {
      type: 'list',
      message: '[输入] 请选择要提交[本地]哪个分支(默认 master):',
      name: 'local_branch',
      choices: branch_local_arr,
      default: 'master',
    },
    // {
    //   type: 'input',
    //   message: '[输入] 请输入要提交到[远程]哪个分支(默认 master):',
    //   name: 'remote_branch',
    //   default: 'master',
    // },
    {
      type: 'list',
      message: '[输入] 请选择要提交到[远程]哪个分支(默认 master):',
      name: 'remote_branch',
      choices: branch_remote_arr,
      default: 'master',
    },
    {
      type: 'rawlist',
      message: '[输入] 选择本次提交性质(默认 1):',
      name: 'commit_type',
      choices,
      default: '新增一个功能',
    },
    {
      type: 'input',
      message: '[输入] 请输入本次提交描述:',
      name: 'commit_m',
    },
  ]);

  const choices_index = choices.indexOf(commit_type);

  console.log('[提示] 上传代码中...');

  terminal('git add .');
  terminal(`git commit -m "${commit_type_arr[choices_index]} ${commit_m}"`);
  terminal(`git push origin ${local_branch}:${remote_branch}`);

  console.log('[提示] 上传代码完成');
}

function branch_list() {
  const branch_str = terminal('git branch -a');
  const temp_branch_arr = branch_str.split('\n');
  const branch_local_arr = [];
  const branch_remote_arr = [];
  let local_now_branch = '';

  temp_branch_arr.forEach(branch => {
    if (branch) {
      let temp_branch_str = branch.replace(/\s*/g, '');

      if (temp_branch_str.indexOf('*') != -1) {
        local_now_branch = temp_branch_str.replace('*', '');
        temp_branch_str = temp_branch_str.replace('*', '');
      }

      if (temp_branch_str.indexOf('remotes/origin/') != -1) {
        const temp_branch_text = temp_branch_str.replace('remotes/origin/', '');

        branch_remote_arr.push(temp_branch_text);
      } else {
        branch_local_arr.push(temp_branch_str);
      }
    }
  });

  return {
    branch_local_arr,
    branch_remote_arr,
    local_now_branch,
  }
}

async function branch_management() {

  // console.log('[提示] 分支管理');

  // console.log('[提示] 列出所有分支');
  console.log(terminal('git branch -a'));

  const { branch_local_arr, branch_remote_arr, local_now_branch } = branch_list();

  const { branch_type } = await inquirer.prompt([
    {
      type: 'rawlist',
      message: '[输入] 选择要执行的内容(默认 1):',
      name: 'branch_type',
      choices: [
        '列出所有分支',
        '新建[本地]分支',
        '切换[本地]分支',
        '删除[本地]分支',
        '新建[远程]分支(新建后自动上传代码)',
        '关联[本地]分支到[远程]指定分支',
        '删除[远程]分支',
      ],
      default: '列出所有分支',
    },
  ]);

  switch (branch_type) {
    case '列出所有分支':
      console.log(terminal('git branch -a'));
      break;
    case '新建[本地]分支':
      const { branch_name: branch_name1 } = await inquirer.prompt([
        {
          type: 'input',
          message: '[输入] 请输入分支名称:',
          name: 'branch_name'
        }
      ]);

      terminal(`git branch ${branch_name1}`);

      break;
    case '切换[本地]分支':
      const { branch_name: branch_name2 } = await inquirer.prompt([
        {
          type: 'list',
          message: '[输入] 请选择[本地]分支名称:',
          name: 'branch_name',
          choices: branch_local_arr,
        }
      ]);

      terminal(`git checkout ${branch_name2}`);

      break;
    case '删除[本地]分支':
      const { branch_name: branch_name3 } = await inquirer.prompt([
        {
          type: 'list',
          message: '[输入] 请选择[本地]分支名称:',
          name: 'branch_name',
          choices: branch_local_arr,
        }
      ]);

      terminal(`git branch -D ${branch_name3}`);

      break;
    case '新建[远程]分支(新建后自动上传代码)':
      const { branch_name: branch_name4 } = await inquirer.prompt([
        {
          type: 'input',
          message: '[输入] 请输入分支名称:',
          name: 'branch_name'
        }
      ]);

      if (branch_local_arr.indexOf(branch_name4) === -1) {
        terminal(`git branch ${branch_name4}`);
      }
      if (local_now_branch !== branch_name4) {
        terminal(`git checkout ${branch_name4}`);
      }

      terminal(`git push origin ${branch_name4}`);
      terminal(`git branch --set-upstream-to=origin/${branch_name4}`);

      break;
    case '关联[本地]分支到[远程]指定分支':
      const { branch_name: branch_name5 } = await inquirer.prompt([
        {
          type: 'list',
          message: '[输入] 请选择[远程]分支名称:',
          name: 'branch_name',
          choices: branch_remote_arr,
        }
      ]);

      terminal(`git branch --set-upstream-to=origin/${branch_name5}`);

      break;
    case '删除[远程]分支':
      const { branch_name: branch_name6 } = await inquirer.prompt([
        {
          type: 'list',
          message: '[输入] 请选择[远程]分支名称:',
          name: 'branch_name',
          choices: branch_remote_arr,
        }
      ]);

      terminal(`git push origin --delete ${branch_name6}`);

      break;
    default:
      console.log('无法解析');
  }
}

async function clone_remote() {

  console.log('[提示] 克隆仓库');

  const { project_url, project_branch } = await inquirer.prompt([
    {
      type: 'input',
      message: '[输入] 请输入仓库地址:',
      name: 'project_url',
    },
    {
      type: 'input',
      message: '[输入] 请输入要克隆的分支(默认 master):',
      name: 'project_branch',
      default: 'master',
    }
  ]);

  terminal(`git clone -b ${project_branch} ${project_url}`);
}

async function update_remote_url() {

  console.log('[提示] 修改远程地址');

  const { git_remote_url } = await inquirer.prompt([
    {
      type: 'input',
      message: '[输入] 请输入新的远程仓库地址:',
      name: 'git_remote_url',
    },
  ]);

  const old_git_remote_url = terminal('git remote -v');

  if (old_git_remote_url) {
    terminal(`git remote set-url origin ${git_remote_url}`);
  } else {
    terminal(`git remote add origin ${git_remote_url}`);
  }
}
