const result = (prevState, currentState, sm) => {
    return new Promise((resolve, reject) => setTimeout(() => resolve(prevState.result), currentState.timeout));
}

module.exports = result;