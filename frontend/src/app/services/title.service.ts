import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private static readonly SEPERATOR: string = ' :: ';

  constructor(
    private titleService: Title
  ) { }

  setTitle(...titleItems: string[]) {
    this.titleService.setTitle(titleItems.join(TitleService.SEPERATOR));
  }

}
