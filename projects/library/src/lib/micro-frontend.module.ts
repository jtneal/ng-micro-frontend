import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { MicroFrontendComponent } from './micro-frontend.component';
import { NullComponent } from './null.component';

@NgModule({
  declarations: [
    MicroFrontendComponent,
    NullComponent,
  ],
  exports: [
    MicroFrontendComponent,
    NullComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
  ],
})
export class MicroFrontendModule { }
