import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AddressResponseDTO } from './dto/address-response.dto';
import { KakaoMapModel } from './models/kakao.map.model';

@Injectable()
export class AddressService {
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<
      {
        KAKAO_REST_API_KEY: string;
      },
      true
    >,
  ) {
    this.apiKey = this.configService.get('KAKAO_REST_API_KEY', { infer: true });
  }

  public async getAddressByKeyword(address: string) {
    const url = 'https://dapi.kakao.com/v2/local/search/keyword.json';
    const res = await this.httpService.axiosRef.get<KakaoMapModel>(url, {
      params: { query: address },
      headers: { Authorization: `KakaoAK ${this.apiKey}` },
    });

    return res.data;
  }

  public async getSimilarAddress(address: string): Promise<AddressResponseDTO> {
    const place = await this.getAddressByKeyword(address);

    return {
      documents: place.documents
        .map((document) => ({
          addressName: document.address_name,
          roadAddressName: document.road_address_name,
          placeName: document.place_name,
          x: document.x,
          y: document.y,
        }))
        .sort((a, b) => a.placeName.localeCompare(b.placeName)),
    };
  }
}
