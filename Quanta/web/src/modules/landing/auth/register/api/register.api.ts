export type RegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  success: boolean;
  message: string;
};

// TODO :: replace with the real registration API call once backend auth is wired up
export async function registerUser(request: RegisterRequest): Promise<RegisterResponse> {
  return { success: false, message: "Not implemented yet" };
}
