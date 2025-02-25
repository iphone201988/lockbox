import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
const authToken = process.env.TWILIO_AUTH_TOKEN as string;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER as string;

console.log("TWILIO_PHONE_NUMBER", twilioPhoneNumber);

const client = twilio(accountSid, authToken);

// Define SMS templates
const smsTemplates = {
    registerOtp: "Your OTP for registration is: {{OTP}}. Please do not share this code with anyone.",
    resendRegistrationOtp: "Resending your OTP: {{OTP}}. Use this to complete your registration.",
    forgotPasswordOtp: "Use this OTP: {{OTP}} to reset your password. If you didn’t request this, ignore it.",
    forgotPasswordResendOtp: "Resending your OTP for password reset: {{OTP}}.",
    changePhone: "Resending your OTP for Change Phone Number: {{OTP}}.",
};

/**
 * Generate SMS message based on type
 * @param type - Type of SMS (1: Register OTP, 2: Resend OTP, 3: Forgot Password OTP, 4: Forgot Password Resend OTP)
 * @param otp - OTP code to be sent
 * @returns SMS message string
 */
function generateSmsMessage(type: number, otp: string): string {
    let template:any;
    switch (type) {
        case 1:
            template = smsTemplates.registerOtp;
            break;
        case 2:
            template = smsTemplates.resendRegistrationOtp;
            break;
        case 3:
            template = smsTemplates.forgotPasswordOtp;
            break;
        case 4:
            template = smsTemplates.forgotPasswordResendOtp;
            break;
        case 5:
            template = smsTemplates.changePhone;
            break;
        default:
            throw new Error("Invalid SMS type");
    }

    return template.replace("{{OTP}}", otp);
}

/**
 * Send SMS using Twilio
 * @param to - Recipient phone number (e.g., +1234567890)
 * @param type - Message type (1-4)
 * @param otp - OTP to send
 * @returns Message SID or error
 */
export const sendSms = async (to: string, type: number, otp: string): Promise<string> => {
    try {
        const message = generateSmsMessage(type, otp);

        const response = await client.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: to,
        });

        console.log('Message sent successfully:', response.sid);
        return response.sid;
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw new Error('Failed to send SMS');
    }
};
