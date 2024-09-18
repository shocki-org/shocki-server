export interface KakaoMapModel {
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
  documents: {
    address_name: string;
    road_address_name: string;
    place_name: string;
    x: string;
    y: string;
  }[];
}
