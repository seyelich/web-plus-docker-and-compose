import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtGuard } from 'src/guards/jwt.guard';
import { TransformInterceptor } from 'src/interceptors/transformUser';
import { ICustomReq } from 'src/types';

@UseGuards(JwtGuard)
@UseInterceptors(TransformInterceptor)
@Controller('wishlistlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Post()
  create(@Body() createWishlistDto: CreateWishlistDto, @Req() req: ICustomReq) {
    return this.wishlistsService.create(createWishlistDto, req.user);
  }

  @Get()
  findAll() {
    return this.wishlistsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.wishlistsService.findOne({
      where: { id },
      relations: ['items'],
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateWishlistDto: UpdateWishlistDto,
    @Req() req: ICustomReq,
  ) {
    return this.wishlistsService.update({ id }, updateWishlistDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @Req() req: ICustomReq) {
    return this.wishlistsService.remove({ id }, req.user);
  }
}
