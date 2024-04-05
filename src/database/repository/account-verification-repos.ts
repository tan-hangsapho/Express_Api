import AccountVerificationModel from "../models/account-verification.models";

export class AccountVerificationRepository {
  async CreateAccountVerificationToken({
    userId,
    token,
  }: {
    userId: string;
    token: string;
  }) {
    try {
      const accountVerification = new AccountVerificationModel({
        userId,
        emailVerificationToken: token,
      });
      return await accountVerification.save();
    } catch (error) {
      throw error;
    }
  }
  async FindAccountVerificationToken({ token }: { token: string }) {
    try {
      const existedToken = await AccountVerificationModel.findOne({
        emailVerificationToken: token,
      });

      return existedToken;
    } catch (error) {
      throw error;
    }
  }
  async deleteAccountVerification({ token }: { token: string }) {
    try {
      await AccountVerificationModel.deleteOne({
        emailVerificationToken: token,
      });
    } catch (error) {
      throw error;
    }
  }
}
