const shell = require('shelljs');

const SOURCE_DIST = '../live';
const PUBLISH_DIST = '../live-dist-result';
const NEW_BRANCH_NAME = 'feature/live-test1234567';

/**
 * 初始化本地仓库， 如果有，就不创建。
 */
function initRepos() {
    if (!shell.test('-d', PUBLISH_DIST)) {
        // 初始化仓库
        if (shell.exec(`git clone git@git.dz11.com:FED/fed_arch/live_dist.git ${PUBLISH_DIST}`).code !== 0) {
            shell.echo('Error: Git clone failed');
            shell.exit(1);
        }
    }
}

/**
 * 1. 将编译之后的源代码(dist目录)， 复制到要发布的项目(live_dist/dist)的dist目录中。
 * 2. 然后提交和push 到仓库中。
 */
function copyAndPushDistFolder() {
    shell.cp('-rf', `${SOURCE_DIST}/dist`, 'dist');

    shell.exec('git add .');

    shell.exec(`git commit -m 初始化${NEW_BRANCH_NAME}分支内容`, (code) => {
        if (code === 0) {
            // push 到远程分支。
            shell.exec(`git push origin ${NEW_BRANCH_NAME}`);
        }
    });
}

/**
 * 1. 移除分支中已有的dist文件夹， 然后提交到远程分支。
 * 2. 将编译之后的源代码(dist目录)， 复制到要发布的项目(live_dist/dist)的dist目录中。
 * 3. 然后提交和push 到仓库中。
 */
function clearAndPushDistFoler() {
    shell.rm('-rf', 'dist');

    // 清空远程分支的内容
    shell.exec('git add .');

    shell.exec(`git commit -m 清空${NEW_BRANCH_NAME}分支内容`, (code) => {
        if (code === 0) {
            // push 到远程分支。
            shell.exec(`git push origin ${NEW_BRANCH_NAME}`, (pushCode) => {
                if (pushCode === 0) {
                    // 拷贝项目的dist 目录到要发布的dist 目录。
                    copyAndPushDistFolder();
                }
            });
        }
    });
}

/**
 * 创建本地分支
 * 1. 如果有本地分支， 则不创建， 直接移除dist目录， 然后拷贝最新的dist 到分支中， 提交。
 * 2. 如果没有本地分支，创建， 移除dist目录，然后拷贝最新的dist 到分支中， 提交。
 */
function initLocalBranch() {
    // 进入仓库目录
    shell.cd(PUBLISH_DIST);

    // 判断分支是否存在
    shell.exec(`git show-ref refs/heads/${NEW_BRANCH_NAME}`, (code, stdout) => {
        if (stdout) {
            shell.echo(`${NEW_BRANCH_NAME} 分支已经存在， 清空dist中的内容`);
            clearAndPushDistFoler();
        } else {
            shell.echo(`开始创建 ${NEW_BRANCH_NAME} 分支`);

            if (shell.exec(`git checkout -b ${NEW_BRANCH_NAME} origin/master`).code === 0) {
                shell.echo(`分支：${NEW_BRANCH_NAME} 创建成功`);

                clearAndPushDistFoler();
            }
        }
    });
}

/**
 * @param branchName: 分支的名字。
 * 删除分支
 * 1. 删除本地分支
 * 2. 删除远程分支
 */
function deleteBranch(branchName) {
    shell.cd(PUBLISH_DIST);

    shell.exec(`git branch -D ${branchName}`, (code) => {
        if (code === 0) {
            // 删除远程分支
            if (shell.exec(`git push origin  --delete ${branchName}`).code === 0) {
                shell.echo(`分支：${NEW_BRANCH_NAME} 删除成功`);
            }
        }
    });
}

function run() {
    // 初始化本地仓库。

    shell.exec(`git branch -r | sed 's\/  origin\\///'`);
    // 初始化本地分支。
}

// 执行
run();

