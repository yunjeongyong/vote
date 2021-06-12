import { Component, OnInit } from '@angular/core';
import { Candidate } from 'src/app/model/candidate';
import { TitleService } from 'src/app/services/title.service';
import { VoteData, VoteService } from 'src/app/services/vote.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  candidates: Candidate[] = [];

  constructor(
    private voteService: VoteService,
    private titleService: TitleService
  ) { }

  async ngOnInit() {
    this.titleService.setTitle('투표 시스템');
    this.candidates = await this.voteService.getAllCandidates();
  }

}
