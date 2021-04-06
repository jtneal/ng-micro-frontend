import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Manifest } from './manifest';
import { MicroFrontendService } from './micro-frontend.service';

@Component({
  selector: 'mfe-fragment',
  template: '<ng-container *ngIf="manifest$ | async as manifest"></ng-container>',
})
export class FragmentComponent implements OnInit {
  @Input()
  public baseUrl: string;

  public manifest$: Observable<Manifest>;

  public constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly microFrontend: MicroFrontendService,
  ) { }

  public ngOnInit(): void {
    this.manifest$ = this.microFrontend.createCustomElement(this.baseUrl, this.elementRef.nativeElement);
  }
}
