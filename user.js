const policies = require('./policies');
const api = require('./api');
const CYCLETIME = 120;

let availablePolicies;
let usedPolicies = [];
let activePolicies = 1;
let policyDisplayed = false;
let currentPolicyIndex;

let currentCycleTime = 0;
let activeTimer = false;

let allWorkers = [];
let currentWorkers = [];


function getRandNum() {
    /* Returns a random number between 0 and length of the 'availablePolicies' array. */
    return new Promise(async function(resolve, reject) {
        resolve(Math.floor((Math.random() * availablePolicies.length)));
    });
}

function cycleTimer(){
    /* Keeps track of total game time per month. When 'currentCycleTime' is equal to 'CYCLETIME' the timer stops
    */
    currentCycleTime = 0;
    activeTimer = true;

     let timer = setInterval(function(){
        currentCycleTime ++;
        if (currentCycleTime >= CYCLETIME){
            clearInterval(timer);
        }
        else if (currentCycleTime%30 === 0){
            activePolicies ++;
        }
     },1000 );
}

module.exports = function() {
    return {
        getRandPolicy : function() {
            /* Returns a random policy object from the 'availablePolicies' array.
            */
            return new Promise(async function(resolve, reject) {
                if (availablePolicies !== undefined) {
                    currentPolicyIndex = await getRandNum();
                    resolve(availablePolicies[currentPolicyIndex]);
                } else {
                    let unParsed = await policies.getPolicies();
                    /*
                    The code snippet (4. JavaScript Deep copy for array and object) below has been adapted from:
                    https://medium.com/@gamshan001/javascript-deep-copy-for-array-and-object-97e3d4bc401a
                    The code snippet appears mostly in its original form, except for changing some variable names.
                    */
                    availablePolicies =  JSON.parse(JSON.stringify(unParsed));
                    /*
                    End code snippet (4. JavaScript Deep copy for array and object)
                    */
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
        setAvailablePolicies : function() {
            availablePolicies = undefined;
        },
        setActivePolicies: function(){
            activePolicies = 1;
        },
        deleteFromAvailablePolicies: function removePolicy() {
            /* Removes used policies so that they won't appear again, and removes one from 'activePolicies' so that
            it does not display an endless loop of new policies.
            */
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
        },
        setCurrentCycleTime: function() {
            currentCycleTime = 0;
            activeTimer = false;
        }
    }
};
