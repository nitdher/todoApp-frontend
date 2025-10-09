# Todo App - Frontend

Aplicación web de gestión de tareas desarrollada con Angular 17, implementando arquitectura limpia, principios SOLID y las mejores prácticas del framework.

## 🚀 Tecnologías

- **Angular 17.3** - Framework con standalone components
- **Angular Material 17** - Componentes UI y diseño
- **TypeScript 5.4** - Tipado estático
- **RxJS 7.8** - Programación reactiva
- **SCSS** - Estilos con preprocesador

## 📋 Requisitos Previos

- Node.js >= 18
- pnpm >= 10 (recomendado) o npm

## 🛠️ Instalación

```bash
# Instalar dependencias
pnpm install
```

## ⚙️ Configuración

Editar `src/environments/environment.ts` con la URL del backend:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api'
};
```

## 🏃 Ejecución

```bash
# Modo desarrollo
pnpm dev
# Aplicación disponible en http://localhost:4200

# Build de producción
pnpm build

# Linter
pnpm lint
```

## 🏗️ Arquitectura

### Estructura de Carpetas

```
src/app/
├── core/                           # Núcleo de la aplicación
│   ├── constants/
│   │   └── api.constants.ts        # Endpoints del API
│   ├── guards/
│   │   └── auth.guard.ts           # Protección de rutas
│   ├── interceptors/
│   │   └── error.interceptor.ts    # Manejo centralizado de errores HTTP
│   ├── interfaces/
│   │   ├── api-response.interface.ts
│   │   ├── task.interface.ts
│   │   └── user.interface.ts
│   └── services/
│       ├── auth.service.ts         # Autenticación y sesión
│       ├── task.service.ts         # CRUD de tareas
│       └── user.service.ts         # Operaciones de usuarios
└── modules/                        # Módulos funcionales
    ├── login/                      # Autenticación
    │   ├── confirm-create-user-dialog/
    │   └── login.component.{ts,html,scss}
    └── tasks/                      # Gestión de tareas
        ├── edit-task-dialog/
        └── tasks.component.{ts,html,scss}
```

### Separación de Responsabilidades

**Core Layer:**
- Servicios de negocio
- Guards y interceptors
- Interfaces y constantes
- Lógica reutilizable

**Modules Layer:**
- Componentes de presentación
- Lógica específica de UI
- Standalone components con imports explícitos

## 🎯 Decisiones Técnicas

### 1. Arquitectura Limpia

**Separación por capas:**
- **Core:** Lógica de negocio independiente de UI
- **Modules:** Componentes de presentación
- **Shared:** Elementos reutilizables (si se necesitan)

**Principio de Inversión de Dependencias:**
Los componentes dependen de servicios (abstracciones), no de implementaciones concretas.

### 2. Gestión de Autenticación

**sessionStorage:**

Se eligió sessionStorage como mecanismo de persistencia de sesión por:
- Seguridad: Se limpia automáticamente al cerrar el navegador
- Experiencia de usuario: Mantiene la sesión al recargar la página
- Simplicidad: No requiere implementación compleja de tokens

**Arquitectura reactiva:**
```typescript
// BehaviorSubject para estado compartido
private currentUserSubject = new BehaviorSubject<User | null>(null);
public currentUser$ = this.currentUserSubject.asObservable();

