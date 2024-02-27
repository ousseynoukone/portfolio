// abilities.component.ts
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Ability } from 'src/app/models/abilitie';
import { FireBaseStorageService } from 'src/app/services/firebaseService';
declare var $: any; // Declare $ as a variable to access jQuery

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
  abilitiesDataSource = new MatTableDataSource<Ability>();
  displayedColumns: string[] = ['name', 'rating', 'image'];

  toastr: ToastrService = inject(ToastrService);

  //pagination limit
  limit : number = 5

  constructor(private fb: FormBuilder) {}



  ngOnInit() {
    this.abilityForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      image: ['', Validators.required],
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]]
    });

    this.fetchAbilities();
  }


  
  fetchAbilities() {
    this.isDataComing = true;
    this.fireBaseStorage.getAbilities(this.limit);
    this.fireBaseStorage.abilitiesSubject.subscribe((abilities) => {
      this.isDataComing = false;
      this.abilities = abilities;
      this.abilitiesDataSource = new MatTableDataSource<Ability>(abilities);
    });
    $('#example').DataTable();

  }
  

  onImageChange(event: any) {
    const file = event.target.files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    this.file = file;
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

      this.fireBaseStorage.addAbility(ability, this.file).then((value) => {
        this.isLoading = false;
        if (value.status) {
          this.abilityForm.reset();
          this.toastr.success('Ability saved successfully :)');
        }
      });
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
}
