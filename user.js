const policies = require('./policies');
const api = require('./api');

let availablePolicies;
let usedPolicies = [];

function getRandNum() {
    return new Promise(async function(resolve, reject) {
        resolve(Math.floor((Math.random() * availablePolicies.length)));
    });
}

function removePolicy(policyIndex) {
    usedPolicies.push(availablePolicies[policyIndex]);
    availablePolicies.splice(policyIndex, 1);
}

module.exports = function() {
    return {
        getRandPolicy : function() {
            return new Promise(async function(resolve, reject) {
                if (availablePolicies !== undefined) {
                    let index = await getRandNum();
                    resolve(availablePolicies[index]);
                } else {
                    // https://medium.com/@gamshan001/javascript-deep-copy-for-array-and-object-97e3d4bc401a
                    let unParsed = await policies.getPolicies();
                    availablePolicies =  JSON.parse(JSON.stringify(unParsed));
                    let index = await getRandNum();
                    resolve(availablePolicies[index]);
                }
            });
        }
    }
};
