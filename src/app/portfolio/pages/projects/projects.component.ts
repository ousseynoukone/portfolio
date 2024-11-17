import { Component, OnInit, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Project } from '../../../models/project';
import { PassDataThrough } from '../../shared/sharedService';
import { first, Subscription } from 'rxjs';
import { FireBaseProjectService } from 'src/app/services/firebaseProjectClientServices';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  mobileProjects: Project[] = [];
  webProjects: Project[] = [];
  loading: boolean = true;
  noDataMessage: string = '';
  noDataMobile: boolean = true;
  noDataWeb: boolean = true;

  fireBaseStorage = inject(FireBaseProjectService);
  shareData = inject(PassDataThrough); 

  mobileProjectCount = signal(0);  
  totalProjectCount = signal(0);  
  webProjectCount = signal(0);  

  private subscriptions: Subscription[] = []; // To store subscriptions

  constructor(private router: Router) { }



  navigateToDetailsPage(project : Project) {
    this.shareData.setData = project

    this.router.navigate(['/project-details'])
    this.initialPosition()
  }

  ngOnInit() {
    this.initProject()
    this.subscribeToTotalprojectCount();
    this.subscribeToWebprojectCount();
    this.subscribeToMobileprojectCount()
  }


  // Subscribe to project count observables
  subscribeToMobileprojectCount(){
    const subscription = this.fireBaseStorage.mobileProjectCount.subscribe(data => {
      this.mobileProjectCount.set(data);
    });
    this.subscriptions.push(subscription);  // Store subscription
  }

  subscribeToWebprojectCount(){
    const subscription = this.fireBaseStorage.webProjectCount.subscribe(data => {
      this.webProjectCount.set(data);
    });
    this.subscriptions.push(subscription);  // Store subscription
  }

  subscribeToTotalprojectCount(){
    const subscription = this.fireBaseStorage.totalOfItems.subscribe(data => {
      this.totalProjectCount.set(data);
    });
    this.subscriptions.push(subscription);  // Store subscription
  }

  initialPosition(){
    this.router.events.pipe(
      first(evt => evt instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo(0, 0); // Scroll to the top of the page

    });
  }

  initProjectsArray(){
    this.webProjects = [];
    this.mobileProjects = [];
  }

  initProject() {
    this.loading = true;
    this.fireBaseStorage.fetchProjects();
    this.fireBaseStorage.projectSubject.subscribe(data => {
      this.initProjectsArray();
      if(data.length == 0) {
        this.noDataMessage = 'No projects found.';
      } else {
        this.noDataMessage=""
        data.forEach(element => {
          if (element.type === "mobile") {
            this.mobileProjects.push(element);
          } else {
            this.webProjects.push(element);
          }
        });

       
        if(this.mobileProjects.length === 0){
          this.noDataMobile = true ;
          this.noDataMessage = 'No mobile projects found.';

        }else{
          this.noDataMessage= ""

          this.noDataMobile = false
        }
        if(this.webProjects.length === 0){
          this.noDataWeb = true ;
          this.noDataMessage = 'No web projects found.';

        }else{
          this.noDataWeb = false
          this.noDataMessage=""

        }
      }
      this.loading = false;
    });
  }


  // Clean up subscriptions when the component is destroyed
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions to avoid memory leaks
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
  
}

