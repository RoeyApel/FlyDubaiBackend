import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CityResponse } from '../types/cities/types.js';
import { CitiesService } from './cities.service.js';
import { toCityResponse } from '../mappers/city.mapper.js';

@ApiTags('cities')
@ApiBearerAuth()
@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  @ApiOkResponse({ type: [CityResponse] })
  async findAll(): Promise<CityResponse[]> {
    const cities = await this.citiesService.findAll();

    return cities.map(toCityResponse);
  }
}
