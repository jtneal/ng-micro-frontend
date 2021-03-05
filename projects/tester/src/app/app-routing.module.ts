import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MicroFrontendComponent } from 'projects/library/src/public-api';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    component: MicroFrontendComponent,
    data: {
      baseUrl: '/assets/examples/home',
    },
    path: 'home',
  },
  {
    component: MicroFrontendComponent,
    data: {
      baseUrl: '/assets/examples/about',
    },
    path: 'about',
  },
  {
    component: MicroFrontendComponent,
    data: {
      baseUrl: '/assets/examples/contact',
    },
    path: 'contact',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
