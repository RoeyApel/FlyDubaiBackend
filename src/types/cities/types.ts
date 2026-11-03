import { ApiProperty } from '@nestjs/swagger';

export class CityResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Tel Aviv' })
  name: string;
}
