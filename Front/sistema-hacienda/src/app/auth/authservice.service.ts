import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environment/environment';
import { jwtDecode } from 'jwt-decode';
import { UserService } from './user.service';


interface JwtPayload {
  username: string; // o usa el nombre real del campo con el username
  rol_id: number;
  group_id: number;// otros campos que incluya el token
}


interface LoginResponse {
  access_token: string;
  
  token_type: string;
  expires_in: number;
}


@Injectable({
  providedIn: 'root'
})


export class AuthserviceService {

  private baseUrl = environment.apiUrl;

  private tokenKey = 'jwt_token';
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient, private userService: UserService) {
    const token = this.getToken();
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        this.userService.setUser({
          username: decoded.username,
          rol_id: decoded.rol_id,
          group_id: decoded.group_id
          
        })
        
      } catch (e) {
        console.error('Error al decodificar token en constructor', e);
        this.userService.clearUser();
      }
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, { username, password })
      .pipe(
        tap(response => {
          localStorage.setItem(this.tokenKey, response.access_token);
          this.loggedIn.next(true);

          const decoded = jwtDecode<JwtPayload>(response.access_token);
          this.userService.setUser({
            username: decoded.username,
            rol_id: decoded.rol_id,
            group_id: decoded.group_id
          });
        })
      );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.loggedIn.next(false);
    this.userService.clearUser(); // << importante
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getUserInfo(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        console.log(decoded)
        return decoded.username; // cambia esto si el campo es distinto, como `username`
      } catch (e) {
        console.error('Token inválido:', e);
        return null;
      }
    }
    return null;
  }



}
