const task = (prevState, currentState, sm) => {

    if (currentState.stringify){
        console.log("\n",JSON.stringify({prevState, currentState}));
    } else {
        console.log("\n",{prevState, currentState});
    }
    return prevState.result;
}
module.exports = task;