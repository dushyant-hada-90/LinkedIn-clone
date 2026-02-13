import { IsString, MinLength } from 'class-validator';

export class EditCommentDto {
  @IsString()
  @MinLength(1)
  newContent: string;
}
