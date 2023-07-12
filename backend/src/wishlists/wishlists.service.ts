import { Injectable } from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { FindOneOptions, FindOptionsWhere, In, Repository } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common/exceptions';
import { User } from 'src/users/entities/user.entity';
import { WishesService } from 'src/wishes/wishes.service';
import {
  WISHLIST_ACCESS_ERROR,
  WISHLIST_NOT_FOUND_ERROR,
} from '../utils/errors';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistsRepository: Repository<Wishlist>,
    private wishesService: WishesService,
  ) {}

  async create(createWishlistDto: CreateWishlistDto, user: User) {
    const wishes = await this.wishesService.findMany({
      where: { id: In(createWishlistDto.itemsId) },
    });

    const newWishlist = {
      ...createWishlistDto,
      owner: user,
      items: wishes,
    };

    return this.wishlistsRepository.save(newWishlist);
  }

  findAll() {
    return this.wishlistsRepository.find();
  }

  async findOne(query: FindOneOptions<Wishlist>) {
    const wishlist = await this.wishlistsRepository.findOne(query);

    if (!wishlist) {
      throw new NotFoundException(WISHLIST_NOT_FOUND_ERROR);
    } else {
      return wishlist;
    }
  }

  async update(
    query: FindOptionsWhere<Wishlist>,
    updateWishlistDto: UpdateWishlistDto,
    user: User,
  ) {
    const wishlist = await this.findOne({
      where: query,
      relations: ['owner'],
    });

    let updatedWishlist: Wishlist | UpdateWishlistDto = updateWishlistDto;

    if (wishlist.owner.id !== user.id) {
      throw new BadRequestException(WISHLIST_ACCESS_ERROR);
    }

    if (updateWishlistDto.itemsId) {
      const wishes = await this.wishesService.findMany({
        where: { id: In(updateWishlistDto.itemsId) },
      });

      updatedWishlist = {
        ...updateWishlistDto,
        owner: user,
        items: wishes,
      };
    }

    return this.wishlistsRepository.update(query, updatedWishlist);
  }

  async remove(query: FindOptionsWhere<Wishlist>, user: User) {
    const wishlist = await this.findOne({ where: query, relations: ['owner'] });

    if (wishlist.owner.id !== user.id) {
      throw new BadRequestException(WISHLIST_ACCESS_ERROR);
    }

    return this.wishlistsRepository.delete(query);
  }
}
