import { FieldValue } from "firebase/firestore";

export class Project {
    constructor(
        public id : string,
        public minDescription : string,
        public fullDescription : string,
        public imgsLink : string [],
        public usedTools : string[],
        public usefullLinks : string[],
        public demoLink :  string,
        public title : string ,
        public imgsFile : FileList,
        public videoFile : File,
        public type : string,
        public profilePicture : File,
        public ppLink : string,
        public placeIndex : number,
        public isVisible  : boolean =  false,
        public createdAt : FieldValue

        ) {
    }
}