import { IsNumber, IsString, IsUrl } from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  name: string;

  @IsUrl()
  image: string;

  @IsNumber({}, { each: true })
  itemsId: number[];
}
