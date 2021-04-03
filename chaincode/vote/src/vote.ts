import { Context, Contract } from "fabric-contract-api";
import { Person } from "./person";
import { getItem, stateValue, toItem } from "./utils";

export class Vote extends Contract {

    async initLedger(context: Context) {
        console.log('initializing the chaincode');
        const people: Person[] = [];

        for (let [i, io] of ios.entries()) {
            await this.addItem(context, io);
            console.log(`added item:`);
            console.log(io);
            console.log();
        }
        console.log('initialized');
    }


}
