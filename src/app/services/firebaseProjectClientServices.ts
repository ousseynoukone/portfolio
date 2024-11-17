import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Project } from '../models/project';

@Injectable({
  providedIn: 'root',
})
export class FireBaseProjectClientService {
  private projectsDb!: AngularFirestoreCollection<Project>;

  // BehaviorSubjects for holding project data and counts
  private _projectSubject = new BehaviorSubject<Project[]>([]);
  private _mobileProjectCount = new BehaviorSubject<number>(0);
  private _webProjectCount = new BehaviorSubject<number>(0);
  private _totalOfItems = new BehaviorSubject<number>(0);

  constructor(private firestore: AngularFirestore, private storage: AngularFireStorage) {
    this.projectsDb = this.firestore.collection<Project>('projects', (ref) =>
      ref.orderBy('placeIndex', 'asc')
    );
  }

  // Getters to expose BehaviorSubject observables
  get projectSubject(): Observable<Project[]> {
    return this._projectSubject.asObservable();
  }

  get mobileProjectCount(): Observable<number> {
    return this._mobileProjectCount.asObservable();
  }

  get webProjectCount(): Observable<number> {
    return this._webProjectCount.asObservable();
  }

  get totalOfItems(): Observable<number> {
    return this._totalOfItems.asObservable();
  }

  // Private helper function to update project counts
  private updateProjectCounts(projects: Project[]): void {
    const mobileCount = projects.filter((p) => p.type === 'mobile').length;
    const webCount = projects.filter((p) => p.type === 'web').length;

    // Update BehaviorSubjects with new counts
    this._mobileProjectCount.next(mobileCount);
    this._webProjectCount.next(webCount);
    this._totalOfItems.next(mobileCount + webCount);
  }


    // Fetch projects and update Signals
    fetchProjects() {
        this.projectsDb.valueChanges().subscribe(projects => {
          const visibleProjects = projects.filter(p => p.isVisible);
    
          // Using `.bind()` to update the project list
          this._projectSubject.next(visibleProjects);
          // Update counts based on the filtered list
          this.updateProjectCounts(visibleProjects);
        });
      }

}
