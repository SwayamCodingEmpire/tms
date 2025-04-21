import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoursesComponent } from './components/admin/courses/courses.component';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { TopicsComponent } from './components/admin/topics/topics.component';
import { ProgramsComponent } from './components/admin/programs/programs.component';

const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path : 'courses', component : CoursesComponent, canActivate : [authGuard]},
  {path: 'topics/:code/:name', component: TopicsComponent},
  {path: 'programs', component: ProgramsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
