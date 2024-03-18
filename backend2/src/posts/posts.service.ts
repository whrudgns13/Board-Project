import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Posts } from './entity/Posts.entity';
import { Repository } from 'typeorm';
import { PostsCreateDto } from './dto/PostsCreatDTO.dto';
import { Request, Response } from 'express';
import { AuthenticationService } from 'src/jwt/Authentication.service';
import { FileUploaderService } from './file-uploader.service';
import { join } from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Posts)
    private postsRepository : Repository<Posts>,
    private authService : AuthenticationService,
    private fileService : FileUploaderService
  ){}

  findAll(){
    return this.postsRepository.find();
  }

  async findOne(post_id: string) {
    const where = {post_id};
    const value = await this.postsRepository.findOne({where});
    
    return value;  
  }

  create(postData : PostsCreateDto, req : Request, res : Response){
    try{
      const {title, content} = postData;
      const {token} = this.authService.authenticateToken(req, res);
      return this.postsRepository.save({title, content, email : token.email});
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
