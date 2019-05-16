#!/usr/bin/env node

const StateMachine = require('../')
const path = require('path');
const program = require('commander');
const colors = require('colors');
const smViewer = require('./viewer/src');
const pkjson = require('../package.json');

program
    .version(pkjson.version)
    .command('run <definitionFile>')
    .action(function (definitionFile, cmd) {
        const filePath = path.resolve(definitionFile);
        const statesDef = require(filePath);
        const sm = new StateMachine(statesDef);
        try {
            sm.run();
        } catch (err) {
            console.log("[Error]", err);
        }
    });

program.command('view <definitionFile> [port]')
    .action(function (definitionFile, port) {
        const filePath = path.resolve(definitionFile);
        const statesDef = require(filePath);
        smViewer(statesDef, port);
    })

if (!process.argv.slice(2).length) {
    program.outputHelp(function (text) {
        return colors.red(text);
    });
}

program.parse(process.argv);