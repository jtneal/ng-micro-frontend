import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NullComponent } from './null.component';

describe('NullComponent', () => {
  let component: NullComponent;
  let fixture: ComponentFixture<NullComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NullComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NullComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
