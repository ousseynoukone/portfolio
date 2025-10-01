// abilities.component.ts
import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProjectDto, ProjectFileUpdateDto, WithImgVideoDto } from 'src/app/models/dtos/projectDto';
import { Project } from 'src/app/models/project';
import { FireBaseProjectService } from 'src/app/services/firebaseProjectServices';
import {  PassDataThrough, ValidatorsRegex } from 'src/app/portfolio/shared/sharedService';
import { ActivatedRoute, Router } from '@angular/router';
import { Helpers } from 'src/app/portfolio/shared/helper';
import { removeStringFromArray } from 'src/app/services/helpers/helper';


declare var $: any; // Declare $ as a variable to access jQuery
declare var window: any; 

@Component({
    selector: 'app-projects',
    templateUrl: './projects.component.html',
    styleUrls: ['./projects.component.css'],
    standalone: false
})
export class ProjectsComponent {

  @ViewChild('imageInput') imageInputRef !: ElementRef<HTMLInputElement>;
  @ViewChild('imageAddInput') imageAddInput !: ElementRef<HTMLInputElement>; 
  @ViewChild('videoInput') videoInputRef ! : ElementRef<HTMLInputElement>;
  @ViewChild('imageProfileInput') imageProfileInputRef ! : ElementRef<HTMLInputElement>;

  shareData = inject(PassDataThrough)

  projectForm !: FormGroup;
  fireBaseStorage = inject(FireBaseProjectService);

  options = [
    { value: '', label: 'Select an option' }, // Default option
    { value: 'mobile', label: 'Mobile' },
    { value: 'web', label: 'Web' },
  ];


  isLoading: boolean = false;
  isUpdatingMultimedia: boolean = false;
  isDataComing: boolean = false;
  isAddinggNewImage: boolean = false;
  projects: Project[] = [];
  displayedColumns: string[] = ['name', 'rating', 'image'];

  toastr: ToastrService = inject(ToastrService);

  formModalProject: any;

  toUpdateVideoUrl : String  = ""
  
  FileImg ! : FileList
  FileVideo! : File ;
  profileImg! : File ;

  newImgToAdd! : File;

  projectPPlink : string = ""


  editMode : boolean = false;

  imgToBeUpdatedWith !: File ;
  videoToBeUpdatedWith !: File ;

//uncomment for dataTable
 // dtOptions: DataTables.Settings = {};

 //for the select type
  previousSelectedValue !: string 

  //to show the  image of a project
  toUpdateImageUrls !: string[];

//to highlight selected image
  selectedImageIndex: number = -1;
  selectedImageToUpdateUrl !: string;

  
  updateProjectDetailForUpdateImgAndVideoOnly : any = {}
  isDeletingOneImage: boolean = false;

  validator=inject(ValidatorsRegex)
  helper = inject(Helpers)
  isChangingVisibility: boolean = false;


  //for displaying a loader while image is loading
  imagesLoaded: boolean[] = [];
  ppIsLoaded: boolean=false;

