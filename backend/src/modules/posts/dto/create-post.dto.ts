import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  description: string;

  @IsOptional()
  @IsString()
  image?: string;
}
