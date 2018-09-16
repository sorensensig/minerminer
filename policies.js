/*
The code snippet (1. fs) below has been sourced from:
https://nodejs.org/dist/latest-v6.x/docs/api/fs.html
The code snippet appears in its original form.
*/
const fs = require('fs');
/*
End code snippet (1. fs)
*/
const filePath = './policyInfo.txt';

function Policy(policyNumber, policyTitle, policyText, policyDenyOption, policyApproveOption, policyDenyOptionFunction, policyApproveOptionFunction){
    /* Constructor for the 'Policy' object.
    */
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
    /* Function that retrieves a string from 'policyInfo.txt' and makes the string into an object using the
    constructor above.
    */
    return new Promise(function(resolve, reject){
        /*The code snippet (2. fs) below has been adapted from:
        https://nodejs.org/dist/latest-v6.x/docs/api/fs.html
        The code snippet has been altered to work with the filepath of this code.
        */
        fs.readFile(filePath, function (err, data) {
            if (err) throw err;

            let fileAsString = data.toString();
            /*
            End code snippet (2. fs)
            */
            /*
            The code snippet (3. JavaScript String replace() Method) below has been adapted from:
            https://www.w3schools.com/jsref/jsref_replace.asp
            The code snippet has been altered to work with this specific case.
            */
            let lineFeedRemoved = fileAsString.replace(/\n/g, '');
            let carriageReturnRemoved = lineFeedRemoved.replace(/\r/g, '');
            /*
            End code snippet (3. JavaScript String replace() Method)
            */
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
        /* Function that creates all the policies on first run trough, and also sends back the array containing all
        policies.
        */
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