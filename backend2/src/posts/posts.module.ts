import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posts } from './entity/Posts.entity';
import { AuthenticationService } from 'src/jwt/Authentication.service';
import { FileUploaderService } from './file-uploader.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  imports : [
    TypeOrmModule.forFeature([Posts]),
    MulterModule.register({
      storage: diskStorage({              // 파일을 디스크에 저장하기위한 제어기능
        destination: function(req, file, cb){  // 파일 업로드위치
          console.log("destination");
          cb(null, `public`);           
        },
        filename: function (req, file, cb) {   // 파일명
          console.log("filename");
          cb(null, file.originalname);	
        }
      })
    })
  ],
  controllers : [PostsController],
  providers : [PostsService, AuthenticationService, FileUploaderService]
})
export class PostsModule {}
