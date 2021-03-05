import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { MicroFrontendComponent } from './micro-frontend.component';
import { MicroFrontendService } from './micro-frontend.service';

describe('MicroFrontendComponent', () => {
  const mock = {
    customElement: 'customElement',
    'main.js': 'main.js',
    'polyfills.js': 'polyfills.js',
    'styles.css': 'styles.css',
  };
  let component: MicroFrontendComponent;
  let fixture: ComponentFixture<MicroFrontendComponent>;
  let service: MicroFrontendService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MicroFrontendComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MicroFrontendComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(MicroFrontendService);
    spyOn(service, 'createCustomElement').and.returnValue(of(mock));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
