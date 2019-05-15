const util = require('util');
const childProcess = require('child_process');
const exec = util.promisify(childProcess.exec);
const path = require('path');

const task = (prevState, currentState, sm) => {
    return new Promise(async (resolve, reject) => {
        const execOptions = {
            cwd: currentState.cwd,
            maxBuffer: 1024 * 1024 * 20
        }
        try {
            const result = await exec(`${currentState.file}`, execOptions);
            return resolve(result);
        } catch (err) {
            return reject(err);
        }
    })
}

module.exports = task;