const policies = require('./policies');
const api = require('./api');
const CYCLETIME = 30;

let availablePolicies;
let usedPolicies = [];
let activePolicies = 0;
let policyDisplayed = false;
let currentPolicyIndex;

let currentCycleTime = 0;
let activeTimer = false;

let allWorkers = [];
let currentWorkers = [];


function getRandNum() {
    return new Promise(async function(resolve, reject) {
        resolve(Math.floor((Math.random() * availablePolicies.length)));
    });
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


     },1000 );
}

module.exports = function() {
    return {
        getRandPolicy : function() {
            return new Promise(async function(resolve, reject) {
                if (availablePolicies !== undefined) {
                    currentPolicyIndex = await getRandNum();
                    resolve(availablePolicies[currentPolicyIndex]);
                } else {
                    // https://medium.com/@gamshan001/javascript-deep-copy-for-array-and-object-97e3d4bc401a
                    let unParsed = await policies.getPolicies();
                    availablePolicies =  JSON.parse(JSON.stringify(unParsed));
                    currentPolicyIndex = await getRandNum();
                    resolve(availablePolicies[currentPolicyIndex]);
                }
            });
        },
        getActivePolicies: function() {
            return new Promise(function(resolve, reject) {
                resolve(activePolicies);
            });
        },
        getPolicyDisplayed: function() {
            return new Promise(function(resolve, reject) {
                resolve(policyDisplayed);
            });
        },
        setPolicyDisplayed: function(bool) {
            policyDisplayed = bool;
        },
        deleteFromAvailablePolcies: function removePolicy() {
            let policyIndex = currentPolicyIndex;
            usedPolicies.push(availablePolicies[policyIndex]);
            availablePolicies.splice(policyIndex, 1);
            activePolicies --;
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
        },
        getTotalCycleTime: function(){
            return CYCLETIME;
        }
    }
};
