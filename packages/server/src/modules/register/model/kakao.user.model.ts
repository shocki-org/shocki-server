export interface KakaoUser {
  id: number;
  connected_at: string;
  kakao_account: {
    name_needs_agreement: boolean;
    name: string;
    has_email: boolean;
    email_needs_agreement: boolean;
    is_email_valid: boolean;
    is_email_verified: boolean;
    email: string;
    has_phone_number: boolean;
    phone_number_needs_agreement: boolean;
    phone_number: string;
    has_birthyear: boolean;
    birthyear_needs_agreement: boolean;
    birthyear: string;
    has_birthday: boolean;
    birthday_needs_agreement: boolean;
    birthday: string;
    birthday_type: string;
    has_gender: boolean;
    gender_needs_agreement: boolean;
    gender: string;
  };
}
