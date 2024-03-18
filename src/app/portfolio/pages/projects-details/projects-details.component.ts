import { Component, OnInit, inject } from '@angular/core';
import { Project } from 'src/app/models/project';
import { PassDataThrough } from '../../shared/sharedService';

@Component({
  selector: 'app-projects-details',
  templateUrl: './projects-details.component.html',
  styleUrls: ['./projects-details.component.css']
})
export class ProjectsDetailsComponent implements OnInit {
  project !: Project
  shareData = inject(PassDataThrough)

  ngOnInit(): void {
    this.project = this.shareData.getData as Project
  }

}
