import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { CoursesComponent } from './components/admin/courses/courses.component';
import { FooterComponent } from './components/shared/footer/footer.component';

import { LoginComponent } from './components/login/login.component';

import { NgxPaginationModule } from 'ngx-pagination';
import { CourseServicesService } from './services/admin/course-services.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TopicsComponent } from './components/admin/topics/topics.component';
import { CustomTooltipComponent } from './components/shared/custom-tooltip/custom-tooltip.component';
import { TopicService } from './services/admin/topic.service';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavbarComponent,
    CoursesComponent,
    FooterComponent,
    TopicsComponent,
    CustomTooltipComponent
  ],
  imports: [
    BrowserModule,
    NgxPaginationModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    DragDropModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-right', // Set position to top-right
      timeOut: 3000, // Auto close after 3 seconds
      preventDuplicates: true
    })
  ],
  providers: [CourseServicesService, TopicService],
  bootstrap: [AppComponent]
})
export class AppModule { }
