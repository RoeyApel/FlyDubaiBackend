import { ApiProperty } from '@nestjs/swagger';

export const USER_EMAIL_UNIQUE_CONSTRAINT = 'UQ_users_email';

export interface CreateUserData {
  email: string;
  name: string;
  passwordHash: string;
}

export class UserResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'roey@example.com' })
  email: string;

  @ApiProperty({ example: 'Roey Apel' })
  name: string;
}

export class UserProfileResponse extends UserResponse {
  @ApiProperty()
  createdAt: Date;
}