  constructor(private fb: FormBuilder,private el: ElementRef, private router: Router,private route: ActivatedRoute) {}



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
      minDescription: ['', [Validators.required, Validators.maxLength(70)]],
      fullDescription: ['', [Validators.required, Validators.maxLength(500)]],
      usedTools: ['', [Validators.required, Validators.maxLength(100) ,Validators.pattern(this.validator.validateUsedTools)]],
      usefullLinks: ['', [Validators.required, Validators.maxLength(200), Validators.pattern(this.validator.validateUrl)]],
      videoFile: [null, [Validators.required]],
      imgsFile: [null, Validators.required],
      imageProfileInput: [null, Validators.required],
      type: ['',Validators.required],
      

    });
  }



  addNewProject(){
    this.formModalProject.show();
  }



  onImageChange(event: any,isEditMode : boolean,isForAddingOneImage : boolean) {
    const fileList  =  event.target.files as FileList;
    if (!fileList[0].type.startsWith('image/') && !fileList[1].type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    this.FileImg = fileList;

    //Si on charge une image alors qu'on a edit mode , l'image dois etre mise a jour dans le db

    if(isEditMode){
      this.imgToBeUpdatedWith = event.target.files[0]
    }

    if(isForAddingOneImage){
      this.newImgToAdd =  event.target.files[0];
    }
  }

  initImagesLoaded(imglink : string []) {
    this.imagesLoaded = Array(imglink.length).fill(false);
  }

  onImageLoad(index: number,isPP:boolean) {
    if(isPP){
      this.ppIsLoaded= true;
    }else{
      this.imagesLoaded[index] = true;
    }
  }
  
  onImageProfileChange(event: any) {
    const pp  =  event.target.files[0];
    if (!pp.type.startsWith('image/') && !pp.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    this.profileImg = pp;
  }
  






  onVideoChange(event: any,isEditMode : boolean) {
    const file = event.target.files[0];
    if (!file.type.startsWith('video/')) {
      alert('Please select an video file.');
      return;
    }
    this.FileVideo = file;

    if(isEditMode){
      this.videoToBeUpdatedWith = file;
    }

  }

  
  fetchProject() {
    this.isDataComing = true;
    this.fireBaseStorage.getProjects()
    this.fireBaseStorage.projectSubject.subscribe((projects) => {
      this.isDataComing = false;
      this.projects = projects;

    });
  }
  



  onSubmit() {
    this.projectForm.markAllAsTouched();
    if (this.projectForm.valid) {
      this.isLoading = true;

      let formData = this.projectForm.value;
      let project = formData as Project;
      let usedTools = this.helper.splitAndTrim(this.projectForm.get("usedTools")?.value) 
      let usefullLinks = this.helper.splitAndTrim(this.projectForm.get("usefullLinks")?.value) 

      project.usedTools = usedTools;
      project.usefullLinks = usefullLinks
      project.imgsFile=this.FileImg;
      project.videoFile=this.FileVideo;
      project.profilePicture = this.profileImg
      if(this.editMode){
       this.updateProjectOnly(project)

      }else{
        this.fireBaseStorage.addProject(project).then((value) => {
          this.isLoading = false;
          if (value.status) {
            this.formModalProject.hide();
            this.toastr.success(value.message??"");

            this.projectForm.reset({type : ['']})

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
    this.fireBaseStorage.getNextProject()
  }

  getPrevious(){
    this.fireBaseStorage.getPreviousProject()
  }


async deleteproject(Project:Project){
 let response = await this.fireBaseStorage.deleteProject(Project);
 response.status?  this.toastr.success(response.message!) :  this.toastr.error(response.message!);
}





switchToEditMode(project : Project){
  this.toUpdateImageUrls=project.imgsLink!;
  //Initier le tableau qui contient l'indice des images déja chargé dans la vue 
  this.initImagesLoaded(project.imgsLink)
  this.toUpdateVideoUrl = project.demoLink;
  this.projectPPlink = project.ppLink

  this.updateProjectDetailForUpdateImgAndVideoOnly.projectID = project.id
  this.updateProjectDetailForUpdateImgAndVideoOnly.imgsLink = project.imgsLink
  this.updateProjectDetailForUpdateImgAndVideoOnly.demoLink = project.demoLink


  this.editMode = true
  this.previousSelectedValue=project.type!;

  //pour cutumize validation
  this.projectForm = this.fb.group({
    id: [null],
    title: ['', [Validators.required, Validators.maxLength(40)]],
    minDescription: ['', [Validators.required, Validators.maxLength(70)]],
    fullDescription: ['', [Validators.required, Validators.maxLength(500)]],
    usedTools: ['', [Validators.required, Validators.maxLength(100) ,Validators.pattern(this.validator.validateUsedTools)]],
    usefullLinks: ['', [Validators.required, Validators.maxLength(200), Validators.pattern(this.validator.validateUrl)]],
    type: [project.type,Validators.required],
    videoFile: [null],
    imgsFile: [null],

  });


  this.projectForm.patchValue({
    id: project.id,
    title: project.title,
    minDescription: project.minDescription,
    fullDescription: project.fullDescription,
    usedTools: this.helper.arrayToString(project.usedTools),
    usefullLinks: this.helper.arrayToString(project.usefullLinks),

  })
  this.formModalProject.show();
}





async updateProjectOnly(project : Project){
  const projectDto :  ProjectDto = {
    id  : project.id,
    minDescription : project.minDescription,
    fullDescription :  project.fullDescription,
    imgsLink : project.imgsLink,
    usedTools : project.usedTools,
    demoLink : project.demoLink,
    title : project.title ,
    type : project.type,
    ppLink : project.ppLink,
    isVisible : true,
    usefullLinks : project.usefullLinks,
    placeIndex: null,
    createdAt:project.createdAt
    
  }

  let response = await this.fireBaseStorage.updateProjectOnly(projectDto);
  // this.editMode = false;
  this.isLoading = false;
  // this.formModal.hide();
  // this.abilityForm.reset({type : ['']})
  // this.iniForm()
 // this.file = new File([], 'none'); 

  response.status?  this.toastr.success(response.message!) :  this.toastr.error(response.message!);
}











async updateProjectVisibility(project : Project){
  this.isChangingVisibility = true;
  const projectDto = {
    id  : project.id,
    isVisible : project.isVisible ? false : true
  }
  let response = await this.fireBaseStorage.updateProjectVisibility(projectDto);
  this.isChangingVisibility = false;
   project.isVisible = !project.isVisible
  response.status?  this.toastr.success(response.message!) :  this.toastr.error(response.message!);
}




  async updateVideoImage(){
    this.isUpdatingMultimedia = true;

    let withImage = false
    let withVideo = false

    if(this.imgToBeUpdatedWith)
    {
      withImage = true
    }
    if(this.videoToBeUpdatedWith){
      withVideo = true
    }

    let projectFileUpdateDto : ProjectFileUpdateDto = {
      projectID:   this.updateProjectDetailForUpdateImgAndVideoOnly.projectID,
      videoFile: this.videoToBeUpdatedWith,
      imgFile: this.imgToBeUpdatedWith,
      projectImgsLinks: this.updateProjectDetailForUpdateImgAndVideoOnly.imgsLink
    
    }
  

    let withImgVideoDto: WithImgVideoDto = {
      withImage: withImage,
      withVideo: withVideo,
      imgTpUpdateLink: this.selectedImageToUpdateUrl,
      demoLink: this.updateProjectDetailForUpdateImgAndVideoOnly.demoLink
    }


  let response = await this.fireBaseStorage.updateProjectVideoImgOnly(projectFileUpdateDto,withImgVideoDto);
  this.resetInputs()
 
  this.isUpdatingMultimedia = false;

  // this.file = new File([], 'none'); 
  // this.previousSelectedValue="default";
  // this.withFile=false
  response.status?  this.toastr.success(response.message!) :  this.toastr.error(response.message!)

}



  async updatePP(){
    if(this.profileImg ==undefined){
    
      this.toastr.error("Please upload the img. ")
    }else{
  let projectImgsLinks = this.updateProjectDetailForUpdateImgAndVideoOnly.imgsLink
  let  projectID = this.updateProjectDetailForUpdateImgAndVideoOnly.projectID
  let  img = this.profileImg
  let imgLink = this.projectPPlink
  let response  = await this.fireBaseStorage.updatePP(projectImgsLinks,projectID,img,imgLink)
  response.status?  this.toastr.success(response.message!) :  this.toastr.error(response.message!)
    }
}


async deleteOnImage(imgLink:string){
  this.isDeletingOneImage= true
 let projectID =   this.updateProjectDetailForUpdateImgAndVideoOnly.projectID;
 let projectImgsLinks =  this.updateProjectDetailForUpdateImgAndVideoOnly.imgsLink;
 let imgToDeleteLink = imgLink
 let response = await this.fireBaseStorage.deleteOneImage(projectImgsLinks,imgToDeleteLink,projectID)

 if(response.status){
  this.toastr.success(response.message!)
  // Update the view
  this.toUpdateImageUrls = removeStringFromArray( this.toUpdateImageUrls , imgToDeleteLink);

 }else{
  this.toastr.error(response.message!)
 }

 this.isDeletingOneImage=false



}


  async addNewImageToProject(){
    if(this.newImgToAdd==undefined){
    
      this.toastr.error("Please choose an image on the field above")
    }else{
      this.isAddinggNewImage= true
      let img = this.newImgToAdd
      let projectImgsLinks =  this.updateProjectDetailForUpdateImgAndVideoOnly.imgsLink;
      let projectID =   this.updateProjectDetailForUpdateImgAndVideoOnly.projectID;
      let response = await this.fireBaseStorage.addOneImageToProject(img,projectImgsLinks,projectID)
      response.status?  this.toastr.success(response.message!) :  this.toastr.error(response.message!)
      this.resetInputs()
      this.isAddinggNewImage= false

    }


}



saveChange(){
  this.projectForm.reset({type : ['']})
  this.editMode = false;
  this.formModalProject.hide();
  this.iniForm()
}








close(){
  // this.iniForm()
  this.saveChange()
}



OnImageClicked(imgUrl: string,index : number) {
  this.selectedImageIndex=index;
  this.selectedImageToUpdateUrl = imgUrl;
}

resetInputs() {
  this.imageInputRef.nativeElement.value = '';
  this.imageAddInput.nativeElement.value = '';
  this.videoInputRef.nativeElement.value = '';
  this.imageProfileInputRef.nativeElement.value = '';
}


gotoProjectOrderingPage(project : Project){
  this.shareData.setData=project
  this.router.navigate(['order-images'], {relativeTo:this.route});
}



navigateToOrderProject(){
  this.router.navigate(['order-projects'], {relativeTo:this.route});

}












//Helper Function 

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







}
  

