/*
 * SPDX-License-Identifier: Apache-2.0
 * 
 * powered by yunjeongyong
 */

import { Context, Contract } from "fabric-contract-api";
import { Candidate } from "./candidate";
import { Person } from "./person";
import { generateBirth, generatePhone, stateValue, toInstance } from "./utils";

export class Vote extends Contract {

    async initLedger(ctx: Context) {
        console.log('initializing the chaincode');

        // DB에 유권자 등록
        console.log('add default people');
        for (let i=0; i<10; i++) {
            const person = new Person();
            person.phone = generatePhone();
            person.birth = generateBirth();
            person.location = 'LOC' + Math.floor(Math.random() * 5);
            person.key = this.key('P', person.phone);
            person.timestamp = undefined;
            await ctx.stub.putState(person.key, stateValue(person));
        }

        // DB에 후보 등록
        console.log('add default candidates');
        const names = [ 'John', 'Jack', 'Jane', 'William', 'Steve' ];
        for (let [i, name] of names.entries()) {
            const candidate: Candidate = {
                key: this.key('C', i + 1),
                num: i + 1,
                name: name,
                party: 'PARTY' + (i + 1),
                locations: {}
            };
            await ctx.stub.putState(candidate.key, stateValue(candidate));
        }

        console.log('initialized');
    }

    // 시민 등록 함수
    async registerPerson(ctx: Context, phone: string, birth: string, location: string) {
        try {
            const person: Person = {
                key: this.key('P', phone),
                phone: phone,
                birth: birth,
                location: location,
                timestamp: undefined
            };
            await ctx.stub.putState(person.key, stateValue(person));
            console.log('person registered');

        } catch(err) {
            console.log(err);
        }
    }

    // 특정 유권자를 불러오는 함수
    async getPerson(ctx: Context, phone: string) {
        try {
            const byteItem = await ctx.stub.getState(this.key('P', phone));
            if ( !byteItem || byteItem.length == 0 ) {
                throw new Error(`error on person '${phone}'`);
            }
            return <Candidate> toInstance(byteItem);

        } catch(err) {
            console.log(err);
        }
    }

    // 모든 유권자를 불러오는 함수
    async getAllPeople(ctx: Context) {
        try {
            const res = ctx.stub.getQueryResult(JSON.stringify({
                selector: {
                    _id: {
                        $regex: 'P+'
                    }
                }
            }));
            const results: Person[] = [];
            for await (const {key, value} of res) {
                const strValue = Buffer.from(value).toString('utf8');
                let record: Person;
                try {
                    record = JSON.parse(strValue);
                    record.key = key;
                } catch(err) {
                    console.log(err);
                    record = new Person();
                    record.key = key;
                }
                results.push(record);
            }
            return results;

        } catch(err) {
            console.log(err);
        }
    }

    // 후보 등록 함수
    async registerCandidate(ctx: Context, num: number, name: string, party: string) {
        try {
            const candidate: Candidate = {
                key: this.key('C', num),
                num: num,
                name: name,
                party: party,
                locations: {}
            };
            await ctx.stub.putState(candidate.key, stateValue(candidate));
            console.log('candidate registered');

        } catch(err) {
            console.log(err);
        }
    }

    // 특정 유권자를 불러오는 함수
    async getCandidate(ctx: Context, num: number) {
        try {
            const byteItem = await ctx.stub.getState(this.key('C', num));
            if ( !byteItem || byteItem.length == 0 ) {
                throw new Error(`error on candidate '${num}'`);
            }
            const candidate: Candidate = toInstance(byteItem);
            return candidate;

        } catch(err) {
            console.log(err);
        }
    }

    // 모든 유권자를 불러오는 함수
    async getAllCandidates(ctx: Context) {
        try {
            const res = ctx.stub.getQueryResult(JSON.stringify({
                selector: {
                    _id: {
                        $regex: 'C+'
                    }
                }
            }));
            const results: Candidate[] = [];
            for await (const {key, value} of res) {
                const strValue = Buffer.from(value).toString('utf8');
                let record: Candidate;
                try {
                    record = JSON.parse(strValue);
                    record.key = key;
                } catch(err) {
                    console.log(err);
                    record = new Candidate();
                    record.key = key;
                }
                results.push(record);
            }
            return results;

        } catch(err) {
            console.log(err);
        }
    }

