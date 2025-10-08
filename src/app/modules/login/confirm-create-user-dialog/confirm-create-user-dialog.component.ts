import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-create-user-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './confirm-create-user-dialog.component.html',
  styleUrl: './confirm-create-user-dialog.component.scss'
})
export class ConfirmCreateUserDialogComponent {
  public readonly dialogRef = inject(MatDialogRef<ConfirmCreateUserDialogComponent>);
  public readonly data = inject(MAT_DIALOG_DATA);

  public onConfirm(): void {
    this.dialogRef.close(true);
  }

  public onCancel(): void {
    this.dialogRef.close(false);
  }
}
