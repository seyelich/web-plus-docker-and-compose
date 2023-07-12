import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { HashService } from 'src/hash/hash.service';
import {
  USER_EXIST_ERROR,
  USER_NOT_FOUND_ERROR,
  USER_PROFILE_ACCESS_ERROR,
} from '../utils/errors';
import { FindUsersDto } from './dto/find-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private hashService: HashService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const newUser = {
      ...createUserDto,
      password: await this.hashService.hash(createUserDto.password),
    };

    return this.usersRepository.save(newUser);
  }

  findAll() {
    return this.usersRepository.find();
  }

  async findOne(query: FindOneOptions<User>) {
    const user = await this.usersRepository.findOne(query);

    if (!user) throw new NotFoundException(USER_NOT_FOUND_ERROR);
    else return user;
  }

  findByUsername(username: string) {
    return this.usersRepository.findOneBy({ username });
  }

  findByEmail(email: string) {
    return this.usersRepository.findOneBy({ email });
  }

  async findUserByLogin(findUserDto: FindUsersDto) {
    const user = await this.findOne({
      where: [{ username: findUserDto.query }, { email: findUserDto.query }],
    });

    return user;
  }

  async updateOne(
    query: FindOptionsWhere<User>,
    updateUserDto: UpdateUserDto,
    userId: number,
  ) {
    const user = await this.findOne({ where: query });

    if (userId !== user.id) {
      throw new BadRequestException(USER_PROFILE_ACCESS_ERROR);
    }

    if (updateUserDto.password) {
      updateUserDto.password = await this.hashService.hash(
        updateUserDto.password,
      );
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const foundUserByEmail = await this.findByEmail(updateUserDto.email);

      if (foundUserByEmail) {
        throw new BadRequestException(USER_EXIST_ERROR);
      }
    }

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const foundUserByName = await this.findByUsername(updateUserDto.email);

      if (foundUserByName) {
        throw new BadRequestException(USER_EXIST_ERROR);
      }
    }

    return this.usersRepository.update(query, updateUserDto);
  }

  async findUserWishes(query: FindOptionsWhere<User>) {
    const { wishes } = await this.findOne({
      where: query,
      select: ['wishes'],
      relations: ['wishes'],
    });

    return wishes;
  }

  async removeOne(query: FindOptionsWhere<User>, userId: number) {
    const user = await this.findOne({ where: query });

    if (userId !== user.id) {
      throw new BadRequestException(USER_PROFILE_ACCESS_ERROR);
    }

    return this.usersRepository.delete(query);
  }
}
