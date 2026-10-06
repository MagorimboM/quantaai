// What a person types into the sign-in and sign-up forms. These go to Clerk,
// not to our backend: Clerk checks the credentials and sends the verification email.

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

// The code Clerk emails to confirm a new sign-up's address
export type VerifyEmailCodeRequest = {
  code: string;
};