import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Candidate } from '../model/candidate';
import { Person } from '../model/person';

@Injectable({
  providedIn: 'root'
})
export class VoteService {

  constructor(
    private http: HttpClient
  ) { }

  async getAllCandidates() {
    try {
      const candidates = await this.http.get<Candidate[]>(`/api/candidates`).pipe().toPromise();
      return candidates;

    } catch(err) {
      return <Candidate[]> [];
    }
  }

  async getCandidate(num: number) {
    try {
      const candidate = await this.http.get<Candidate>(`/api/${num}`).pipe().toPromise();
      return candidate;

    } catch(err) {
      return undefined;
    }
  }

  async getAllPeople() {
    try {
      const people = await this.http.get<Person[]>(`/api/people`).pipe().toPromise();
      return people;

    } catch(err) {
      return <Person[]> [];
    }
  }

  async getPerson(phone: string) {
    try {
      const person = await this.http.get<Person>(`/api/people/${phone}`).pipe().toPromise();
      return person;

    } catch(err) {
      return undefined;
    }
  }

  async monitorVotedCounts() {
    try {
      const result = await this.http.get<any>(`/api/monitor`).pipe().toPromise();
      return result;

    } catch(err) {
      return undefined;
    }
  }

  async doVote(data: VoteData): Promise<VoteResponse> {
    try {
      const res = await this.http.post<VoteResponse>('/api/vote', data).pipe().toPromise();
      return res;

    } catch(err) {
      console.log(err);
      return {
        success: false,
        message: JSON.stringify(err)
      };
    }
  }

}

export interface VoteData {
  phone: string,
  num: number
}

interface VoteResponse {
  success: boolean,
  message: string
};
