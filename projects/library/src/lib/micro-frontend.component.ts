import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Manifest } from './manifest';
import { MicroFrontendService } from './micro-frontend.service';

@Component({
  selector: 'mfe-micro-frontend',
  template: '<ng-container *ngIf="manifest$ | async as manifest"></ng-container>',
})
export class MicroFrontendComponent implements OnInit {
  public manifest$: Observable<Manifest>;

  public constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly microFrontend: MicroFrontendService,
    private readonly route: ActivatedRoute,
  ) { }

  public ngOnInit(): void {
    this.manifest$ = this.route.data.pipe(
      map((data) => data.baseUrl),
      switchMap((baseUrl) => this.microFrontend.createCustomElement(baseUrl, this.elementRef.nativeElement)),
    );
  }
}
