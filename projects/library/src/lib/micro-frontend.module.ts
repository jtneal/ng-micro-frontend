import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { MicroFrontendComponent } from './micro-frontend.component';

@NgModule({
  declarations: [MicroFrontendComponent],
  exports: [MicroFrontendComponent],
  imports: [
    CommonModule,
    HttpClientModule,
  ],
})
export class MicroFrontendModule { }
