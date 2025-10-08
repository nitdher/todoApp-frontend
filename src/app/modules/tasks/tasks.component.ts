import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TaskService } from '../../core/services/task.service';
import { Task } from '../../core/interfaces/task.interface';
import { EditTaskDialogComponent } from './edit-task-dialog/edit-task-dialog.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatCheckboxModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})
export class TasksComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  public readonly tasks = signal<Task[]>([]);
  public readonly isLoading = signal<boolean>(false);
  public readonly errorMessage = signal<string>('');
  public currentUser = this.authService.getCurrentUser();

  public readonly displayedColumns: string[] = ['title', 'description', 'createdAt', 'completed', 'actions'];

  public readonly taskForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
  });

  public ngOnInit(): void {
    this.loadTasks();
  }

  public loadTasks(): void {
    const user = this.authService.getCurrentUser();
    if (!user?.id) return;

    this.isLoading.set(true);
    this.taskService.getAllTasks(user.id).subscribe({
      next: (tasks) => {
        this.tasks.set(tasks.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        }));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar las tareas');
        this.isLoading.set(false);
      }
    });
  }

  public onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user?.id) return;

    this.isLoading.set(true);

    const taskData = {
      ...this.taskForm.value,
      userId: user.id,
      completed: false
    };

    this.taskService.createTask(taskData).subscribe({
      next: () => {
        this.taskForm.reset();
        this.loadTasks();
        this.errorMessage.set('');
      },
      error: () => {
        this.errorMessage.set('Error al crear la tarea');
        this.isLoading.set(false);
      }
    });
  }

  public toggleCompleted(task: Task): void {
    if (!task.id) return;

    this.taskService.updateTask(task.id, { completed: !task.completed }).subscribe({
      next: () => {
        this.loadTasks();
      },
      error: () => {
        this.errorMessage.set('Error al actualizar la tarea');
      }
    });
  }

  public editTask(task: Task): void {
    const dialogRef = this.dialog.open(EditTaskDialogComponent, {
      width: '500px',
      data: { task }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTasks();
      }
    });
  }

  public deleteTask(task: Task): void {
    if (!task.id || !confirm('¿Estás seguro de eliminar esta tarea?')) return;

    this.taskService.deleteTask(task.id).subscribe({
      next: () => {
        this.loadTasks();
      },
      error: () => {
        this.errorMessage.set('Error al eliminar la tarea');
      }
    });
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  public getErrorMessage(field: string): string {
    const control = this.taskForm.get(field);

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

  public trackByTaskId(index: number, task: Task): string | undefined {
    return task.id;
  }

  public getCompletedCount(): number {
    return this.tasks().filter(task => task.completed).length;
  }

  public getPendingCount(): number {
    return this.tasks().filter(task => !task.completed).length;
  }
}
