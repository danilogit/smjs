/**
  * Generates data to use with http://visjs.org and show states as a network graph.
  */
const generateVis = (statesDefiniton) => {

    const initialState = statesDefiniton.initialState;
    statesDefiniton = statesDefiniton.states;


    let nodes = [];
    let edges = [];

    nodes.push({ id: 'start', label: 'Start', shape: 'circle', color: { background: '#fff' } });
    nodes.push({ id: 'end', label: 'End', shape: 'circle', color: { background: '#fff' } });
    edges.push({ id: `start.${initialState}`, from: 'start', to: initialState, arrows: 'to' });

    for (const currentState of statesDefiniton) {
        if (currentState.type === 'Task' || currentState.type === 'Pass') {
            nodes.push({ id: currentState.id, label: currentState.id, title: currentState.comment })
        } else if (currentState.type === 'Choice') {
            nodes.push({ id: currentState.id, label: currentState.id, title: currentState.comment, color: 'rgb(255,168,7)', shape: 'diamond' })
        } else if (currentState.type === 'Wait') {
            nodes.push({ id: currentState.id, label: `${currentState.id} (${currentState.timeout}ms)`, title: currentState.comment, shape: 'image', image: '/images/clock-sand.svg' })
        }
    }

    for (const currentState of statesDefiniton) {

        if (currentState.end) {
            edges.push({ id: `end.${currentState.id}`, from: currentState.id, to: 'end', arrows: 'to' });
        }

        if (currentState.type === 'Choice') {
            for (const choice of currentState.choices) {
                edges.push({ id: `${currentState.id}.${choice.nextState}`, from: currentState.id, to: choice.nextState, type: 'choice', arrows: 'to', label: `${(choice.label) ? choice.label : choice.condition + " " + choice.expect}` });
            }
        } else {
            edges.push({ id: `${currentState.id}.${currentState.nextState}`, from: currentState.id, to: currentState.nextState, arrows: 'to' });
            if (currentState['nextStateError'] != undefined) {
                edges.push({ id: `${currentState.id}.${currentState.nextStateError}`, font: { color: 'red' }, label: 'onError', from: currentState.id, to: currentState.nextStateError, arrows: 'to', color: { color: 'red', highlight: 'red' } });
            }
        }
    }

    return {
        nodes,
        edges,
    }
}

const smViewer = (statesDef, port = 7789) => {

    const express = require('express');
    const app = express();

    const staticDir = __dirname + '/public';
    app.use('/', express.static(staticDir));

    app.get('/api/v1/view', function (req, res) {
        const json = generateVis(statesDef);
        res.send(json);
    })

    app.listen(port, function () {
        console.log('URL:', 'http://localhost:' + port)
    })
}


module.exports = smViewer;