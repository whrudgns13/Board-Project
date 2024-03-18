import { Body, Controller, Get, Param, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsCreateDto } from './dto/PostsCreatDTO.dto';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { getMulterOption } from './multerOption';


@Controller('posts')
export class PostsController {
  constructor(
   private postsService : PostsService,
  ){}

  @Get()
  findAll(){
    return this.postsService.findAll();
  }

  @Get("/:id")
  findOne(@Param("id") post_id : string){
    console.log(post_id);
    return this.postsService.findOne(post_id);
  }

  @Post()
  create(@Body() postData : PostsCreateDto, @Req() req : Request, @Res() res : Response){
    return this.postsService.create(postData, req, res);
  }

  @Post("/upload")
  @UseInterceptors(FileInterceptor("file", getMulterOption()))
  uploadFile(@UploadedFile() file : Express.Multer.File){
    return this.postsService.upload(file);
  }

}
