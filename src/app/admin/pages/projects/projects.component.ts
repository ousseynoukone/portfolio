import { Component } from '@angular/core';
import { Project } from '../../../models/project'; // Assuming the Project class is in a separate file
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FireBaseAuthService } from 'src/app/services/firebaseService';



@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent {
    projects: Project[] = []; // Array to store project data (replace with actual data source)
    projectForm !: FormGroup;
    editMode: boolean = false;
    selectedProject: Project | null = null;
  
    constructor(private fb: FormBuilder , private fService : FireBaseAuthService) {}
  
    ngOnInit() {
      // Initialize the project form
      this.projectForm = this.fb.group({
        id: [0],
        title: ['', Validators.required],
        minDescription: ['', Validators.required],
        fullDescription: ['', Validators.required],
        imgs: ['', Validators.required],
        usedTools: ['', Validators.required],
        demo: [''] // Optional demo link
      });
    }
  
    // ... other component methods (omitted for brevity)
  
    addProject() {
      if (this.projectForm.valid) {
        const newProject = this.projectForm.value as Project;
        // Implement logic to add the new project to the data source (e.g., backend API)
        // Update the `projects` array accordingly
        this.projectForm.reset(); // Reset the form after successful submission
      }
    }
  
    editProject(project: Project) {
      this.editMode = true;
      this.selectedProject = project;
      this.projectForm.patchValue(project); // Pre-populate the form with project data
    }
  
    updateProject() {
      if (this.projectForm.valid && this.selectedProject) {
        const updatedProject = { ...this.selectedProject, ...this.projectForm.value };
        // Implement logic to update the project in the data source (e.g., backend API)
        // Update the corresponding project in the `projects` array
        this.editMode = false;
        this.selectedProject = null;
        this.projectForm.reset(); // Reset the form after successful update
      }
    }
  
    cancelEdit() {
      this.editMode = false;
      this.selectedProject = null;
      this.projectForm.reset(); // Reset the form in case of cancellation
    }
  
    deleteProject(id: Number) {
      // Implement logic to delete the project from the data source (e.g., backend API)
      // Remove the project from the `projects` array by its id
    }
  

  }
  

