import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("navigationInfo")
  getHello(@Res() res : Response) {
    console.log(join(__dirname,"..","public"));
    return {
      HelloWorld : "a"
    }
    // return res.sendFile(__dirname+"../public/NavigationList.json");
  }
}
