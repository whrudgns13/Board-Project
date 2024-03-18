import { IsNotEmpty, IsString } from "class-validator";

export class PostsCreateDto {

  @IsString()
  @IsNotEmpty()
  public title: string;
  
  @IsString()
  @IsNotEmpty()
  public content: string;

}