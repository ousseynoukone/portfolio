export interface ProjectDto {
     id : string,
     minDescription : string,
     fullDescription : string,
     imgsLink : string [],
     usedTools : string[],
     demoLink :  string,
     title : string 
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
     projectImgsLinks : string [   ]
}