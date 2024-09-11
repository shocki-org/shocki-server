export interface JwtPayload {
  id: string;
  type: 'access';
}

export interface PhoneRegisterJWTPayload {
  phone: string;
  type: 'phone';
}