    // 전체 득표 수를 확인하기 위함
    async monitorVotedCounts(ctx: Context) {
        try {
            // DB로부터 후보들을 불러옴
            const res = ctx.stub.getQueryResult(JSON.stringify({
                selector: {
                    _id: {
                        $regex: 'C+'
                    }
                }
            }));

            // 지역을 모으기 위한 map 인스턴스
            const votedMap: {
                [location: string]: {
                    [num: number]: number
                }
            } = {};

            // 최종 결과를 저장하기 위한 객체
            const votedCount: VotedCount = {
                entire: 0,
                ranking: [],
                locations: []
            };

            // DB로부터 불러온 후보들로부터 votedMap, votedCount 객체 만듦
            for await (const {key, value} of res) {
                const strValue = Buffer.from(value).toString('utf8');
                try {
                    const candidate: Candidate = JSON.parse(strValue);
                    const locations = Object.keys(candidate.locations);
                    votedCount.entire += locations.length;
                    votedCount.ranking.push({
                        num: candidate.num,
                        party: candidate.party,
                        name: candidate.name,
                        voted: locations.length
                    });
                    locations.map(location => {
                        if ( votedMap[location] === undefined ) {
                            votedMap[location] = {};
                            votedMap[location][candidate.num] = 1;
                        } else votedMap[location][candidate.num]++;
                    });
                } catch(err) {}
            }

            // votedMap으로부터 지역별 득표 현황 저장
            Object.keys(votedMap).map(location => {
                const candidates = Object.keys(votedMap[location]);
                const votedLocation: VotedLocation = {
                    location: location,
                    entire: candidates.length,
                    voted: {}
                };
                candidates.map(candidate => votedLocation.voted[candidate] = votedMap[location][candidate]);
                votedCount.locations.push(votedLocation);
            });

            return votedCount;

        } catch(err) {
            console.log(err);
        }
    }

    // 투표할 때 쓰는 함수
    async doVote(ctx: Context, phone: string, num: number) {
        try {
            // 입력받은 phone을 통해 DB로부터 유권자 정보를 가져옴
            const byteItem = await ctx.stub.getState(this.key('P', phone));
            // DB에 유권자가 없으면 에러
            if ( !byteItem || byteItem.length === 0 ) {
                throw new Error(`error on person '${phone}'`);
            }

            const person = <Person> toInstance(byteItem);
            // 이미 투표를 했으면 (timestamp 값이 존재하면) 에러
            if ( person.timestamp !== undefined ) {
                // throw new Error('already voted');
                return {
                    success: false,
                    message: 'already voted'
                };
            }

            // 유권자의 나이가 만 19세 이상인지를 확인하기 위한 코드
            const personDate = new Date(person.birth);
            // 현재 날짜
            const date = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000);

            // 만나이 계산
            let age = date.getFullYear() - personDate.getFullYear();
            personDate.setFullYear(date.getFullYear());
            if ( date.getTime() < personDate.getTime() ) age--;

            if ( age < 19 ) {
                throw new Error('too young to vote');
            }

            // DB로부터 num에 해당하는 후보 가져옴
            const candidateByteItem = await ctx.stub.getState(this.key('C', num));
            // 없으면 에러
            if ( !byteItem || byteItem.length === 0 ) {
                throw new Error(`error on candidate '${num}'`);
            }
            const candidate = <Candidate> toInstance(candidateByteItem);
            // locations에 유권자의 자역이 있으면 +1, 없으면 1로 설정
            if ( candidate.locations[person.location] ) candidate.locations[person.location]++;
            else candidate.locations[person.location] = 1;

            // 유권자에 투표 정보를 설정한 뒤 업데이트
            person.timestamp = ctx.stub.getTxTimestamp().seconds.low * 1000;
            person.voted = num;
            await ctx.stub.putState(person.key, stateValue(person));
            // 후보 업데이트
            await ctx.stub.putState(candidate.key, stateValue(candidate));

            // return true;
            return {
                success: true,
                message: undefined
            };

        } catch(err) {
            console.log(err);
            // return false;
            // return err;
            return {
                success: false,
                message: JSON.stringify(err)
            };
        }
    }

    private key(type: 'C' | 'P', id: number | string) {
        // C: Candidate, P: Person
        // 후보의 경우 id는 후보번호, 유권자의 경우 id는 핸드폰 번호
        return `${type}-${id}`;
    }


}


interface VotedRanking {
    num: number,
    party: string,
    name: string,
    voted: number
}

interface VotedLocation {
    location: string,
    entire: number,
    voted: { [num: number]: number }
}

interface VotedCount {
    entire: number,
    ranking: VotedRanking[],
    locations: VotedLocation[]
}
