import multer from "multer";
import crypto from "crypto";
import fs from "fs";


const upload = multer({
  storage: multer.diskStorage({              // 파일을 디스크에 저장하기위한 제어기능
    destination: function(req, file, cb){  // 파일 업로드위치
        cb(null, `image`);           
    },
    filename: function (req, file, cb) {   // 파일명
      console.log(file);
      cb(null, file.originalname);	
    }
  })
});

const fileDuplicateCheck = (uploadFile, res) =>{
  //const uploadFile = req.file;

  //업로드된 파일 가져오기
  const fileContent = fs.readFileSync(`./image/${uploadFile.originalname}`);
  //파일 해쉬 계산
  const fileHash = crypto.createHash('md5').update(fileContent).digest('hex');
  
  //폴더 내에 파일 목록 가져오기
  fs.readdir("image",(error, files)=>{
    if(error){
      console.log(error);
      return res.status(500).send({message : "오류발생"})
    }

    //가져온 파일 루프
    const isDuplicate = files.some((file)=>{
      if(file===uploadFile.originalname){
        return true;
      }

      const existFileContent = fs.readFileSync(`./image/${file}`);
      const existFileHash = crypto.createHash("md5").update(existFileContent).digest('hex');

      if(fileHash === existFileHash){
        //파일 삭제
        fs.unlinkSync(`./image/${uploadFile.originalname}`);
        res.send({path : `image/${file}`}); 
        return true;
      }
      return false;
    })
    
    if(!isDuplicate){
      res.send({path : `image/${uploadFile.originalname}`});
    }

  });
  
}

module.exports = {
  uploader : upload,
  fileDuplicateCheck
}