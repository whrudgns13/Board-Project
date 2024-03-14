import { IsString } from "class-validator";

export class FindUserDto{
  @IsString()
  name? : string;

  @IsString()
  id? : string;

  @IsString()
  password? : string;

  @IsString()
  email? : string;
}