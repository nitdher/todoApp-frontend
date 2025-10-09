import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrl: './confirm-delete-dialog.component.scss',
  animations: [
    // Animación para el contenido del diálogo
    trigger('dialogContent', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class ConfirmDeleteDialogComponent {
  public readonly dialogRef = inject(MatDialogRef<ConfirmDeleteDialogComponent>);
  public readonly data = inject(MAT_DIALOG_DATA);

  /**
   * Confirma la eliminación y cierra el diálogo
   */
  public onConfirm(): void {
    this.dialogRef.close(true);
  }

  /**
   * Cancela la eliminación y cierra el diálogo
   */
  public onCancel(): void {
    this.dialogRef.close(false);
  }
}
