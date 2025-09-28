
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { LoginDto } from '../models/dtos/loginDto';
import { Injectable, inject } from '@angular/core';
import {ResponseDto} from '../models/dtos/responseDto';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject, Subject, map } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
  })
  export class FireBaseAuthService {
    private auth = inject(AngularFireAuth);
      constructor( private router : Router){}
      
      get isAuthenticated(): Observable<boolean> {
        return this.auth.authState.pipe(map(user => !!user));
      }
  
      async login(loginDto: LoginDto): Promise<ResponseDto> {
        try {
          const response = await this.auth.signInWithEmailAndPassword(loginDto.email, loginDto.password);
          this.router.navigate(['/admin']);
          console.log(response);
    
          const successResponse: ResponseDto = {
            status: true, // Assuming 200 for success, adjust as needed
            message: "Success",
          };
          return successResponse;
        } catch (error) {
          console.log(error);
  
          const errorResponse: ResponseDto = {
            status: false, // Assuming 500 for error, adjust as needed
            message: String(error) || "An error occurred",
          };
          return errorResponse;
        }
      }
  
        logout() {
          this.auth.signOut()
            .then(() => {
              // Logout successful
            })
            .catch((error) => {
              // An error occurred
            });
        }
  }
  