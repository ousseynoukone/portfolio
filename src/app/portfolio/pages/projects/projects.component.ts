import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Project } from '../../../models/project';
import { FireBaseStorageService2 } from 'src/app/services/firebaseService2';
import { LocalStorageService } from '../../shared/sharedService';

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
  noData: boolean = true;
  noDataWeb: boolean = true;

  constructor(private router: Router) { }

  fireBaseStorage = inject(FireBaseStorageService2);
  localStorage = inject(LocalStorageService); 

  navigateToDetailsPage(project : Project) {
    this.localStorage.setData("project",project)

    this.router.navigate(['/project-details']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  ngOnInit() {
    this.initProject();
  }

  initProjectsArray(){
    this.webProjects = [];
    this.mobileProjects = [];
  }

  initProject() {
    this.loading = true;
    this.fireBaseStorage.getProjectClient();
    this.fireBaseStorage.abilitiesSubject.subscribe(data => {
      this.initProjectsArray();
      if(data.length == 0) {
        this.noDataMessage = 'No projects found.';
      } else {
        this.noData=false
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
          this.noDataMobile = false
        }
        if(this.webProjects.length === 0){
          this.noDataWeb = true ;
          this.noDataMessage = 'No web projects found.';

        }else{
          this.noDataWeb = false
        }
      }
      this.loading = false;
    });
  }
}
