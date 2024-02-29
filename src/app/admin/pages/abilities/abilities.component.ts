// abilities.component.ts
import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Ability } from 'src/app/models/abilitie';
import { FireBaseStorageService } from 'src/app/services/firebaseService';

declare var $: any; // Declare $ as a variable to access jQuery
declare var window: any; // Declare $ as a variable to access jQuery

@Component({
  selector: 'app-abilities',
  templateUrl: './abilities.component.html',
  styleUrls: ['./abilities.component.css']
})
export class AbilitiesComponent implements OnInit {
  abilityForm !: FormGroup;
  fireBaseStorage = inject(FireBaseStorageService);
  file !: File;
  percentage: Number = 0;
  isLoading: boolean = false;
  isDataComing: boolean = false;
  abilities: Ability[] = [];
  displayedColumns: string[] = ['name', 'rating', 'image'];

  toastr: ToastrService = inject(ToastrService);

  formModal: any;

  toUpdateImageUrl : String  = ""


  options = [
    { value: '', label: 'Select an option' }, // Default option
    { value: 'fr', label: 'Framework' },
    { value: 'lg', label: 'Language' },
    { value: 'ac', label: 'Architecture & Concept' },
  ];
  
  //pagination limit
  limit : number = 10

  editMode : boolean = false;

  //To check if file has been chosen while wanting to update
  withFile : boolean = false;

//uncomment for dataTable
 // dtOptions: DataTables.Settings = {};

 //for the select type
  previousSelectedValue !: string 

  constructor(private fb: FormBuilder,private el: ElementRef) {}



  ngOnInit() {
    this.iniForm()

    this.fetchAbilities();
    this.initFormModal();
  }

  initFormModal(){
    this.formModal = new window.bootstrap.Modal(
     $('#formModal')
    )
  }


  iniForm(){
    this.abilityForm = this.fb.group({
      id: [null],
      type: ['',Validators.required],
      name: ['', [Validators.required, Validators.maxLength(40)]],
      image: ['', Validators.required],
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }



  addNewAbility(){
    this.formModal.show();
  }


  
  fetchAbilities() {
    this.isDataComing = true;
    this.fireBaseStorage.getAbilities(this.limit);
    this.fireBaseStorage.abilitiesSubject.subscribe((abilities) => {
      // this.dtOptions = {
      //   pagingType: 'full_numbers',
      //   lengthMenu : [5, 10, 25],
      //   processing: true
      // };
      this.isDataComing = false;
      this.abilities = abilities;

    });
  }
  

  onImageChange(event: any) {
    const file = event.target.files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    this.file = file;

    //Si on charge une image alors qu'on a edit mode , l'image dois etre mise a jour dans le db
    if(this.editMode){
      this.withFile = true

    }
  }

  onSubmit() {

    this.abilityForm.markAllAsTouched();
    if (this.abilityForm.valid) {
      this.isLoading = true;

      let formData = this.abilityForm.value;
      let ability = formData as Ability;
      this.fireBaseStorage.percentage.subscribe((percentage) => {
        this.percentage = percentage;
      });

      if(this.editMode){
        this.updateAbility(ability)

      }else{
        this.fireBaseStorage.addAbility(ability, this.file).then((value) => {
          this.isLoading = false;
          if (value.status) {
            this.formModal.hide();

            this.abilityForm.reset({type : ['']})
            this.toastr.success('Ability saved successfully :)');
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


async deleteAbility(ability:Ability){
 let response = await this.fireBaseStorage.deleteAbility(ability);
 response.status?  this.toastr.success(response.message!) :  this.toastr.error(response.message!);
}





switchToEditMode(ability : Ability){
  this.previousSelectedValue=ability.type!;
  this.toUpdateImageUrl=ability.image!;

  this.editMode = true
  this.abilityForm = this.fb.group({
    id: [null],
    name: ['', [Validators.required, Validators.maxLength(40)]],
    type: [ability.type,Validators.required],
    image: [''],
    rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]]
  });

  this.abilityForm.patchValue({
    id: ability.id,
    name: ability.name,
    rating: ability.rating,

  })
  this.formModal.show();
}






async updateAbility(ability : Ability){
  let response = await this.fireBaseStorage.updateAbility(ability,this.file,this.withFile);
  this.editMode = false;
  this.isLoading = false;
  this.formModal.hide();
  this.abilityForm.reset({type : ['']})
  this.iniForm()
  this.file = new File([], 'none'); 
  this.previousSelectedValue="default";

  response.status?  this.toastr.success(response.message!) :  this.toastr.error(response.message!);
}









cancelEditing(){
  this.abilityForm.reset({type : ['']})
  this.editMode = false;
  this.formModal.hide();
  this.iniForm()
}

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
