export class Candidate {
    key?: string;
    num: number;
    name: string;
    party: string;
    locations: { [location: string]: number };
}
