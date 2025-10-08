import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";

export const routes: Routes = [
    {
        path: "",
        redirectTo: "/login",
        pathMatch: "full"
    },
    {
        path: "login",
        loadComponent: () => import("./modules/login/login.component").then((m) => m.LoginComponent)
    },
    {
        path: "tasks",
        loadComponent: () => import("./modules/tasks/tasks.component").then((m) => m.TasksComponent),
        canActivate: [authGuard]
    },
    {
        path: "**",
        redirectTo: "/login"
    }
];
