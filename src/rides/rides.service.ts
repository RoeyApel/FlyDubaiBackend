import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { And, LessThan, MoreThan, MoreThanOrEqual, Repository } from 'typeorm';
import { BookingsService } from '../bookings/bookings.service.js';
import { CitiesService } from '../cities/cities.service.js';
import { toCityResponse } from '../mappers/city.mapper.js';
import { Ride } from '../entities/ride.entity.js';
import { MS_PER_DAY } from '../types/common/types.js';
import {
  RIDE_RELATIONS,
  type RideResponse,
  type RideSearchResponse,
  type SearchRidesQueryDto,
  type SeatMapResponse,
} from '../types/rides/types.js';
import { toRideResponse } from '../mappers/ride.mapper.js';

@Injectable()
export class RidesService {
  constructor(
    @InjectRepository(Ride) private readonly ridesRepository: Repository<Ride>,
    private readonly citiesService: CitiesService,
    private readonly bookingsService: BookingsService,
  ) {}

  async search(
    searchRidesQueryDto: SearchRidesQueryDto,
  ): Promise<RideSearchResponse> {
    if (
      searchRidesQueryDto.originCityId === searchRidesQueryDto.destinationCityId
    ) {
      throw new BadRequestException('Origin and destination must be different');
    }

    const [origin, destination] = await Promise.all([
      this.citiesService.getById(searchRidesQueryDto.originCityId),
      this.citiesService.getById(searchRidesQueryDto.destinationCityId),
    ]);

    const dayStart = new Date(`${searchRidesQueryDto.date}T00:00:00.000Z`);
    const dayEnd = new Date(dayStart.getTime() + MS_PER_DAY);

    const rides = await this.ridesRepository.find({
      where: {
        originCityId: origin.id,
        destinationCityId: destination.id,
        departureAt: And(
          MoreThanOrEqual(dayStart),
          MoreThan(new Date()),
          LessThan(dayEnd),
        ),
      },
      relations: RIDE_RELATIONS,
      order: { departureAt: 'ASC' },
    });

    return {
      origin: toCityResponse(origin),
      destination: toCityResponse(destination),
      date: searchRidesQueryDto.date,
      rides: rides.map(toRideResponse),
    };
  }

  async findById(id: number): Promise<RideResponse> {
    const ride = await this.ridesRepository.findOne({
      where: { id },
      relations: RIDE_RELATIONS,
    });

    if (!ride) {
      throw new NotFoundException(`Ride ${id} not found`);
    }

    return toRideResponse(ride);
  }

  async getSeatMap(rideId: number, userId: number): Promise<SeatMapResponse> {
    const ride = await this.ridesRepository.findOne({
      where: { id: rideId },
      relations: { bus: true },
    });

    if (!ride) {
      throw new NotFoundException(`Ride ${rideId} not found`);
    }

    const bookings = await this.bookingsService.findByRide(rideId);

    return {
      rows: ride.bus.rows,
      columns: ride.bus.columns,
      busType: ride.bus.type,
      taken: bookings.map((booking) => ({
        row: booking.seatRow,
        column: booking.seatColumn,
        isMine: booking.userId === userId,
      })),
    };
  }
}
