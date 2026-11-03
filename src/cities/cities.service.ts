import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '../entities/city.entity.js';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly citiesRepository: Repository<City>,
  ) {}

  findAll(): Promise<City[]> {
    return this.citiesRepository.find({ order: { name: 'ASC' } });
  }

  async getById(id: number): Promise<City> {
    const city = await this.citiesRepository.findOneBy({ id });

    if (!city) {
      throw new NotFoundException(`City ${id} not found`);
    }

    return city;
  }
}
