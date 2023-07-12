import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { WishesService } from 'src/wishes/wishes.service';
import {
  LARGE_AMOUNT_ERROR,
  OFFER_NOT_FOUND_ERROR,
  OFFER_OWNER_ERROR,
} from '../utils/errors';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    private wishesService: WishesService,
  ) {}

  async create(createOfferDto: CreateOfferDto, user: User) {
    const wish = await this.wishesService.findOne({
      where: { id: createOfferDto.itemId },
      relations: ['owner'],
    });

    if (wish.owner.id === user.id) {
      throw new BadRequestException(OFFER_OWNER_ERROR);
    }

    const restSum = wish.price - wish.raised;

    if (createOfferDto.amount > wish.price || createOfferDto.amount > restSum) {
      throw new BadRequestException(LARGE_AMOUNT_ERROR);
    }

    const updatedRaised = wish.raised + createOfferDto.amount;

    this.wishesService.updateRaised({ id: wish.id }, updatedRaised);

    const newOffer = {
      ...createOfferDto,
      user,
      item: wish,
    };

    if (newOffer.hidden) delete newOffer.user;

    return this.offersRepository.save(newOffer);
  }

  findAll() {
    return this.offersRepository.find({
      relations: ['item', 'user'],
    });
  }

  async findOne(query: FindOneOptions<Offer>) {
    const offer = await this.offersRepository.findOne(query);

    if (!offer) {
      throw new NotFoundException(OFFER_NOT_FOUND_ERROR);
    } else {
      return offer;
    }
  }

  async update(query: FindOptionsWhere<Offer>, updateOfferDto: UpdateOfferDto) {
    await this.findOne({ where: query });
    return this.offersRepository.update(query, updateOfferDto);
  }

  async remove(query: FindOptionsWhere<Offer>) {
    await this.findOne({ where: query });
    return this.offersRepository.delete(query);
  }
}
