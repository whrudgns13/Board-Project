import { Body, Controller, Get, Param, Post, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
   private userService : UsersService
  ){}

  @Get()
  findAll(){
    return this.userService.findAll();
  }

  @Get("user")
  findUser(@Req() req : Request, @Res() res: Response){
    return this.userService.findUser(req, res);
  }

  @Post("/join")
  create(@Req() req : Request, @Res() res: Response){   
    return this.userService.create(req, res);
  }

  @Post("/mail")
  mail(@Body() body){
    const { email } = body;
    return this.userService.sendMail(email);
  }

  @Get("/authenticate")
  authenticate(@Req() req : Request, @Res() res: Response){
    return this.userService.authenticate(req,res);
  }

  @Post("/login")
  login(@Req() req : Request, @Res() res: Response){
    return this.userService.login(req, res);
  }

  @Get("/logout")
  logout(@Res() res: Response){
    return this.userService.logout(res);
  }
}
