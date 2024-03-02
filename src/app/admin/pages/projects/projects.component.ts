// abilities.component.ts
import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Project } from 'src/app/models/project';
import { FireBaseStorageService2 } from 'src/app/services/firebaseService2';

declare var $: any; // Declare $ as a variable to access jQuery
declare var window: any; // Declare $ as a variable to access jQuery

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent {

  projectForm !: FormGroup;
  fireBaseStorage = inject(FireBaseStorageService2);

  percentageImg: Number = 0;
  percentageVideo: Number = 0;
  isLoading: boolean = false;
  isDataComing: boolean = false;
  projects: Project[] = [];
  displayedColumns: string[] = ['name', 'rating', 'image'];

  toastr: ToastrService = inject(ToastrService);

  formModalProject: any;

  toUpdateVideoUrl : String  = ""

  FileImg ! : FileList
  FileVideo! : File ;
  
  //pagination limit
  limit : number = 10

  editMode : boolean = false;

  //To check if fileImg has been chosen while wanting to update
  withFileImg : boolean = false;
  withFileVideo : boolean = false;

//uncomment for dataTable
 // dtOptions: DataTables.Settings = {};

 //for the select type
  previousSelectedValue !: string 

  //to show the  image of a project
  toUpdateImageUrls !: string[];

//to highlight selected image
  selectedImageIndex: number = -1;


  constructor(private fb: FormBuilder,private el: ElementRef) {}



  ngOnInit() {
    this.iniForm()

    this.fetchProject();
    this.initformModalProject();
  }

  initformModalProject(){
    this.formModalProject = new window.bootstrap.Modal(
     $('#formModalProject')
    )
  }


  iniForm(){
    this.projectForm = this.fb.group({
      id: [null],
      title: ['', [Validators.required, Validators.maxLength(40)]],
      minDescription: ['', [Validators.required, Validators.maxLength(90)]],
      fullDescription: ['', [Validators.required, Validators.maxLength(500)]],
      usedTools: ['', [Validators.required, Validators.maxLength(100) ,Validators.pattern('^(?:[a-zA-Z0-9]+,)*[a-zA-Z0-9]+$')]],
      videoFile: [null, [Validators.required]],
      imgsFile: [null, Validators.required],
    });
  }



  addNewProject(){
    this.formModalProject.show();
  }


  onImageChange(event: any) {
    const fileList  =  event.target.files as FileList;
    if (!fileList[0].type.startsWith('image/') && !fileList[1].type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    this.FileImg = fileList;
    console.log(this.FileImg)

    // //Si on charge une image alors qu'on a edit mode , l'image dois etre mise a jour dans le db
    // if(this.editMode){
    //   this.withFile = true

    // }
  }

  onVideoChange(event: any) {
    const file = event.target.files[0];
    if (!file.type.startsWith('video/')) {
      alert('Please select an video file.');
      return;
    }
    this.FileVideo = file;

    // //Si on charge une image alors qu'on a edit mode , l'image dois etre mise a jour dans le db
    // if(this.editMode){
    //   this.withFile = true

    // }
  }

  
  fetchProject() {
    this.isDataComing = true;
    this.fireBaseStorage.getProjects(this.limit);
    this.fireBaseStorage.abilitiesSubject.subscribe((projects) => {
      this.isDataComing = false;
      this.projects = projects;

    });
  }
  

  // onImageChange(event: any) {
  //   const fileImg = event.target.files[0];
  //   if (!fileImg.type.startsWith('image/')) {
  //     alert('Please select an image file.');
  //     return;
  //   }
  //   this.fileImg = fileImg;

  //   //Si on charge une image alors qu'on a edit mode , l'image dois etre mise a jour dans le db
  //   if(this.editMode){
  //     this.withFileImg = true
  //     this.withFileVideo= true

  //   }
  // }


  // onVideoChange(event: any) {
  //   const fileVideo = event.target.files[0];
  //   if (!fileVideo.type.startsWith('video/')) {
  //     alert('Please select an vide file.');
  //     return;
  //   }
  //   this.fileVideo = fileVideo;

  //   //Si on charge une image alors qu'on a edit mode , l'image dois etre mise a jour dans le db
  //   if(this.editMode){
  //     this.withFileImg = true
  //     this.withFileVideo = true

  //   }
  // }


  onSubmit() {
    this.projectForm.markAllAsTouched();
    if (this.projectForm.valid) {
      this.isLoading = true;

      let formData = this.projectForm.value;
      let project = formData as Project;
      let usedTools = this.splitAndTrim(this.projectForm.get("usedTools")?.value) 

      project.usedTools = usedTools;
      project.imgsFile=this.FileImg;
      project.videoFile=this.FileVideo;
      this.fireBaseStorage.percentageImg.subscribe((percentage) => {
        this.percentageImg = percentage;
      });

      this.fireBaseStorage.percentageVideo.subscribe((percentage) => {
        this.percentageVideo = percentage;
      });

      if(this.editMode){
       // this.updateProject(Project)

      }else{
        this.fireBaseStorage.addProject(project).then((value) => {
          console.log(value.status)
          this.isLoading = false;
          if (value.status) {

            this.formModalProject.hide();
            this.toastr.success(value.message??"");

            this.projectForm.reset()
          }
          if(!value.status){
            this.toastr.error(value.message??"");
          }

        });
      }
    }
  }

  getStarArray(length: number) {
    return new Array(length).fill(0);
  }

  getNext(){
    this.fireBaseStorage.getNextAbilities()
  }

  getPrevious(){
    this.fireBaseStorage.getPreviousAbilities()
  }


async deleteproject(Project:Project){
//  let response = await this.fireBaseStorage.deleteProject(Project);
//  response.status?  this.toastr.success(response.message!) :  this.toastr.error(response.message!);
}





switchToEditMode(project : Project){
  this.toUpdateImageUrls=project.imgsLink!;
  this.toUpdateVideoUrl = project.demoLink;
  console.log("tstounet"+this.toUpdateVideoUrl)


  this.editMode = true

  //pour cutumize validation
  // this.projectForm = this.fb.group({
  //   id: [null],
  //   name: ['', [Validators.required, Validators.maxLength(40)]],
  //   type: [Project.type,Validators.required],
  //   image: [''],
  //   rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]]
  // });

  this.projectForm.patchValue({
    id: project.id,
    title: project.title,
    minDescription: project.minDescription,
    fullDescription: project.fullDescription,
    usedTools: project.usedTools,

  })
  this.formModalProject.show();
}






// async updateProject(Project : Project){
//   let response = await this.fireBaseStorage.updateProject(Project,this.fileImg,this.withFileImg,this.withFileVideo);
//   this.editMode = false;
//   this.isLoading = false;
//   this.formModalProject.hide();
//   this.projectForm.reset({type : ['']})
//   this.iniForm()
//   this.fileImg = new File([], 'none'); 
//   this.previousSelectedValue="default";

//   response.status?  this.toastr.success(response.message!) :  this.toastr.error(response.message!);
// }




cancelEditing(){
  this.projectForm.reset({type : ['']})
  this.editMode = false;
  this.formModalProject.hide();
  this.iniForm()
}





OnImageClicked(imgUrel: string,index : number) {
  this.selectedImageIndex=index;

}


//Helper Function that can be externalize

scrollToElement(elementId: string): void {
  const element = this.el.nativeElement.querySelector(`#${elementId}`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
  }
}


truncateText(text: string): string {
  const screenWidth = window.innerWidth;

  if (screenWidth < 600) {
    // Truncate to a shorter length for smaller screens
    return text.length > 7 ? text.substring(0, 7) + '...' : text;
  } else {
    // Default truncation length for larger screens
    return text.length > 30 ? text.substring(0, 30) + '...' : text;
  }
}



 splitAndTrim(text : String) {
  const words = text.split(',');
  // Trim leading and trailing whitespace from each word
  return words.map(word => word.trim());
}


}
  

