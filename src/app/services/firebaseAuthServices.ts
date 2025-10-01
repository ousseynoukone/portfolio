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

  private _isAuthenticated: Observable<boolean>; 

  constructor() {
    // Initialize the Observable in the constructor. This ensures the 
    // `user` function is called within the Angular injection context.
    this._isAuthenticated = user(this.auth).pipe(
      map((currentUser: User | null) => !!currentUser)
    );
  }

  // Public getter returns the pre-initialized observable
  get isAuthenticated(): Observable<boolean> {
    return this._isAuthenticated;
  }

  async login(loginDto: LoginDto): Promise<ResponseDto> {
    try {
      const response = await signInWithEmailAndPassword(
        this.auth, 
        loginDto.email, 
        loginDto.password
      );
      
      this.router.navigate(['/admin']);
      console.log('Login response:', response);

      const successResponse: ResponseDto = {
        status: true,
        message: 'Login successful',
      };
      return successResponse;
    } catch (error) {
      console.error(error); 

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
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}
