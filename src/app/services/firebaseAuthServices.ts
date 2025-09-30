import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { 
  Auth, 
  user, 
  signInWithEmailAndPassword, 
  signOut,
  User, 
} from '@angular/fire/auth';

import { LoginDto } from '../models/dtos/loginDto';
import { ResponseDto } from '../models/dtos/responseDto';


@Injectable({
  providedIn: 'root',
})
export class FireBaseAuthService {
  
  private auth: Auth = inject(Auth);
  private router = inject(Router); 


  // The 'user' observable from @angular/fire/auth is the modular replacement for 'authState'.
  // It emits the User object or null, making it perfect for isAuthenticated.
  get isAuthenticated(): Observable<boolean> {
    return user(this.auth).pipe(
      map((currentUser: User | null) => !!currentUser)
    );
  }

  async login(loginDto: LoginDto): Promise<ResponseDto> {
    try {
      const response = await signInWithEmailAndPassword(
        this.auth, 
        loginDto.email, 
        loginDto.password
      );
      
      this.router.navigate(['/admin']);
      console.log(response);

      const successResponse: ResponseDto = {
        status: true,
        message: 'Login successful',
      };
      return successResponse;
    } catch (error) {
      console.error(error); // Use console.error for errors

      const errorResponse: ResponseDto = {
        status: false,
        message: String(error) || 'An unknown error occurred during login.',
      };
      return errorResponse;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
  
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}