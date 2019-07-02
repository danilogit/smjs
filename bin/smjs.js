#!/usr/bin/env node

const StateMachine = require('../')
const path = require('path');
const program = require('commander');
const colors = require('colors');
const smViewer = require('./viewer/src');
const pkjson = require('../package.json');
const fs = require('fs');
const yaml = require('js-yaml');


const parseYaml = (filePath) => {
    
    if (!fs.existsSync(filePath)) {
        throw new Error(`File '${filePath}' not found.`);            
    }

    if (filePath.toLowerCase().indexOf('.yaml') !== -1) {
        return yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
    } else {
        return require(filePath);
    }

}

program
    .version(pkjson.version)
    .command('run <definitionFile>')
    .action(function (definitionFile, cmd) {
        const filePath = path.resolve(definitionFile);
        const statesDef = parseYaml(filePath);
        const sm = new StateMachine(statesDef);
        sm.run();
    });

program.command('view <definitionFile> [port]')
    .action(function (definitionFile, port) {
        const filePath = path.resolve(definitionFile);
        const statesDef = parseYaml(filePath);
        smViewer(statesDef, port);
    })

if (!process.argv.slice(2).length) {
    program.outputHelp(function (text) {
        return colors.red(text);
    });
}

try {
    program.parse(process.argv);
} catch (err) {
    console.log("Error:", err.message);
}