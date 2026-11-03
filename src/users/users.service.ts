import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUniqueViolation } from '../common/database/is-unique-violation.js';
import { User } from '../entities/user.entity.js';
import {
  type CreateUserData,
  USER_EMAIL_UNIQUE_CONSTRAINT,
} from '../types/users/types.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async create(data: CreateUserData): Promise<User> {
    try {
      return await this.usersRepository.save(this.usersRepository.create(data));
    } catch (error) {
      if (isUniqueViolation(error, USER_EMAIL_UNIQUE_CONSTRAINT)) {
        throw new ConflictException('Email is already registered');
      }
      throw error;
    }
  }

  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async getById(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
