export default class User {
  protected email: string;
  protected password: string;
  protected signupAt: string;

  constructor(email: string, password: string, signupAt: string) {
    this.email = email;
    this.password = password;
    this.signupAt = signupAt;
  }

  getEmail = (): string => {
    return this.email;
  };

  getPassword = (): string => {
    return this.password;
  };

  getSignupAt = (): string => {
    return this.signupAt;
  };
}
