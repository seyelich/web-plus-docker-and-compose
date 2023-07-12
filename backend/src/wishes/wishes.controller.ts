import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtGuard } from 'src/guards/jwt.guard';
import { TransformInterceptor } from 'src/interceptors/transformUser';
import { ICustomReq } from 'src/types';

@UseInterceptors(TransformInterceptor)
@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@Body() createWishDto: CreateWishDto, @Req() req: ICustomReq) {
    return this.wishesService.create(createWishDto, req.user);
  }

  @Get('last')
  getLastWishes() {
    return this.wishesService.findLast();
  }

  @Get('top')
  getTopWishes() {
    return this.wishesService.findTop();
  }

  @UseGuards(JwtGuard)
  @Get()
  findAll() {
    return this.wishesService.findAll();
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wishesService.findOne({
      where: { id: Number(id) },
      relations: ['owner', 'offers', 'offers.user'],
    });
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateWishDto: UpdateWishDto,
    @Req() req: ICustomReq,
  ) {
    return this.wishesService.updateOne({ id }, updateWishDto, req.user.id);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Param('id') id: number, @Req() req: ICustomReq) {
    return this.wishesService.remove({ id }, req.user);
  }

  @UseGuards(JwtGuard)
  @Post(':id/copy')
  copyWish(@Param('id') id: number, @Req() req: ICustomReq) {
    return this.wishesService.copy({ id }, req.user);
  }
}
