import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Project } from 'src/app/models/project';
import { FireBaseProjectService } from 'src/app/services/firebaseProjectServices';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-order-project',
  templateUrl: './order-project.component.html',
  styleUrls: ['./order-project.component.css']
})
export class OrderProjectComponent implements OnInit, OnDestroy {
  private readonly fireBaseStorage = inject(FireBaseProjectService);
  projectSubject = signal<Project[]>([]);
  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    this.initializeProjects();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initializeProjects(): void {
    this.fireBaseStorage.fetchProjectWithoutLimit();
    const subscription = this.fireBaseStorage.projectSubject.subscribe(
      (projects) => {
        this.projectSubject.set(projects);
      }
    );
    this.subscriptions.add(subscription);
  }

  
  async dropListDropped(event: CdkDragDrop<Project[]>) {
    try {
      const projects = [...this.projectSubject()];
      
      // First move the item in the array
      moveItemInArray(projects, event.previousIndex, event.currentIndex);
      
      // Update placeIndex for all affected items
      const updatePromises = projects.map(async (project, index) => {
        project.placeIndex = index + 1;
        // Assuming you have an update method in your service
        return this.fireBaseStorage.updateProjectOnly(project);
      });

      // Wait for all updates to complete
      await Promise.all(updatePromises);
      
      // Update the signal with new array
      this.projectSubject.set(projects);
    } catch (error) {
      console.error('Error updating project order:', error);
      // You might want to show an error message to the user here
    }
  }
}