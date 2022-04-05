import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/**
 * Služby pre pracu s RSS
 */
@Injectable({ providedIn: 'root' })
export class RssService {
    /** interval pre  */
    interval: any;
    /** posielanie udalosti o ziskani rss suborov */
    rssList = new EventEmitter();
    /** posielanie udalosti o chybe */
    errorEmitter = new EventEmitter();

    /** konštruktor 
     * @param httpClient volanie http sluzieb
    */
    constructor(private httpClient: HttpClient) { }
    /** sluzba pre overenie existencie RSS z URL adresy */
    getRssByUrl(url: string): Observable<any>{
        return this.httpClient.get<string>(environment.url + '/getRss?url='+url);
    }
    /** sluzba pre ziskanie ciselnikov */
    getEnum(type: any):Observable<any>{
        return this.httpClient.get<any>(environment.url + '/get'+type);
    }
    /** sluzba pre poslanie klucoveho vyrazu bez filtra */
    task(key:string): Observable<any>{
        return this.httpClient.get<string>(environment.url + '/task?key='+key);
    }
    /** overovanie dokoncenia poziadavky */
    isCompleted(hash: string): Observable<any>{
        return this.httpClient.get<string>(environment.url + '/isCompleted?key='+hash);
    }
    /**spustenie casovaca */
    startTimer(hash:string) {
        this.interval = setInterval(() => {
            this.getRssResponse(hash);
        },10000)
        return this.interval;
    }
    /** volanie sluzby isCompleted */
    getRssResponse(hash:string){
        this.isCompleted(hash).subscribe(
            res => {
                if(res?.result?.length>0){
                    this.rssList.emit(res.result)
                    clearInterval(this.interval);
                }
                    
            },error => {
                this.errorEmitter.emit(error);
                clearInterval(this.interval);
            }
        )
    }
    /** z hashu vrati json s rss udajmi pre obrazovku detail */
    getRssFromTask(hash:string){
        return this.httpClient.get<any>(environment.url + '/detail?key='+hash);
    }
    /** sluzba pre poslanie klucovych vyrazov s filtrom */
    tasks(body: any):Observable<any> {
        return this.httpClient.post<any>(environment.url + "/tasks", body);
    }
}
