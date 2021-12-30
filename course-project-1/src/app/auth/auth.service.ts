import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { BehaviorSubject, throwError } from 'rxjs';
import { User } from './user.model';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as authActions from './store/auth.actions';
export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // user = new BehaviorSubject<User>(null);
  private tokenExpTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private store: Store<fromApp.AppState>
  ) {}

  signUp(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.FB_API_KEY}`,
        {
          email: email,
          password: password,
          returnSecureToken: true,
        }
      )
      .pipe(
        catchError(this.handleError),
        tap((resData) => {
          this.handleAuthResponse(
            resData.email,
            resData.localId,
            resData.idToken,
            +resData.expiresIn
          );
        })
      );
  }

  autoLogin() {
    const userData: {
      email: string;
      userId: string;
      _token: string;
      _tokenExpDate: string;
    } = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      return;
    }

    const loadedUser = new User(
      userData.email,
      userData.userId,
      userData._token,
      new Date(userData._tokenExpDate)
    );

    if (loadedUser.token) {
      this.store.dispatch(
        new authActions.Login({
          email: loadedUser.email,
          userId: loadedUser.id,
          token: loadedUser.token,
          expDate: new Date(userData._tokenExpDate),
        })
      );
      const expDuration =
        new Date(userData._tokenExpDate).getTime() - new Date().getTime();
      this.autoLogout(expDuration);
    }
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.FB_API_KEY}`,
        {
          email: email,
          password: password,
          returnSecureToken: true,
        }
      )
      .pipe(
        catchError(this.handleError),
        tap((resData) => {
          this.handleAuthResponse(
            resData.email,
            resData.localId,
            resData.idToken,
            +resData.expiresIn
          );
        })
      );
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  logout() {
    this.store.dispatch(new authActions.Logout());
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');
    if (this.tokenExpTimer) {
      clearTimeout(this.tokenExpTimer);
    }
  }

  private handleAuthResponse(
    email: string,
    userId: string,
    token: string,
    expiresIn: number
  ) {
    const expDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(email, userId, token, expDate);
    this.store.dispatch(
      new authActions.Login({
        email: email,
        userId: userId,
        token: token,
        expDate: expDate,
      })
    );
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occured';
    if (!error.error || !error.error.error) {
      return throwError(errorMessage);
    }
    switch (error.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'Email already exists, please try again';
        break;
      case 'OPERATION_NOT_ALLOWED':
        errorMessage = 'The current operation is not allowed, try again later';
        break;
      case 'TOO_MANY_ATTEMPTS_TRY_LATER':
        errorMessage = 'To many attempts, try again later';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'This email does not exist, please sign up instead';
        break;
      case 'INVALID_PASSWORD':
        errorMessage =
          'You have entered an invalid username or password, please try again';
        break;
      case 'USER_DISABLED':
        errorMessage =
          'This user has been locked, please contact administrator';
        break;
    }
    return throwError(errorMessage);
  }
}
