import { Component, OnInit } from '@angular/core';
import { Candidate } from 'src/app/model/candidate';
import { TitleService } from 'src/app/services/title.service';
import { VoteService } from 'src/app/services/vote.service';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {

  loadingVotedCount: boolean = false;
  votedCount: VotedCount;
  checkedTime: string;

  constructor(
    private titleService: TitleService,
    private voteService: VoteService
  ) { }

  async ngOnInit() {
    this.titleService.setTitle('투표 결과');
    this.monitor();
  }

  async monitor() {
    this.loadingVotedCount = true;
    this.votedCount = await this.voteService.monitorVotedCounts();
    this.loadingVotedCount = false;

    const date = new Date();
    this.checkedTime = `확인 시간 : ${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours()}시 ${date.getMinutes()}분 ${date.getSeconds()}초`;
  }

  locationVotedToString(voted: { [num: string]: number }) {
    const arr = [];
    Object.keys(voted).map(num => arr.push(`기호 ${num}번 : ${voted[num]}표`));
    return arr.join('\n');
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
