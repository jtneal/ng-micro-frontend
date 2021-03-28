import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { MicroFrontendComponent } from './micro-frontend.component';
import { MicroComponent } from './micro.component';
import { NullComponent } from './null.component';

@NgModule({
  declarations: [
    MicroComponent,
    MicroFrontendComponent,
    NullComponent,
  ],
  exports: [
    MicroComponent,
    MicroFrontendComponent,
    NullComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
  ],
})
export class MicroFrontendModule { }
