import { IsString, IsNotEmpty, IsObject, IsNumber } from 'class-validator';

export class AutosaveDto {
  @IsString()
  @IsNotEmpty()
  invitationId: string;

  @IsNumber()
  versionNumber: number;

  @IsObject()
  editorData: any; // Canvas JSON state
}
