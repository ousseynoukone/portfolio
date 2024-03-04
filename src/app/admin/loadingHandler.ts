import { BehaviorSubject, Observable } from "rxjs"

export class LoadingHandler{
    isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

    get _getIsLoading  () : Observable<boolean> {
        return this.isLoading.asObservable()
    }
    
    set _setIsLoading (value: boolean) {
        this.isLoading.next(value);

    }
}