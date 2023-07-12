import {
  Controller,
  Get,
  Req,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from 'src/guards/jwt.guard';
import { FindUsersDto } from './dto/find-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { TransformInterceptor } from 'src/interceptors/transformUser';
import { ICustomReq } from 'src/types';

@UseGuards(JwtGuard)
@UseInterceptors(TransformInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Req() req: ICustomReq) {
    return req.user;
  }

  @Patch('me')
  async updateMe(@Body() updateUserDto: UpdateUserDto, @Req() req: ICustomReq) {
    return this.usersService.updateOne(
      { id: req.user.id },
      updateUserDto,
      req.user.id,
    );
  }

  @Get('me/wishes')
  getMyWishes(@Req() req: ICustomReq) {
    return this.usersService.findUserWishes({ id: req.user.id });
  }

  @Get(':username')
  getUserByUsername(@Param('username') username: string) {
    return this.usersService.findUserByLogin({
      query: username,
    });
  }

  @Get(':username/wishes')
  async getUserWishes(@Param('username') username: string) {
    const user = await this.usersService.findUserByLogin({
      query: username,
    });
    return this.usersService.findUserWishes({ id: user.id });
  }

  @Post('find')
  async getUserByLogin(@Body() findUserDto: FindUsersDto) {
    return this.usersService.findUserByLogin(findUserDto);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: ICustomReq,
  ) {
    return this.usersService.updateOne({ id }, updateUserDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @Req() req: ICustomReq) {
    return this.usersService.removeOne({ id }, req.user.id);
  }
}
