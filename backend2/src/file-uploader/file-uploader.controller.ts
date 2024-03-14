import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { Response } from 'express';

@Controller('file-uploader')
export class FileUploaderController {
  @Post('/imgUpload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() uploadFile: Express.Multer.File, res: Response) {
    //업로드된 파일 가져오기
    const fileContent = fs.readFileSync(`./image/${uploadFile.originalname}`);
    //파일 해쉬 계산
    const fileHash = crypto.createHash('md5').update(fileContent).digest('hex');

    //폴더 내에 파일 목록 가져오기
    fs.readdir('image', (error, files) => {
      if (error) {
        console.log(error);
        return res.status(500).send({ message: '오류발생' });
      }

      //가져온 파일 루프
      const isDuplicate = files.some((file) => {
        if (file === uploadFile.originalname) {
          return true;
        }

        const existFileContent = fs.readFileSync(`./image/${file}`);
        const existFileHash = crypto
          .createHash('md5')
          .update(existFileContent)
          .digest('hex');

        if (fileHash === existFileHash) {
          //파일 삭제
          fs.unlinkSync(`./image/${uploadFile.originalname}`);
          res.send({ path: `image/${file}` });
          return true;
        }
        return false;
      });

      if (!isDuplicate) {
        res.send({ path: `image/${uploadFile.originalname}` });
      }
    });
  }
}
