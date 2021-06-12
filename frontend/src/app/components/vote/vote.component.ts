import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Candidate } from 'src/app/model/candidate';
import { Person } from 'src/app/model/person';
import { TitleService } from 'src/app/services/title.service';
import { VoteData, VoteService } from 'src/app/services/vote.service';

@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.css']
})
export class VoteComponent implements OnInit {

  candidates: Candidate[] = [];
  voteData: VoteData = {
    phone: undefined,
    num: 1
  };
  loading = false;

  people: Person[] = [];
  showPeople = false;

  constructor(
    private titleService: TitleService,
    private voteService: VoteService,
    private router: Router
  ) { }

  async ngOnInit() {
    this.titleService.setTitle('투표하기');
    this.candidates = await this.voteService.getAllCandidates();
    this.people = await this.voteService.getAllPeople();
  }

  async vote() {
    try {
      if ( !this.voteData.phone || this.voteData.phone === '' ) {
        alert('핸드폰 번호를 입력해주세요!!');
        return;
      }
      this.loading = true;
      const res = await this.voteService.doVote(this.voteData);
      this.loading = false;

      if ( res.success ) {
        alert('투표가 완료되었습니다.');
        this.router.navigate(['/result']);
      } else alert('투표하지 못했습니다:\n' + res.message);

    } catch(err) {
      alert('투표 중 에러가 발생했습니다.\n' + err);
    }
  }

}
