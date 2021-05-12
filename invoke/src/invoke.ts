/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Gateway, Wallets } from 'fabric-network';
import * as path from 'path';
import * as fs from 'fs';

async function main() {
    try {
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

        // Submit the specified transaction.
        // await contract.submitTransaction.apply(null, process.argv.slice(2));
        // console.log(`Transaction has been submitted`);

        switch (process.argv.length - 2) {
            case 0:
                console.log('do nothing');
                process.exit(0);
            case 1:
                await contract.submitTransaction(process.argv[2]);
                break;
            case 2:
                await contract.submitTransaction(process.argv[2], process.argv[3]);
                break;
            case 3:
                await contract.submitTransaction(process.argv[2], process.argv[3], process.argv[4]);
                break;
            case 4:
                await contract.submitTransaction(process.argv[2], process.argv[3], process.argv[4], process.argv[5]);
                break;
        }
        console.log(`Transaction has been submitted`);

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();
