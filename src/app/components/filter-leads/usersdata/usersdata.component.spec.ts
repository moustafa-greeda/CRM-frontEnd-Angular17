import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersdataComponent } from './usersdata.component';

describe('UsersdataComponent', () => {
  let component: UsersdataComponent;
  let fixture: ComponentFixture<UsersdataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UsersdataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UsersdataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
