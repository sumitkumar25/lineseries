import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineSeries2Component } from './line-series2.component';

describe('LineSeries2Component', () => {
  let component: LineSeries2Component;
  let fixture: ComponentFixture<LineSeries2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LineSeries2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LineSeries2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
