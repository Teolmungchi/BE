import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from '../entity/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {}
