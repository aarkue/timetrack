import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

@Injectable({
  providedIn: 'root',
})
export class WebRequestService {
  readonly ROOT_URL;
  public jwt : string = "";

  constructor(private http: HttpClient) {
    this.ROOT_URL = 'https://smartime.eu:3000';

  }

  async updateJWT(){
    this.jwt = await (await Storage.get({key: "jwt"})).value;
  }
  get(uri: string) {
    const params = new HttpParams().append("jwt",this.jwt);
    return this.http.get(`${this.ROOT_URL}/${uri}`, { withCredentials: true, params: params });
  }

  post(uri: string, payload: Object) {
    const params = new HttpParams().append("jwt",this.jwt);
    return this.http.post(`${this.ROOT_URL}/${uri}`, payload, { withCredentials: true, params: params });
  }

  patch(uri: string, payload: Object): Observable<Object> {
    const params = new HttpParams().append("jwt",this.jwt);
    return this.http.patch(`${this.ROOT_URL}/${uri}`, payload, { withCredentials: true, params: params });
  }

  delete(uri: string) {
    const params = new HttpParams().append("jwt",this.jwt);
    return this.http.delete(`${this.ROOT_URL}/${uri}`, { withCredentials: true, params: params });
  }
}
