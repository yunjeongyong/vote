/*
 * SPDX-License-Identifier: Apache-2.0
 */

import * as express from 'express';
import { Gateway, Wallets, Contract } from 'fabric-network';
import * as path from 'path';
import * as fs from 'fs';

const app = express();
const ccpPath = path.resolve(__dirname, '..', '..','test-network','organizations','peerOrganizations','nec.example.com', 'connection-nec.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
const walletPath = path.join(process.cwd(), 'wallet');

let votedCountsCheckedTime: number = 1;
let prevVotedCounts: any;

app.use(express.json());

async function doTransaction(req: express.Request, res: express.Response, next: express.NextFunction, callback: (contract: Contract) => Promise<void>) {
    try {
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if ( !identity ) {
            const message = 'An identity for the user "appUser" does not exist in the wallet.\nRun the registerUser.ts application before retrying.';
            res.status(500).json({message: message});
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('vote');

        // Do custom transaction using callback function.
        await callback(contract);

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch(err) {
        next(err);
    }
}

function bufferToObject(buffer: Buffer) {
    try {
        return JSON.parse(buffer.toString());
    } catch(err) {
        return {};
    }
}


/////////////////////////////////////////////////////////////////////////////////
//
//  CANDIDATE
//
/////////////////////////////////////////////////////////////////////////////////

// get all candidates
app.get('/api/candidates', async (req, res, next) => {
    doTransaction(req, res, next, async contract => {

        const result = await contract.evaluateTransaction('getAllCandidates');
        const obj = bufferToObject(result);
        res.json(obj);
    });
});

// get candidate
app.get('/api/candidates/:num', async (req, res, next) => {
    doTransaction(req, res, next, async contract => {

        const num = req.params.num;
        const result = await contract.evaluateTransaction('getCandidate', num);
        const obj = bufferToObject(result);
        res.json(obj);
    });
});

// register candidate
app.post('/api/candidate', async (req, res, next) => {
    doTransaction(req, res, next, async contract => {

        const num = req.body.num;
        const name = req.body.name;
        const party = req.body.party;
        await contract.evaluateTransaction('registerCandidate', num, name, party);
        res.status(204).json();
    });
});


/////////////////////////////////////////////////////////////////////////////////
//
//  PEOPLE
//
/////////////////////////////////////////////////////////////////////////////////

// get all people
app.get('/api/people', async (req, res, next) => {
    doTransaction(req, res, next, async contract => {

        const result = await contract.evaluateTransaction('getAllPeople');
        const obj = bufferToObject(result);
        res.json(obj);
    });
});

// get person
app.get('/api/people/:phone', async (req, res, next) => {
    doTransaction(req, res, next, async contract => {

        const phone = req.params.phone;
        const result = await contract.evaluateTransaction('getPerson', phone);
        const obj = bufferToObject(result);
        res.json(obj);
    });
});

// register person
app.post('/api/people', async (req, res, next) => {
    doTransaction(req, res, next, async contract => {

        const phone = req.body.phone;
        const birth = req.body.birth;
        const location = req.body.location;
        await contract.evaluateTransaction('registerPerson', phone, birth, location);
        res.status(204).json();
    });
});


/////////////////////////////////////////////////////////////////////////////////
//
//  ETC.
//
/////////////////////////////////////////////////////////////////////////////////

app.get('/api/monitor', async (req, res, next) => {
    doTransaction(req, res, next, async contract => {

        const millis = new Date().getTime();
        if ( millis - votedCountsCheckedTime < 1000 * 60 * 10 ) {
            // 이전 확인으로부터 10분이 아직 지나지 않음
            // 갱신되지 않은 결과를 리턴해줌
            res.json(prevVotedCounts);
            return;
        }

        const result = await contract.evaluateTransaction('monitorVotedCounts');

        const obj = bufferToObject(result);
        obj.checkedTime = millis;
        prevVotedCounts = obj;
        votedCountsCheckedTime = millis;

        res.json(obj);
    });
});

app.post('/api/vote', async (req, res, next) => {
    doTransaction(req, res, next, async contract => {

        const phone = req.params.phone;
        const num = req.params.num;
        const result = await contract.evaluateTransaction('doVote', phone, num);
        const b = bufferToObject(result);
        if ( b ) res.json({message: 'voted successfully'});
        else res.status(500).json({message: 'error while voting'});
    });
});


const port = 3000;
app.listen(port, () => console.log(`app listening at http://localhost:${port}`));
