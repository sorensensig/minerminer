// https://nodejs.org/dist/latest-v6.x/docs/api/fs.html
const fs = require('fs');
const filePath = './policyInfo.txt';

function Policy(policyNumber, policyTitle, policyText, policyDenyOption, policyApproveOption, policyDenyOptionFunction, policyApproveOptionFunction){
    this.policyNumber = policyNumber;
    this.policyTitle = policyTitle;
    this.policyText = policyText;
    this.policyDenyOption = policyDenyOption;
    this.policyApproveOption = policyApproveOption;
    this.policyDenyOptionFunction = policyDenyOptionFunction;
    this.policyApproveOptionFunction = policyApproveOptionFunction;
}

let allPolicies = [];

function createPolicies() {
    return new Promise(function(resolve, reject){
        // read file and create policies.
        fs.readFile(filePath, function (err, data) {
            if (err) throw err;

            let fileAsString = data.toString();
            // https://www.w3schools.com/jsref/jsref_replace.asp
            let lineFeedRemoved = fileAsString.replace(/\n/g, '');
            let carriageReturnRemoved = lineFeedRemoved.replace(/\r/g, '');
            // end source
            let objectsAsStringArray = carriageReturnRemoved.split('*');

            for (let i = 0; i < objectsAsStringArray.length; i++) {
                let toObject = objectsAsStringArray[i].split(' ~ ');
                allPolicies[i] = new Policy(i, toObject[0], toObject[1], toObject[2], toObject[3], toObject[4], toObject[5]);
            }
            resolve();
        });
    })
}

module.exports = {
    getPolicies : function() {
        return new Promise(async function(resolve, reject) {
            if(allPolicies.length > 0) {
                resolve(allPolicies);
            } else {
                await createPolicies();
                resolve(allPolicies);
            }
        });
    }
};