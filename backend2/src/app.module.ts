import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './users/entity/Users.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { Posts } from './posts/entity/Posts.entity';
import { PostsModule } from './posts/posts.module';
import { Comments } from './posts/entity/Comments.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal : true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname,"..","public"),
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
          entities : [Users, Posts, Comments],
          synchronize: true, 
        }
      },
     
    }), 
    JwtModule.register({
      secret: process.env.TOKEN_SECURITY,
      global : true,
    }),
    UsersModule,
    PostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

