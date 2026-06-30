export interface IStorageProvider {
  uploadFile(file: Express.Multer.File): Promise<string>;
  deleteFile(fileUrl: string): Promise<boolean>;
}
