import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { FragmentComponent } from './fragment.component';
import { MicroFrontendService } from './micro-frontend.service';

describe('FragmentComponent', () => {
  const mock = {
    customElement: 'customElement',
    'main.js': 'main.js',
    'polyfills.js': 'polyfills.js',
    'styles.css': 'styles.css',
  };
  let component: FragmentComponent;
  let fixture: ComponentFixture<FragmentComponent>;
  let service: MicroFrontendService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FragmentComponent],
      imports: [HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FragmentComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(MicroFrontendService);
    spyOn(service, 'createCustomElement').and.returnValue(of(mock));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
