import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import type { Request } from 'express';
import { normalizeEmail, trim } from '../../common/validation/transforms.js';
import { UserResponse } from '../users/types.js';

export const IS_PUBLIC_KEY = 'isPublic';
export const JWT_EXPIRES_IN = '7d';
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export interface JwtPayload {
  sub: number;
}

export interface AuthenticatedRequest extends Request {
  userId: number;
}

export class RegisterDto {
  @ApiProperty({ example: 'roey@example.com' })
  @Transform(normalizeEmail)
  @IsEmail()
  email: string;

  @ApiProperty({
    minLength: PASSWORD_MIN_LENGTH,
    maxLength: PASSWORD_MAX_LENGTH,
  })
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password: string;

  @ApiProperty({ example: 'Roey Apel' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class LoginDto {
  @ApiProperty({ example: 'roey@example.com' })
  @Transform(normalizeEmail)
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AuthResponse {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: () => UserResponse })
  user: UserResponse;
}
