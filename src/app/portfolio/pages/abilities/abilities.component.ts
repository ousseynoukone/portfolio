import { Component, OnInit, ElementRef, inject  } from '@angular/core';
import { Ability } from 'src/app/models/abilitie';
import { FireBaseStorageService } from 'src/app/services/firebaseService';
@Component({
  selector: 'app-abilities',
  templateUrl: './abilities.component.html',
  styleUrls: ['./abilities.component.css']
})
export class AbilitiesComponent implements OnInit {
  //html elemetns
  framework: any;
  langageDeProg: any;
  archiConcept: any;
  gestionProj: any;
  modelisation: any;
  autreCompetence: any;

  //button
  frameworkButton: any;
  langProgButton: any;
  archiConceptButton: any;
  gestionProjetButton: any;
  modelisationButton: any;
  autreCompetenceButton: any;
  
  //array of models
  frameworks: Ability[] = [];
  langageDeProgs: Ability[] = [];
  archiConcepts: Ability[] = [];
  modelisations: Ability[] = [];
  autreCompetences: Ability[] = [];
  gestionProjs: Ability[] = [];

  isDataComing: boolean = false;
  fireBaseStorage = inject(FireBaseStorageService);
  abilities: Ability[] = [];

  constructor(private el: ElementRef) {}


  ngOnInit(): void {
    // Initialize elements in ngOnInit
    this.framework = document.getElementById("framework");
    this.langageDeProg = document.getElementById("langProg");
    this.archiConcept = document.getElementById("archiConcept");
    this.gestionProj = document.getElementById("gestionProjet");
    this.modelisation = document.getElementById("modelisation");
    this.autreCompetence = document.getElementById("autreCompetence");

    this.frameworkButton = document.getElementById("frameworkButton");
    this.langProgButton = document.getElementById("langProgButton");
    this.archiConceptButton = document.getElementById("archiConceptButton");
    this.gestionProjetButton = document.getElementById("gestionProjetButton");
    this.modelisationButton = document.getElementById("modelisationButton");
    this.autreCompetenceButton = document.getElementById("autreCompetenceButton");

    // Show Framework by default
    this.framework.removeAttribute("hidden");
    // Add activeAccent class to frameworkButton by default
    this.frameworkButton.classList.add("activeAccent");

    
    this.addGestionProjCaller();
    this.addModelisationsCaller()
    this.fetchAbilities();

  }

  


  addFrameworks(imgName:string , name : string  , rating  : number ){
    this.frameworks.push(new Ability(null,name,imgName,rating,null));
  }





  addLangageDeProgs(imgName: string, name: string, rating: number) {
    this.langageDeProgs.push(new Ability(null,name, imgName,rating,null));
  }




  addArchiConcepts(imgName: string, name: string) {
    this.archiConcepts.push(new Ability(null,name, imgName,0 ,null ));
  }
  


  addGestionProjCaller() {
    this.addGestionProj('scrum.png', 'Méthodologies Agile (SCRUM)');
    this.addGestionProj('cascade.png', 'Cascade');
  }

  addGestionProj(imgName: string, name: string) {
    this.gestionProjs.push(new Ability(null,name, "../../../../assets/imgs/" + imgName,0,null));
  }



  addModelisationsCaller() {
    this.addModelisations('uml.png', 'UML (Unified Modeling Language)');
    this.addModelisations('merise.png', 'Merise');
  }

  addModelisations(imgName: string, name: string) {
    this.modelisations.push(new Ability(null,name, "../../../../assets/imgs/" + imgName, 0,null));
  }

  showInformation(choice: string) {
    // Hide all sections before showing the selected one
    this.hideAllSections();
    // Remove activeAccent class from all buttons
    this.removeActiveAccentClassFromButtons();
    // Show the selected section
    switch (choice) {
      case "framework":
        this.framework.removeAttribute("hidden");
        this.frameworkButton.classList.add("activeAccent");
        break;
      case "langProg":
        this.langageDeProg.removeAttribute("hidden");
        this.langProgButton.classList.add("activeAccent");
        break;
      case "archiConcept":
        this.archiConcept.removeAttribute("hidden");
        this.archiConceptButton.classList.add("activeAccent");
        break;
      case "gestionProjet":
        this.gestionProj.removeAttribute("hidden");
        this.gestionProjetButton.classList.add("activeAccent");
        break;
      case "modelisation":
        this.modelisation.removeAttribute("hidden");
        this.modelisationButton.classList.add("activeAccent");
        break;
      case "autreCompetence":
        this.autreCompetence.removeAttribute("hidden");
        this.autreCompetenceButton.classList.add("activeAccent");
        this.scrollToElement(choice)

        break;

    
    }


  }

  hideAllSections() {
    // Hide all sections
    if (this.framework) this.framework.setAttribute("hidden", "true");
    if (this.langageDeProg) this.langageDeProg.setAttribute("hidden", "true");
    if (this.archiConcept) this.archiConcept.setAttribute("hidden", "true");
    if (this.gestionProj) this.gestionProj.setAttribute("hidden", "true");
    if (this.modelisation) this.modelisation.setAttribute("hidden", "true");
    if (this.autreCompetence) this.autreCompetence.setAttribute("hidden", "true");
  }

  removeActiveAccentClassFromButtons() {
    // Remove activeAccent class from all buttons
    const buttons = document.querySelectorAll('.badge');
    buttons.forEach(button => {
      button.classList.remove('activeAccent');
    });
  }



  scrollToElement(elementId: string): void {
    const element = this.el.nativeElement.querySelector(`#${elementId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  }




  getStarArray(length: number) {
    return new Array(length).fill(0);
  }



  //































  fetchAbilities() {
    this.isDataComing = true;
    this.fireBaseStorage.getAbilitiesClient();
    this.fireBaseStorage.abilitiesSubject.subscribe((abilities) => {
      this.isDataComing = false;
      this.abilities = abilities;
    });
  }

















}
