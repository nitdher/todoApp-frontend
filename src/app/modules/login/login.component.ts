import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ConfirmCreateUserDialogComponent } from './confirm-create-user-dialog/confirm-create-user-dialog.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  public readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]]
  });

  public readonly isLoading = signal<boolean>(false);
  public readonly errorMessage = signal<string>('');

  public onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const email = this.loginForm.value.email;

    this.userService.getUserByEmail(email).pipe(
      catchError(() => of(null))
    ).subscribe({
      next: (user) => {
        this.isLoading.set(false);

        if (user) {
          this.authService.setCurrentUser(user);
          this.router.navigate(['/tasks']);
        } else {
          this.openConfirmDialog(email);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Error al conectar con el servidor');
      }
    });
  }

  private openConfirmDialog(email: string): void {
    const dialogRef = this.dialog.open(ConfirmCreateUserDialogComponent, {
      width: '400px',
      data: { email }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createUser(email);
      }
    });
  }

  private createUser(email: string): void {
    this.isLoading.set(true);

    this.userService.createUser(email).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        this.authService.setCurrentUser(user);
        this.router.navigate(['/tasks']);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Error al crear el usuario');
      }
    });
  }

  public getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);

    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (control?.hasError('email')) {
      return 'Email inválido';
    }

    if (control?.hasError('maxlength')) {
      return 'Máximo 255 caracteres';
    }

    return '';
  }
}
