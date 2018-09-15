const policies = require('./policies');
const api = require('./api');
const CYCLETIME = 30;

let availablePolicies;
let usedPolicies = [];
let activePolicies = 0;

let currentCycleTime = 0;
let activeTimer = false;

let allWorkers = [];
let currentWorkers = [];


function getRandNum() {
    return new Promise(async function(resolve, reject) {
        resolve(Math.floor((Math.random() * availablePolicies.length)));
    });
}

function removePolicy(policyIndex) {
    usedPolicies.push(availablePolicies[policyIndex]);
    availablePolicies.splice(policyIndex, 1);
}

function cycleTimer(){
    currentCycleTime = 0;
    activeTimer = true;

     let timer = setInterval(function(){
        currentCycleTime ++;
        if (currentCycleTime >= CYCLETIME){
            // Also send player to end rapport screen
            console.log("Time is up");
            clearInterval(timer);
        }
        else if (currentCycleTime%5 === 0){
            activePolicies ++;
        }
        console.log(currentCycleTime);

     },1000 );
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
        },
        getAllWorkers: function(){
            return allWorkers;
        },
        getCurrentWorkers: function(){
            return currentWorkers;
        },
        setAllWorkers: async function(){
            allWorkers = await api.getAllWorkers(allWorkers);
        },
        setCurrentWorkers: async function(){
            currentWorkers = await api.getCurrentWorkers(allWorkers, currentWorkers);
        },
        startCycleTimer: function(){
            if (!activeTimer){
                cycleTimer();
            }
        },
        getCurrentCycleTime: function(){
            return currentCycleTime;
        }
    }
};
