export interface UploadResultForManyFiles {
    progress: number;
    downloadLinks: string[];
}

export interface UploadResultForOneFile {
    progress: number;
    downloadLink: string;
}