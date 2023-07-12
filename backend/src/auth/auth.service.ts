import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { HashService } from '../hash/hash.service';
import {
  USER_NOT_FOUND_ERROR,
  WRONG_USERNAME_OR_PASSWORD_ERROR,
} from '../utils/errors';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private hashService: HashService,
  ) {}

  async auth(user: Promise<User>) {
    const payload = { sub: (await user).id };

    return { access_token: this.jwtService.sign(payload) };
  }

  async validatePassword(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);

    if (!user) throw new NotFoundException(USER_NOT_FOUND_ERROR);

    const isCorrectPassword = await this.hashService.compare(
      password,
      user.password,
    );

    if (!isCorrectPassword) {
      throw new UnauthorizedException(WRONG_USERNAME_OR_PASSWORD_ERROR);
    }

    delete user.password;
    return user;
  }
}
