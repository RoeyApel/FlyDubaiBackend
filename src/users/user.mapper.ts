import type { User } from '../entities/user.entity.js';
import type {
  UserProfileResponse,
  UserResponse,
} from '../types/users/types.js';

export function toUserResponse(user: User): UserResponse {
  return { id: user.id, email: user.email, name: user.name };
}

export function toUserProfileResponse(user: User): UserProfileResponse {
  return { ...toUserResponse(user), createdAt: user.createdAt };
}
