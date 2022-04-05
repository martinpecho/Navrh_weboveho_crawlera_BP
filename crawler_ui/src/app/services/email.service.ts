import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/**
 * Služba pre rozlisenie uzivatela
 */
@Injectable({ providedIn: 'root' })
export class EmailService {
    private verifiedUser: any;
    /** konštruktor */
    constructor(private httpClient: HttpClient) { }
    /** nastavenie a ulozenie emailovej adresy */
    setUserEmail(email: string): Observable<any>{
        this.verifiedUser = email;
        sessionStorage.setItem("email", email);
        return this.httpClient.post<any>(environment.url + '/setUser',{'email':email});
    }
    /** sluzba, vracia email pouzivatela zo sessionStorage */
    getVerifiedUser(){
        this.verifiedUser = sessionStorage.getItem("email");
        return this.verifiedUser;
    }
}