import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CommentDto {

  @IsInt()
  @IsOptional()
  public post_id: number;
  
  @IsString()
  @IsNotEmpty()
  public content: string;

  
  @IsInt()
  @IsOptional()
  public comment_id: number;

}