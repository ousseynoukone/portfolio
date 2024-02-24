export class Project {
    constructor(
        public id : Number,
        public minDescription : string,
        public fullDescription : string,
        public imgs : string[],
        public usedTools : string[],
        public demo :  string,
        public title : string ,
        ) {
    }
}