import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminService {

  getStats() {
    return Promise.resolve(undefined);
  }

  getUserActivity(startDate: string, endDate: string) {
    return Promise.resolve(undefined);
  }

  getMatch(month: string) {
    return Promise.resolve(undefined);
  }

  getRecentAnimals() {
    return Promise.resolve(undefined);
  }

  getDashboard() {
    return Promise.resolve(undefined);
  }
}
