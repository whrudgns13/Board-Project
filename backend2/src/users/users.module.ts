import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { Users } from './entity/Users.entity';
import { AuthenticationService } from 'src/jwt/Authentication.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
    MailerModule.forRootAsync({
      useFactory: () => {
        return {
          transport: {
            service: 'Gmail',
            auth: {
              user: process.env.MAIL_ID, // 보내는 사람의 이메일 주소
              pass: process.env.MAIL_PASSWORD, // 이메일 주소의 비밀번호
            },
          },
        };
      },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthenticationService],
  exports: [TypeOrmModule],
})
export class UsersModule {}
