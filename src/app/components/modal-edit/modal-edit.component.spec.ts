import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalEditComponent } from './modal-edit.component';
import { CoreService } from 'src/app/core/core.service';

describe('ModalEditComponent', () => {
  let component: ModalEditComponent;
  let fixture: ComponentFixture<ModalEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalEditComponent],
      providers: [CoreService],
    });

    fixture = TestBed.createComponent(ModalEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
