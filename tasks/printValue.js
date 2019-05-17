const jp = require('jsonpath');
const _ = require('lodash');

const task = (prevState, currentState, sm) => {

    const defaultProperties = {
        "variablePath": "$."
    }

   _.defaults(currentState, defaultProperties);

    const value = jp.value(prevState, currentState.variablePath);
    sm.log(`Value = ${value} `, false);
    return prevState.result;
}

module.exports = task;