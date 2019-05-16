# smjs
---

## Installation
```
npm install @danilolima/smjs -g
```

## States Example
```json
{
    "name": "states-example",
    "initialState": "task-1",
    "parameters": {
        "NAME": "Danilo"
    },
    "tasksDir": "./tasks",
    "verbose": true,
    "states": [
        {
            "type": "Task",
            "id": "task-1",
            "nextState": "task-2"
        },
        {
            "type": "Task",
            "id": "task-2",
            "nextState": "task-3"
        },
        {
            "type": "Task",
            "id": "task-3",
            "task": "countState",
            "nextState": "choice-1"
        },
        {
            "type": "Choice",
            "id": "choice-1",
            "choices": [
                {
                    "variablePath": "$.countRetries",
                    "condition": "equals",
                    "expect": 4,
                    "nextState": "max-retries-reached",
                    "label": "maxRetries"
                },
                {
                    "variablePath": "$.result",
                    "condition": "countGte",
                    "expect": 2,
                    "nextState": "task-2"
                },
                {
                    "variablePath": "$.result",
                    "condition": "countEquals",
                    "expect": 0,
                    "nextState": "finish"
                }
            ]
        },
        {
            "type": "Wait",
            "id": "wait-1",
            "nextState": "finish",
            "timeout": 1000
        },
        {
            "type": "Task",
            "id": "max-retries-reached",
            "nextState": "wait-1"
        },
        {
            "type": "Task",
            "id": "finish",
            "end": true
        }
    ]
}
```

### Running
```
smjs run states.json
```
### Visualizing

```
smjs view states.json
```

## Built-In Tasks

### wait
| Field | Description |
|-------|-------------|
|timeout|Set timeout value |
