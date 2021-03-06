import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RouteFactory } from 'projects/library/src/public-api';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  RouteFactory.createRoute('home', '/assets/examples/home'),
  RouteFactory.createRoute('about', '/assets/examples/about'),
  RouteFactory.createRoute('contact', '/assets/examples/contact'),
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
