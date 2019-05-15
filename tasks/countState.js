const _ = require('lodash');


const task = (prevState, currentState, sm) => {

    const count = _.countBy(sm.getStateHistory(), {id: currentState.id});
    currentState['countRetries'] = count.true || 0;
    sm.log(`(Retries: ${currentState['countRetries']})`, false);
    return prevState.result;
}

//task();

module.exports = task;