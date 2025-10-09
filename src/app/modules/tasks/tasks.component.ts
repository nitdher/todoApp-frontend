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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';
import { TaskService } from '../../core/services/task.service';
import { Task } from '../../core/interfaces/task.interface';
import { EditTaskDialogComponent } from './edit-task-dialog/edit-task-dialog.component';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog/confirm-delete-dialog.component';

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
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
  animations: [
    // Animación para la aparición de cards y elementos principales
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),

    // Animación para la lista de tareas con stagger effect
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(-20px)' }),
          stagger(50, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true }),
        query(':leave', [
          animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(20px)' }))
        ], { optional: true })
      ])
    ])
  ]
})
export class TasksComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  public readonly tasks = signal<Task[]>([]);
  public readonly isLoading = signal<boolean>(false);
  public readonly errorMessage = signal<string>('');
  public readonly liveAnnouncement = signal<string>('');
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

  /**
   * Maneja el envío del formulario para crear una nueva tarea
   */
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
        this.showSnackBar('✓ Tarea creada exitosamente', 'success');
      },
      error: () => {
        this.errorMessage.set('Error al crear la tarea');
        this.isLoading.set(false);
        this.showSnackBar('✗ Error al crear la tarea', 'error');
      }
    });
  }

  /**
   * Alterna el estado de completado de una tarea
   */
  public toggleCompleted(task: Task): void {
    if (!task.id) return;

    this.taskService.updateTask(task.id, { completed: !task.completed }).subscribe({
      next: () => {
        this.loadTasks();
        const message = !task.completed
          ? '✓ Tarea marcada como completada'
          : '✓ Tarea marcada como pendiente';
        this.showSnackBar(message, 'success');
        this.announce(message);
      },
      error: () => {
        this.errorMessage.set('Error al actualizar la tarea');
        this.showSnackBar('✗ Error al actualizar la tarea', 'error');
        this.announce('Error al actualizar la tarea');
      }
    });
  }

  /**
   * Abre el diálogo para editar una tarea
   */
  public editTask(task: Task): void {
    const dialogRef = this.dialog.open(EditTaskDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { task }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTasks();
        this.showSnackBar('✓ Tarea actualizada exitosamente', 'success');
      }
    });
  }

  /**
   * Abre el diálogo de confirmación para eliminar una tarea
   */
  public deleteTask(task: Task): void {
    if (!task.id) return;

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { taskTitle: task.title }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed && task.id) {
        this.taskService.deleteTask(task.id).subscribe({
          next: () => {
            this.loadTasks();
            this.showSnackBar('✓ Tarea eliminada exitosamente', 'success');
          },
          error: () => {
            this.errorMessage.set('Error al eliminar la tarea');
            this.showSnackBar('✗ Error al eliminar la tarea', 'error');
          }
        });
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

  /**
   * Muestra un snackbar con el mensaje y estilo especificado
   */
  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`${type}-snackbar`]
    });
  }

  /**
   * Anuncia un mensaje a los lectores de pantalla
   */
  private announce(message: string): void {
    this.liveAnnouncement.set(message);
    // Limpiar después de 1 segundo para permitir nuevos anuncios
    setTimeout(() => this.liveAnnouncement.set(''), 1000);
  }
}
