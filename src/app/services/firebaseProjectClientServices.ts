import { inject, Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Project } from '../models/project';

import {
  Firestore,
  CollectionReference,
  collection,
  query,
  orderBy,
  collectionData,
} from '@angular/fire/firestore';

import { Storage } from '@angular/fire/storage';


@Injectable({
  providedIn: 'root',
})
export class FireBaseProjectClientService {

  private firestore: Firestore = inject(Firestore);

  private projectsDb!: CollectionReference<Project>;

  // BehaviorSubjects for holding project data and counts
  private _projectSubject = new BehaviorSubject<Project[]>([]);
  private _mobileProjectCount = new BehaviorSubject<number>(0);
  private _webProjectCount = new BehaviorSubject<number>(0);
  private _totalOfItems = new BehaviorSubject<number>(0);

  constructor() {
    // 1. Get a reference to the 'projects' collection.
    const projectsCollection = collection(this.firestore, 'projects');

    this.projectsDb = projectsCollection as CollectionReference<Project>;
  }

  // Getters remain the same (they expose Observables)
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

  // Private helper function to update project counts (Logic remains the same)
  private updateProjectCounts(projects: Project[]): void {
    const mobileCount = projects.filter((p) => p.type === 'mobile').length;
    const webCount = projects.filter((p) => p.type === 'web').length;

    this._mobileProjectCount.next(mobileCount);
    this._webProjectCount.next(webCount);
    this._totalOfItems.next(mobileCount + webCount);
  }


  fetchProjects() {
    const q = query(this.projectsDb, orderBy('placeIndex', 'asc'));
    
    // Use AngularFire's `collectionData` function to get the Observable stream.
    // collectionData automatically handles the real-time subscription and unwraps the documents.
    collectionData(q, { idField: 'id' })
      .pipe(
        // The pipe is  used to perform filtering/side effects
        map(projects => projects.filter(p => p.isVisible)), // Filter projects by isVisible
        tap(visibleProjects => this.updateProjectCounts(visibleProjects)) // Update counts as a side effect
      )
      .subscribe(visibleProjects => {
        //  Update the BehaviorSubject
        this._projectSubject.next(visibleProjects);
      });
  }

}