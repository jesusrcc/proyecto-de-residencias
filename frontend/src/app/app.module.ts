import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module'; // 👈 ESTE IMPORTA RouterModule
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { FormComponent } from './pages/form/form.component';
import { CvComponent } from './pages/cv/cv.component';
import { TimelineComponent } from './pages/timeline/timeline.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    LayoutComponent,
    FormComponent,
    CvComponent,
    TimelineComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule, // 👈 IMPORTANTE: debe estar aquí
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
