import { Employee } from '../models/masters/index.js';
import Company from '../models/Company.js';
import { signAccessToken } from '../utils/jwt.js';
import { success, ApiError } from '../utils/apiResponse.js';
import { encrypt, decrypt } from '../utils/cryptoUtils.js';
import crypto from 'crypto';
import { sendOTP } from '../utils/emailUtils.js';
import { sendWhatsappOTP } from '../utils/whatsappUtils.js';
export async function login(req, res, next) {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      throw new ApiError(400, 'Login ID and password are required');
    }

    // loginId can be emailId or personalMobNo (or even officeMobNo)
    const employee = await Employee.findOne({
      $or: [
        { emailId: loginId.toLowerCase() },
        { personalMobNo: loginId },
        { officeMobNo: loginId }
      ]
    });

    if (!employee || employee.status !== 'Active') {
      throw new ApiError(401, 'Invalid credentials or inactive account');
    }

    // Since the password field has a getter that automatically decrypts when returning to JSON, 
    // it also does so when we access employee.password IF getters are applied. 
    // Wait, Mongoose getters are only applied by default for schema paths when returning toJSON/toObject. 
    // Let's explicitly decrypt the stored value from the DB. 
    // In Mongoose, to get the raw value we use employee.get('password', null, { getters: false })
    // Actually, if we just access employee.password, it might be the encrypted or decrypted string depending on getters configuration.
    // Let's use the explicit decrypt function on the raw DB string to be safe.
    const rawPassword = employee.get('password', null, { getters: false });
    const decryptedStoredPassword = decrypt(rawPassword);

    if (password !== decryptedStoredPassword) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const company = await Company.findById(employee.companyId);
    if (!company || company.status !== 'Active') {
      throw new ApiError(403, 'Company account is inactive');
    }

    const accessToken = signAccessToken({ userId: employee._id.toString(), companyId: employee.companyId.toString(), isEmployee: true });

    return success(res, {
      message: 'Login successful',
      data: { 
        accessToken, 
        employee: {
          id: employee._id,
          empCode: employee.empCode,
          empName: employee.empName,
          emailId: employee.emailId,
          personalMobNo: employee.personalMobNo,
          siteIds: employee.siteIds || [],
        },
        company: {
          id: company._id,
          companyName: company.companyName,
          companyCode: company.companyCode
        }
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { loginId } = req.body;
    if (!loginId) {
      throw new ApiError(400, 'Login ID is required');
    }

    const isEmail = loginId.includes('@');
    const employee = await Employee.findOne(
      isEmail 
        ? { emailId: loginId.toLowerCase() } 
        : { $or: [{ personalMobNo: loginId }, { officeMobNo: loginId }] }
    );

    if (!employee) {
      // Don't leak if account exists, just return success
      return success(res, { message: 'If an account exists, an OTP has been sent.' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    employee.resetOtp = otp;
    employee.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry
    await employee.save();

    if (isEmail && employee.emailId) {
      try {
        await sendOTP(employee.emailId, otp);
      } catch(e) {
        console.log(`[TESTING] Email failed to send, but proceeding anyway. OTP is: ${otp}`);
      }
    } else {
      try {
        await sendWhatsappOTP(employee.personalMobNo || employee.officeMobNo, otp);
      } catch(e) {
        console.log(`[TESTING] WhatsApp failed to send, but proceeding anyway. OTP is: ${otp}`);
      }
    }

    console.log(`\n========================================`);
    console.log(`[TESTING] OTP GENERATED FOR ${loginId}: ${otp}`);
    console.log(`========================================\n`);

    return success(res, { 
      message: 'OTP processed successfully',
      data: { testOtp: otp } // Returning for testing purposes
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const { loginId, otp } = req.body;
    if (!loginId || !otp) {
      throw new ApiError(400, 'Login ID and OTP are required');
    }

    const isEmail = loginId.includes('@');
    const employee = await Employee.findOne(
      isEmail 
        ? { emailId: loginId.toLowerCase() } 
        : { $or: [{ personalMobNo: loginId }, { officeMobNo: loginId }] }
    );

    if (!employee) {
      throw new ApiError(400, 'Invalid OTP or Login ID');
    }

    if (employee.resetOtp !== otp) {
      throw new ApiError(400, 'Invalid OTP');
    }

    if (!employee.resetOtpExpiry || employee.resetOtpExpiry < new Date()) {
      throw new ApiError(400, 'OTP has expired');
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    employee.resetToken = resetToken;
    employee.resetOtp = undefined;
    employee.resetOtpExpiry = undefined;
    await employee.save();

    return success(res, { 
      message: 'OTP verified successfully',
      data: { resetToken }
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { loginId, resetToken, newPassword } = req.body;

    if (!loginId || !resetToken || !newPassword) {
      throw new ApiError(400, 'All fields are required');
    }

    const isEmail = loginId.includes('@');
    const employee = await Employee.findOne(
      isEmail 
        ? { emailId: loginId.toLowerCase(), resetToken } 
        : { $or: [{ personalMobNo: loginId }, { officeMobNo: loginId }], resetToken }
    );

    if (!employee) {
      throw new ApiError(400, 'Invalid or expired reset session');
    }

    employee.password = newPassword;
    employee.resetToken = undefined;
    await employee.save();

    return success(res, { message: 'Password has been reset successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
}
