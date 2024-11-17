export interface ProjectDto {
     id : string,
     minDescription : string,
     fullDescription : string,
     imgsLink : string [],
     usedTools : string[],
     usefullLinks : string []
     placeIndex : number | null,
     demoLink :  string,
     title : string ,
     type : string,
     ppLink : string,
     isVisible : boolean
}

export interface WithImgVideoDto{
     withImage: boolean,
     withVideo: boolean,
     imgTpUpdateLink:string
     demoLink:string
}


export interface ProjectFileUpdateDto {
     projectID : string,
     videoFile : File
     imgFile : File
     projectImgsLinks : string [],
}


export interface ImgsLinksWithLibelle{
     link : string,
     libelle : string
}