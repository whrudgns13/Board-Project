import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CommentCreateDto {

  @IsInt()
  @IsNotEmpty()
  public post_id: string;
  
  @IsString()
  @IsNotEmpty()
  public content: string;

}