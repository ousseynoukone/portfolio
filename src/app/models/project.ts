export class Project {
    constructor(
        public id : string,
        public minDescription : string,
        public fullDescription : string,
        public imgsLink : string [],
        public usedTools : string[],
        public demoLink :  string,
        public title : string ,
        public imgsFile : FileList,
        public videoFile : File
        ) {
    }
}