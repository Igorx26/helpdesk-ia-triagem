export interface LoginResponseDto {
  access_token: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    perfil: string;
  };
}
