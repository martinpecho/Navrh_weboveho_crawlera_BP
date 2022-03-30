import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DetailComponent } from './detail/detail.component';
import { RssFromUrlComponent } from './rssFromUrl/rssFromUrl.component';
/** definicia smerovania v aplikacii */
const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, pathMatch: 'full' },
  { path: 'fromUrl', component: RssFromUrlComponent, pathMatch: 'full'},
  { path: 'detail', component: DetailComponent, pathMatch: 'full'},
  { path: 'detail/:task', component: DetailComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
