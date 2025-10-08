import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskService } from '../../../core/services/task.service';

@Component({
  selector: 'app-edit-task-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './edit-task-dialog.component.html',
  styleUrl: './edit-task-dialog.component.scss'
})
export class EditTaskDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  public readonly dialogRef = inject(MatDialogRef<EditTaskDialogComponent>);
  public readonly data = inject(MAT_DIALOG_DATA);

  public readonly isLoading = signal<boolean>(false);
  public readonly errorMessage = signal<string>('');

  public readonly editForm: FormGroup = this.fb.group({
    title: [this.data.task.title, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: [this.data.task.description, [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
  });

  public onSave(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    this.taskService.updateTask(this.data.task.id, this.editForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.dialogRef.close(true);
      },
      error: () => {
        this.errorMessage.set('Error al actualizar la tarea');
        this.isLoading.set(false);
      }
    });
  }

  public onCancel(): void {
    this.dialogRef.close(false);
  }

  public getErrorMessage(field: string): string {
    const control = this.editForm.get(field);

    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }

    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }

    return '';
  }
}
