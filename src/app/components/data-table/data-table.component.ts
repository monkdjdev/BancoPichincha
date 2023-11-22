import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { DataService } from 'src/app/services/data.service';
import { CoreService } from 'src/app/core/core.service';
import { ModalEditComponent } from '../modal-edit/modal-edit.component';
import { ConfirmationModalComponent } from '../confirmation-modal-component/confirmation-modal.component';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'logo',
    'name',
    'description',
    'date_release',
    'date_revision',
    'action',
  ];
  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private _dialog: MatDialog,
    private _dataService: DataService,
    private _coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.getEmployeeList();
  }

  openAddEditProductForm() {
    const dialogRef = this._dialog.open(ModalEditComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getEmployeeList();
        }
      },
    });
  }

  getProductList() {
    this._dataService.getProductList().subscribe({
      next: (res) => {
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteProduct(id: number, productName: string) {
    const dialogRef = this._dialog.open(ConfirmationModalComponent, {
      width: '400px',
      height: '200px',
      data: { productName, id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._dataService.deleteProduct(id).subscribe({
          next: (res) => {
            this._coreService.openSnackBar('Employee deleted!', 'done');
            this.getProductList();
          },
          error: (err) => {
            console.error(err);
            this._coreService.openSnackBar('Error deleting employee', 'error');
          },
        });
      }
    });
  }


  openEditForm(data: any) {
    const dialogRef = this._dialog.open(ModalEditComponent, {
      data,
    });

    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getProductList();
        }
      },
    });
  }
}
