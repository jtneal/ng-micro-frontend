import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { MicroFrontendComponent } from './micro-frontend.component';
import { FragmentComponent } from './fragment.component';
import { NullComponent } from './null.component';

@NgModule({
  declarations: [
    FragmentComponent,
    MicroFrontendComponent,
    NullComponent,
  ],
  exports: [
    FragmentComponent,
    MicroFrontendComponent,
    NullComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
  ],
})
export class MicroFrontendModule { }