// Signal para estado local (Angular 17)
public isAuthenticated = signal<boolean>(false);
```

### 3. Manejo de Errores HTTP

**Interceptor centralizado:**

```typescript
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Mapeo de códigos HTTP a mensajes descriptivos
      // Logging centralizado
      // Propagación del error transformado
    })
  );
};
```

**Beneficios:**
- DRY: No repetir lógica de error en cada servicio
- Consistencia en mensajes al usuario
- Logging centralizado para debugging

### 4. Validaciones de Formularios

**Reactive Forms con validaciones múltiples:**

```typescript
taskForm = this.fb.group({
  title: ['', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(100)
  ]],
  description: ['', [
    Validators.required,
    Validators.minLength(10),
    Validators.maxLength(500)
  ]]
});
```

**Mensajes contextuales:**
```typescript
getErrorMessage(field: string): string {
  const control = this.taskForm.get(field);
  if (control?.hasError('required')) return 'Este campo es requerido';
  if (control?.hasError('minlength')) {
    const min = control.errors?.['minlength'].requiredLength;
    return `Mínimo ${min} caracteres`;
  }
  // ...
}
```

### 5. Guards de Autenticación

**Functional Guard (Angular 17+):**

```typescript
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isUserAuthenticated()
    ? true
    : router.createUrlTree(['/login']);
};
```

**Aplicación en rutas:**
```typescript
{
  path: 'tasks',
  loadComponent: () => import('./modules/tasks/tasks.component'),
  canActivate: [authGuard]  // Protección centralizada
}
```

### 6. Lazy Loading

**Todos los componentes:**
```typescript
{
  path: 'login',
  loadComponent: () => import('./modules/login/login.component')
    .then(m => m.LoginComponent)
}
```

**Beneficios:**
- Menor bundle inicial
- Carga bajo demanda
- Mejor performance en producción

### 7. Optimizaciones de Rendering

**TrackBy en ngFor:**
```typescript
trackByTaskId(index: number, task: Task): string | undefined {
  return task.id;
}
```

**Control Flow Syntax (Angular 17):**
```html
@if (isLoading()) {
  <mat-spinner></mat-spinner>
} @else if (tasks().length === 0) {
  <p>No hay tareas</p>
} @else {
  @for (task of tasks(); track task.id) {
    <!-- ... -->
  }
}
```

### 8. Diseño Responsive

**Mobile-first approach:**
```scss
.tasks-container {
  max-width: 1400px;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
}
```

**Tabla con scroll horizontal:**
```scss
.table-container {
  overflow-x: auto;
  max-height: 600px;
}
```

## ✨ Características Implementadas

### Autenticación
✅ Login con email
✅ Creación de usuario con confirmación (dialog)
✅ Persistencia de sesión en sessionStorage
✅ Guard protegiendo rutas autenticadas
✅ Logout con limpieza de sesión

### Gestión de Tareas
✅ Crear tarea con validaciones (min/max length, required)
✅ Listar tareas ordenadas por fecha (más recientes primero)
✅ Editar tarea (modal con validaciones)
✅ Eliminar tarea (con confirmación)
✅ Toggle completada/pendiente (checkbox)
✅ Resumen estadístico (Total, Completadas, Pendientes)

### UI/UX
✅ Diseño responsive con Angular Material
✅ Loading states con spinners
✅ Mensajes de error descriptivos
✅ Validaciones con feedback visual
✅ Información del usuario logueado en header
✅ Contador de tareas por estado

### Técnicas
✅ Interceptor HTTP para manejo de errores
✅ JSDoc en servicios core
✅ Lazy loading en todas las rutas
✅ TrackBy en ngFor
✅ Signals + Observables (enfoque híbrido)

## 🔧 Principios SOLID Aplicados

### Single Responsibility (SRP)
- **AuthService:** Solo maneja autenticación
- **TaskService:** Solo maneja CRUD de tareas
- **UserService:** Solo maneja operaciones de usuarios

### Open/Closed (OCP)
- Servicios extensibles mediante interfaces
- Fácil agregar nuevos endpoints sin modificar existentes

### Dependency Inversion (DIP)
```typescript
// Componentes dependen de abstracciones (servicios)
private readonly authService = inject(AuthService);
private readonly taskService = inject(TaskService);
```

## 📦 Integración con Backend

### Endpoints Consumidos

```
POST   /api/users/check          # Verificar usuario
POST   /api/users                # Crear usuario
GET    /api/tasks/user/:userId   # Obtener tareas
POST   /api/tasks                # Crear tarea
PUT    /api/tasks/:id            # Actualizar tarea
DELETE /api/tasks/:id            # Eliminar tarea
```

### Formato de Respuesta

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
```

Los servicios transforman automáticamente este formato extrayendo solo los datos necesarios.

## 🎨 Patrones de Diseño Utilizados

### Repository Pattern
Servicios actúan como repositorios que abstraen la comunicación HTTP

### Observer Pattern
RxJS Observables para estado reactivo

### Singleton Pattern
Servicios con `providedIn: 'root'`

### Factory Pattern (Implícito)
`inject()` para inyección de dependencias

## 📝 Buenas Prácticas Aplicadas

### DRY (Don't Repeat Yourself)
- Interceptor para manejo de errores
- Constantes centralizadas (API_ENDPOINTS)
- Métodos reutilizables de transformación

### KISS (Keep It Simple, Stupid)
- Soluciones directas y comprensibles
- sessionStorage para persistencia de sesión
- No over-engineering

### YAGNI (You Aren't Gonna Need It)
- Focus en requerimientos del challenge
- No se implementaron features innecesarias

## 🔐 Consideraciones de Seguridad

### Implementado
✅ sessionStorage (se limpia al cerrar navegador)
✅ Guards protegiendo rutas sensibles
✅ Validaciones en cliente y servidor
✅ CORS configurado en backend
✅ Manejo centralizado de errores HTTP

### Para Producción (fuera del scope)
- JWT con access/refresh tokens
- httpOnly cookies
- CSRF protection
- Rate limiting

## 👨‍💻 Autor

**Nitdher González**

Desarrollado como parte del challenge técnico FullStack Developer de ATOM.
