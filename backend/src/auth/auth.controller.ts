import {
  Controller,
  Post,
  UseGuards,
  Req,
  Body,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LocalGuard } from '../guards/local.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { USER_EXIST_ERROR } from '../utils/errors';
import { TransformInterceptor } from 'src/interceptors/transformUser';

@UseInterceptors(TransformInterceptor)
@Controller('')
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    const foundedUserByEmail = await this.usersService.findByEmail(
      createUserDto.email,
    );

    const foundedUserByUsername = await this.usersService.findByUsername(
      createUserDto.username,
    );

    if (foundedUserByEmail || foundedUserByUsername) {
      throw new BadRequestException(USER_EXIST_ERROR);
    }

    return this.usersService.create(createUserDto);
  }

  @UseGuards(LocalGuard)
  @Post('signin')
  signin(@Req() req: { user: Promise<User> }) {
    return this.authService.auth(req.user);
  }
}
