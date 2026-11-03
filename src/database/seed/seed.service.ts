import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, type EntityManager } from 'typeorm';
import {
  type EnvironmentVariables,
  NodeEnv,
} from '../../config/env.validation.js';
import { BusCompany } from '../../entities/bus-company.entity.js';
import { Bus } from '../../entities/bus.entity.js';
import { City } from '../../entities/city.entity.js';
import { Ride } from '../../entities/ride.entity.js';
import {
  SEED_BUSES,
  SEED_CITIES,
  SEED_INSERT_CHUNK_SIZE,
} from '../../types/seed/types.js';
import { planRides } from './ride-plan.js';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  async run(): Promise<void> {
    if (this.config.get('NODE_ENV', { infer: true }) === NodeEnv.Production) {
      throw new Error('Refusing to wipe the database in production');
    }

    await this.dataSource.transaction(async (manager) => {
      await this.wipe(manager);

      const cities = await this.seedCities(manager);
      const buses = await this.seedBuses(manager);
      const rideCount = await this.seedRides(manager, cities, buses);

      this.logger.log(
        `Seeded ${cities.length} cities, ${buses.length} buses, ${rideCount} rides`,
      );
    });
  }

  private async wipe(manager: EntityManager): Promise<void> {
    const tables = this.dataSource.entityMetadatas
      .map((metadata) => `"${metadata.tableName}"`)
      .join(', ');

    await manager.query(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`);
  }

  private seedCities(manager: EntityManager): Promise<City[]> {
    return manager.save(
      SEED_CITIES.map(({ name }) => manager.create(City, { name })),
    );
  }

  private async seedBuses(manager: EntityManager): Promise<Bus[]> {
    const companyNames = [...new Set(SEED_BUSES.map((bus) => bus.company))];
    const companies = await manager.save(
      companyNames.map((name) => manager.create(BusCompany, { name })),
    );
    const companyIdByName = new Map(
      companies.map((company) => [company.name, company.id]),
    );

    return manager.save(
      SEED_BUSES.map(({ company, type, rows, columns }) =>
        manager.create(Bus, {
          companyId: companyIdByName.get(company),
          type,
          rows,
          columns,
        }),
      ),
    );
  }

  private async seedRides(
    manager: EntityManager,
    cities: City[],
    buses: Bus[],
  ): Promise<number> {
    const plannableCities = cities.map((city, index) => ({
      ...SEED_CITIES[index],
      id: city.id,
    }));
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const rides = planRides(
      plannableCities,
      buses.map((bus) => bus.id),
      today,
    );

    for (let i = 0; i < rides.length; i += SEED_INSERT_CHUNK_SIZE) {
      await manager.insert(Ride, rides.slice(i, i + SEED_INSERT_CHUNK_SIZE));
    }

    return rides.length;
  }
}
