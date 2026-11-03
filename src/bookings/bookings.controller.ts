import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUserId } from '../decorators/current-user-id.decorator.js';
import { BookingResponse, CreateBookingDto } from '../types/bookings/types.js';
import { BookingsService } from './bookings.service.js';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiCreatedResponse({ type: BookingResponse })
  @ApiBadRequestResponse({
    description: 'Invalid input, expired card or departed ride',
  })
  @ApiNotFoundResponse({ description: 'Ride not found' })
  @ApiConflictResponse({ description: 'Seat is already taken' })
  create(
    @CurrentUserId() userId: number,
    @Body() createBookingDto: CreateBookingDto,
  ): Promise<BookingResponse> {
    return this.bookingsService.create(userId, createBookingDto);
  }

  @Get('me')
  @ApiOkResponse({ type: [BookingResponse] })
  findMine(@CurrentUserId() userId: number): Promise<BookingResponse[]> {
    return this.bookingsService.findByUser(userId);
  }
}
