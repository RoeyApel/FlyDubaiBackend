import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUserId } from '../auth/current-user-id.decorator.js';
import {
  RideResponse,
  RideSearchResponse,
  SearchRidesQueryDto,
  SeatMapResponse,
} from '../types/rides/types.js';
import { RidesService } from './rides.service.js';

@ApiTags('rides')
@ApiBearerAuth()
@Controller('rides')
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @Get()
  @ApiOkResponse({ type: RideSearchResponse })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  @ApiNotFoundResponse({ description: 'Unknown city' })
  search(@Query() query: SearchRidesQueryDto): Promise<RideSearchResponse> {
    return this.ridesService.search(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: RideResponse })
  @ApiNotFoundResponse({ description: 'Ride not found' })
  findById(@Param('id', ParseIntPipe) id: number): Promise<RideResponse> {
    return this.ridesService.findById(id);
  }

  @Get(':id/seats')
  @ApiOkResponse({ type: SeatMapResponse })
  @ApiNotFoundResponse({ description: 'Ride not found' })
  getSeatMap(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ): Promise<SeatMapResponse> {
    return this.ridesService.getSeatMap(id, userId);
  }
}
