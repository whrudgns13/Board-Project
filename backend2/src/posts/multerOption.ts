
import { diskStorage } from 'multer';

import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
export const getMulterOption = () => {
  const options : MulterOptions = {
    storage: diskStorage({
      // 파일을 디스크에 저장하기위한 제어기능
      destination: function (req, file: Express.Multer.File, cb) {
        cb(null, `public`);
      },
      filename: function (req, file, cb) {
        // 파일명
        cb(null, file.originalname);
      },      
    }),
    limits: {
      fileSize: 1024 * 1024 * 5, // 5 MB
      files: 1,
    },
    fileFilter : function(req, file, cb){
      //2번째인자 true이면 저장 false이면 저장안함
      cb(null, true);
    }
  };

  return options;
};

