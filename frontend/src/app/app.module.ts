import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { TitleService } from './services/title.service';
import { VoteService } from './services/vote.service';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { NoPageComponent } from './components/no-page/no-page.component';
import { VoteComponent } from './components/vote/vote.component';
import { ResultComponent } from './components/result/result.component';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'vote', component: VoteComponent },
  { path: 'result', component: ResultComponent },
  { path: 'no-page', component: NoPageComponent },
  { path: '**', component: NoPageComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NoPageComponent,
    VoteComponent,
    ResultComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot(appRoutes, {
      useHash: true,
      onSameUrlNavigation: 'reload',
      scrollPositionRestoration: 'enabled'
    }),
    HttpClientModule,
    FormsModule
  ],
  providers: [
    TitleService,
    VoteService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
