import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Posts } from './entity/Posts.entity';
import { Repository } from 'typeorm';
import { PostsCreateDto } from './dto/PostsCreatDTO.dto';
import { Request, Response } from 'express';
import { AuthenticationService } from 'src/jwt/Authentication.service';
import { join } from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { Comments } from './entity/Comments.entity';
import { CommentDto } from './dto/CommentDto.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Posts)
    private postsRepository : Repository<Posts>,
    @InjectRepository(Comments)
    private commentsRepository : Repository<Comments>,
    private authService : AuthenticationService,
  ){}

  findAllPosts(){
    return this.postsRepository.find();
  }

  async findOnePost(post_id: number) {
    const where = {post_id};
    const post = await this.postsRepository.findOne({where});
    const comments = await this.findComments(post_id);

    return {
      post,
      comments
    };  
  }

  async createPost(postData : PostsCreateDto, req : Request, res : Response){
    try{
      const {title, content} = postData;
      const {token} = this.authService.authenticateToken(req, res);
      await this.postsRepository.save({title, content, email : token.email})
      return res.sendStatus(200);
    }catch(error){
      return res.status(401).send({message : error});
    }
  }

  findComments(post_id : number){
    const where = {post_id};
    return this.commentsRepository.find({where});
  }

  async createComment(commentData : CommentDto, req : Request, res : Response){
    try{
      const {post_id, content} = commentData;
      const {token} = this.authService.authenticateToken(req, res);

      await this.commentsRepository.save({
        post_id,
        content,
        email : token.email
      });

      return res.sendStatus(200);
    }catch(error){
      return res.status(401).send({message : error});
    }
  }

  async modifyComment(commentData : CommentDto, req : Request, res : Response){
    try{
      const {content, comment_id} = commentData;
      this.authService.authenticateToken(req, res);

      await this.commentsRepository.update(comment_id,{
        content,
      });

      return res.sendStatus(200);
    }catch(error){
      return res.status(401).send({message : error});
    }
  }

  async upload(file: Express.Multer.File) {
    // const bool = await this.fileDuplicateCheck(file);
    
    return {path : file.originalname};
  } 

  async fileDuplicateCheck(uploadFile: Express.Multer.File){
    //const uploadFile = req.file;

    const fileRoot = join(__dirname,"..","..",`public`);
    //업로드된 파일 가져오기
    const fileContent = fs.readFileSync(fileRoot+`/${uploadFile.originalname}`);
    //파일 해쉬 계산
    const fileHash = crypto.createHash('md5').update(fileContent).digest('hex');

    const isFileDuplicate = await (() => {
      return new Promise((resolve, reject) => {
        //폴더 내에 파일 목록 가져오기
        fs.readdir('public', (error, files) => {
          if (error) {
            reject('오류발생');
          }

          //가져온 파일 루프
          const isDuplicate = files.some((file) => {
            if (file === uploadFile.originalname) {
              return true;
            }

            const existFileContent = fs.readFileSync(`${fileRoot}/${file}`);
            const existFileHash = crypto
              .createHash('md5')
              .update(existFileContent)
              .digest('hex');

            if (fileHash === existFileHash) {
              //파일 삭제
              fs.unlinkSync(`${fileRoot}/${uploadFile.originalname}`);
              // res.send({path : `image/${file}`});
              return true;
            }

            return false;
          });

          resolve(isDuplicate);
        });
      });
    })();

    return isFileDuplicate;
  };
}
