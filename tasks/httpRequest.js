const axios = require('axios');

const task = (prevState, currentState, sm) => {

    // {
    //     method: 'post',
    //     url: '/user/12345',
    //     data: {
    //       firstName: 'Fred',
    //       lastName: 'Flintstone'
    //     }
    //   }

    return axios(currentState.httpOptions);
}

module.exports = task;