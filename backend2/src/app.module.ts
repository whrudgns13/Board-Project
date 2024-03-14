import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './users/entity/Users.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal : true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname,"..","public"),
      serveStaticOptions: { index: false },
    }),
    TypeOrmModule.forRootAsync({
      inject : [ConfigService],
      useFactory : (configService: ConfigService) =>{
        return {
          type: 'mysql',
          host : configService.get("DATABASE_HOST"),
          port: 3306,
          username: configService.get("DATABASE_USER"),
          password: configService.get("DATABASE_PASSWORD"),
          database: configService.get("DATABASE_DATABASE"),
          entities : [Users],
          synchronize: true, 
        }
      },
     
    }), 
    JwtModule.register({
      secret: process.env.TOKEN_SECURITY,
      global : true,
      signOptions: {
        expiresIn:"5m"
      }
    }),
    MulterModule.register({
      storage: diskStorage({              // 파일을 디스크에 저장하기위한 제어기능
        destination: function(req, file, cb){  // 파일 업로드위치
            cb(null, `image`);           
        },
        filename: function (req, file, cb) {   // 파일명
          console.log(file);
          cb(null, file.originalname);	
        }
      })
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

