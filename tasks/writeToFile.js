const fs = require('fs');
const moment = require('moment');
const path = require('path');
const _ = require('lodash');
const jp = require('jsonpath');

const task = (prevState, currentState, sm) => {
   
    const defaultProperties = {
        "filename": `./${currentState.id}.txt`,
        "append": true,
        "variablePath": "$.result",
        "newLine": true,
        "timestamp": false
    }

   _.defaults(currentState, defaultProperties);
    return new Promise(async (resolve, reject) => {
        try {
            const value = jp.value(prevState, currentState.variablePath);
            let content = '';

            if (typeof value === "string") {
                content = value;
            } else {
                content = JSON.stringify(value);
            }

            if (currentState.timestamp) {
                content = `[${moment.utc().format()}] ${content}`;
            }

            if (currentState.newLine) {
                content = content + '\n';
            }

            if (currentState.append){
                fs.appendFileSync(path.resolve(currentState.filename), content);
            } else {
                fs.writeFileSync(path.resolve(currentState.filename), content);
            }
            
            return resolve(prevState.result);
        } catch (err) {
            return reject(err);
        }
    })
}

module.exports = task;