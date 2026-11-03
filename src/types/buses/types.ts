import { ApiProperty } from '@nestjs/swagger';
import { BusType } from './enums.js';

export class BusCompanyResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Egged' })
  name: string;
}

export class BusResponse {
  @ApiProperty({ example: 3 })
  id: number;

  @ApiProperty({ enum: BusType, enumName: 'BusType' })
  type: BusType;

  @ApiProperty({ type: () => BusCompanyResponse })
  company: BusCompanyResponse;
}
