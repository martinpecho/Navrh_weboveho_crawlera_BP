import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { RssService } from './services/rss.service';
import { EmailService } from './services/email.service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RssFromUrlComponent } from './rssFromUrl/rssFromUrl.component';
import { DetailComponent } from './detail/detail.component';
import { MaxDirective } from 'src/max.directive';
import { ExcelService } from './services/excel.service';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    RssFromUrlComponent,
    DetailComponent,
    MaxDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxSpinnerModule,
    BrowserAnimationsModule
  ],
  providers: [RssService, EmailService, ExcelService],
  bootstrap: [AppComponent]
})
export class AppModule { }
