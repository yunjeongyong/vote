/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * powered by yunjeongyong
 */

import { Gateway, Wallets } from 'fabric-network';
import * as path from 'path';
import * as fs from 'fs';


async function main() {
    try {
        if ( process.argv.length < 2 ) {
            console.log('need least 1 parameter');
            process.exit(0);
        }

        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..','test-network','organizations','peerOrganizations','nec.example.com', 'connection-nec.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.ts application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('vote');

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')

        let result: Buffer;
        switch (process.argv.length - 2) {
            case 0:
                console.log('do nothing');
                process.exit(0);
            case 1:
                result = await contract.evaluateTransaction(process.argv[2]);
                break;
            case 2:
                result = await contract.evaluateTransaction(process.argv[2], process.argv[3]);
                break;
            case 3:
                result = await contract.evaluateTransaction(process.argv[2], process.argv[3], process.argv[4]);
                break;
            case 4:
                result = await contract.evaluateTransaction(process.argv[2], process.argv[3], process.argv[4], process.argv[5]);
                break;
        }
        console.log(`Transaction has been evaluated`);
        const s = result.toString();
        try {
            console.log( JSON.stringify(JSON.parse(s), null, 2) );
        } catch(err) {
            if ( s ) console.log(s);
        }

        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

main();
