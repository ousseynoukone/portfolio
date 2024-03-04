import { Component, OnInit, inject } from '@angular/core';
import { Project } from 'src/app/models/project';
import { LocalStorageService } from '../../shared/sharedService';

@Component({
  selector: 'app-projects-details',
  templateUrl: './projects-details.component.html',
  styleUrls: ['./projects-details.component.css']
})
export class ProjectsDetailsComponent implements OnInit {
  project !: Project
  localStorage = inject(LocalStorageService)

  ngOnInit(): void {
    this.project = this.localStorage.getData("project") as Project
  }

}
