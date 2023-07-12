import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import {
  WISH_ACCESS_ERROR,
  WISH_COPY_ERROR,
  WISH_NOT_FOUND_ERROR,
  WISH_UPDATE_ERROR,
} from '../utils/errors';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
    private usersService: UsersService,
  ) {}

  create(createWishDto: CreateWishDto, owner: User) {
    const newWish = {
      ...createWishDto,
      owner: owner,
    };

    return this.wishesRepository.save(newWish);
  }

  findLast() {
    return this.findMany({
      relations: ['owner', 'offers'],
      order: { createdAt: 'DESC' },
      take: 40,
    });
  }

  findTop() {
    return this.findMany({
      relations: ['owner', 'offers'],
      order: { copied: 'DESC' },
      take: 20,
    });
  }

  async copy(query: FindOptionsWhere<Wish>, user: User) {
    const wish = await this.findOne({
      where: query,
      relations: ['owner'],
    });

    const userWishes = await this.usersService.findUserWishes({ id: user.id });
    const { name, link, image, price, description } = wish;

    if (
      userWishes.find(
        (el) =>
          el.name === name &&
          el.link === link &&
          el.image === image &&
          el.price === price &&
          el.description === description,
      )
    ) {
      throw new BadRequestException(WISH_COPY_ERROR);
    }

    const updatedWish = { ...wish, copied: wish.copied + 1 };
    const newWish = await this.create(
      {
        name,
        link,
        image,
        price,
        description,
      },
      user,
    );

    await this.wishesRepository.update(query, updatedWish);
    return newWish;
  }

  findAll() {
    return this.wishesRepository.find();
  }

  async findMany(query: FindManyOptions<Wish>) {
    const wishes = await this.wishesRepository.find(query);

    if (!wishes) throw new NotFoundException(WISH_NOT_FOUND_ERROR);
    return wishes;
  }

  async findOne(query: FindOneOptions<Wish>) {
    const wish = await this.wishesRepository.findOne(query);

    if (!wish) throw new NotFoundException(WISH_NOT_FOUND_ERROR);
    else return wish;
  }

  async updateOne(
    query: FindOptionsWhere<Wish>,
    updateWishDto: UpdateWishDto,
    userId: number,
  ) {
    const wish = await this.findOne({
      where: query,
      relations: ['owner', 'offers'],
    });

    if (wish.offers.length !== 0 || wish.raised !== 0) {
      throw new BadRequestException(WISH_UPDATE_ERROR);
    }

    if (userId !== wish.owner.id) {
      throw new BadRequestException(WISH_ACCESS_ERROR);
    }

    return this.wishesRepository.update(query, updateWishDto);
  }

  async updateRaised(query: FindOptionsWhere<Wish>, raised: number) {
    await this.findOne({ where: query });

    return this.wishesRepository.update(query, { raised });
  }

  async remove(query: FindOptionsWhere<Wish>, user: User) {
    const wish = await this.findOne({ where: query, relations: ['owner'] });

    if (wish.owner.id !== user.id) {
      throw new BadRequestException(WISH_ACCESS_ERROR);
    }

    return this.wishesRepository.delete(query);
  }
}
