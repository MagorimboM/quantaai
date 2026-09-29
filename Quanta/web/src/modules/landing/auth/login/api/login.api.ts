export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  success: boolean;
  message: string;
};

// TODO :: replace with the real login API call once backend auth is wired up
export async function loginUser(_request: LoginRequest): Promise<LoginResponse> {
  return { success: false, message: "Not implemented yet" };
}
