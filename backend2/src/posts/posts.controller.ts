import { Body, Controller, Get, Param, Patch, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsCreateDto } from './dto/PostsCreatDTO.dto';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { getMulterOption } from './multerOption';
import { CommentDto } from './dto/CommentDto.dto';


@Controller('posts')
export class PostsController {
  constructor(
   private postsService : PostsService,
  ){}

  @Get()
  findAllPosts(){
    return this.postsService.findAllPosts();
  }

  @Get("/:id")
  findOnePost(@Param("id") post_id : number){
    console.log(post_id);
    return this.postsService.findOnePost(post_id);
  }

  @Post()
  createPost(@Body() postData : PostsCreateDto, @Req() req : Request, @Res() res : Response){
    return this.postsService.createPost(postData, req, res);
  }

  @Post("/upload")
  @UseInterceptors(FileInterceptor("file", getMulterOption()))
  uploadFile(@UploadedFile() file : Express.Multer.File){
    return this.postsService.upload(file);
  }

  @Post("/comment")
  createComment(@Body() commentData : CommentDto, @Req() req : Request, @Res() res : Response){
    return this.postsService.createComment(commentData, req, res);
  }

  @Patch("/comment")
  modifyComment(@Body() commentData : CommentDto, @Req() req : Request, @Res() res : Response){
    return this.postsService.modifyComment(commentData, req, res);
  }

}
