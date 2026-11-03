import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../decorators/current-user-id.decorator.js';
import { UserProfileResponse } from '../types/users/types.js';
import { toUserProfileResponse } from '../mappers/user.mapper.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOkResponse({ type: UserProfileResponse })
  async getMe(@CurrentUserId() userId: number): Promise<UserProfileResponse> {
    return toUserProfileResponse(await this.usersService.getById(userId));
  }
}
