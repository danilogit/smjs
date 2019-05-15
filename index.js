const jp = require('jsonpath');
const _ = require('lodash');
const fs = require('fs');
const logSymbols = require('log-symbols');
const path = require('path');
const boxen = require('boxen');

class StateMachine {

    constructor(config) {
        this.stateHistory = [];
        this.config = config;
    }

    log(message, newLine = true) {

        if (this.config.verbose !== true) return;

        if (newLine) {
            console.log(message);
        } else {
            process.stdout.write(message);
        }
    }

    getStateFromHistory(id) {
        return this.stateHistory.find(state => (state.id === id));
    }


    getTaskFromDir(taskName) {
        let task = null;
        let taskPathDefault = path.dirname(__filename) + `/tasks/${taskName}.js`;
        let taskPath = `${this.config.tasksDir}/${taskName}.js`;

        if (fs.existsSync(taskPathDefault)) {
            task = require(taskPathDefault);
        } else if (fs.existsSync(taskPath)) {
            task = require(taskPath);
        } else {
            throw new Error(`Task '${taskName}' not found.`);
        }
        return task;
    }

    async exec(currentState, prevState = null) {

        currentState = this.parseStateParameters(currentState);

        const startTime = new Date().getTime();
        this.log(`┣ ${currentState.id} `, false);
        let resultIcon = logSymbols.success;

        if (currentState.type === "Wait") {
            currentState['task'] = 'wait';
        }

        if (this.config.onEnterState != undefined) {
            this.config.onEnterState(currentState, prevState);
        }

        if (currentState.task) {
            try {
                const task = this.getTaskFromDir(currentState.task);
                currentState['result'] = await task(prevState, currentState, this);

            } catch (err) {
                resultIcon = logSymbols.error;
                if (currentState['nextStateError'] != undefined) {
                    currentState['result'] = err;
                    currentState['nextState'] = currentState['nextStateError'];
                } else {
                    if (currentState.onError !== undefined) {
                        currentState.onError(err);
                        return;
                    } else if (this.config.onError !== undefined) {
                        this.config.onError(err);
                        return;
                    } else {
                        throw new Error(err);
                    }
                }
            }
        } else {
            currentState['result'] = prevState.result;
        }


        if (this.config.onExitState != undefined) {
            this.config.onExitState(currentState, prevState);
        }

        const nextState = this.getNextState(currentState, prevState);
        currentState['executionTimeMillis'] = new Date().getTime() - startTime;
        this.stateHistory.push(currentState);
        this.log(`(${currentState['executionTimeMillis']}ms) ${resultIcon}`);
        
        if (nextState) {
            this.exec(nextState, currentState);
        } else {
            this.log("┗ End")
            this.log("Stopwatch: " + (new Date().getTime() - this.startedAt) + "ms");
        }
    }


    getNextState(currentState, prevState) {
        if (currentState.type === 'Task' || currentState.type === 'Wait') {
            return this.getStateById(currentState.nextState);
        } else if (currentState.type === 'Choice') {
            return this.nextStateFromChoice(currentState, prevState);
        }
    }

    nextStateFromChoice(currentState, prevState) {

        // OR
        // AND
        // ELSE

        const conditions = {
            equals: (choice) => {
                const value = jp.value(prevState, choice.variablePath);
                if (choice.expect == value) {
                    this.log(`(${choice.condition} Expect ${choice.expect}, got ${value})`, false);
                    return true;
                }
            },
            countGte: (choice) => {
                const value = jp.query(prevState, choice.variablePath);
                if (value.length >= choice.expect) {
                    this.log(`(${choice.condition} Expect ${choice.expect}, got ${value.length})`, false);
                    return true;
                }
            },
            countEquals: (choice) => {
                const value = jp.query(prevState, choice.variablePath);
                if (value.length == choice.expect) {
                    this.log(`(${choice.condition} Expect ${choice.expect}, got ${value.length})`, false);
                    return true;
                }
            },
            countNotEquals: (choice) => {
                const value = jp.query(prevState, choice.variablePath);
                if (value.length != choice.expect) {
                    this.log(`(${choice.condition} Expect ${choice.expect}, got ${value.length})`, false);
                    return true;
                }
            },
            countLte: (choice) => {
                const value = jp.query(prevState, choice.variablePath);
                if (value.length <= choice.expect) {
                    this.log(`(${choice.condition} Expect ${choice.expect}, got ${value.length})`, false);
                    return true;
                }
            },
            countLt: (choice) => {
                const value = jp.query(prevState, choice.variablePath);
                if (value.length < choice.expect) {
                    this.log(`(${choice.condition} Expect ${choice.expect}, got ${value.length})`, false);
                    return true;
                }
            }
        }

        for (const choice of currentState.choices) {

            const nextState = conditions[choice.condition](choice);
            if (nextState) {
                return this.getStateById(choice.nextState);
            }
        }

    }

    parseStateParameters (state) {
        let stateParsed = Object.assign({},state);
        for (let param of Object.keys(this.config.parameters))  {
            for(let prop of Object.keys(state)){
                const regex = new RegExp(`{${param}}`, 'g');
                if (typeof stateParsed[prop] === 'string'){
                    stateParsed[prop] = stateParsed[prop].replace(regex, this.config.parameters[param])
                } else {
                    stateParsed[prop] = stateParsed[prop];
                }
            }
        }
        return stateParsed;
    }

    getStateById(id) {
        return this.config.states.find(item => item.id === id);
    }

    getStateHistory() {
        return this.stateHistory;
    }

    getLastStateFromHistory(id) {
        return this.stateHistory.reverse().find(item => item.id === id);
    }

    getParameter(name) {
        return this.config.parameters[name];
    }

    run() {
        this.startedAt = new Date().getTime();
        this.log(boxen('State Machine v1.0\nTasks dir: ' + this.config.tasksDir));
        this.log(`┏ Start`);
        return this.exec(this.getStateById(this.config.initialState));
    }

    
}

module.exports = StateMachine;