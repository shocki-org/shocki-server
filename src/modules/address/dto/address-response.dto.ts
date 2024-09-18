import { ApiProperty } from '@nestjs/swagger';

export class AddressDocument {
    @ApiProperty()
    addressName: string;

    @ApiProperty()
    roadAddressName: string;

    @ApiProperty()
    placeName: string;

    @ApiProperty()
    x: string;

    @ApiProperty()
    y: string;
}

export class AddressResponseDTO {
    @ApiProperty({
        type: [AddressDocument],
    })
    documents: AddressDocument[];
}
