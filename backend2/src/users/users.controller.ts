import { Body, Controller, Get, Param, Post, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { AuthenticationService } from 'src/jwt/Authentication.service';
import { Users } from './entity/Users.entity';

@Controller('users')
export class UsersController {
  constructor(
   private userService : UsersService
  ){}

  @Get()
  findAll(){
    return this.userService.findAll();
  }

  find(id : string){
   
  }

  @Post("/join")
  create(@Req() req : Request, @Res() res: Response){   
    console.log("접근2");
    return this.userService.create(req, res);
  }

  @Post("/mail")
  mail(@Body() body){
    console.log("접근");
    const { email } = body;
    return this.userService.sendMail(email);
  }

  @Get("/authenticate")
  authenticate(@Req() req : Request, @Res() res: Response){
    console.log(req.cookies);
    return this.userService.authenticate(req,res);
  }

  @Post("/login")
  login(@Req() req : Request, @Res() res: Response){
    return this.userService.login(req, res);
  }

}
