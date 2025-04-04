import nodemailer from 'nodemailer';
import { User } from '@shared/schema';

// Business email address to send notifications to
const BUSINESS_EMAIL = 'Assem@theviewsconsultancy.com';

// Create a test SMTP service (ethereal)
// For production, you would use a real SMTP service
let transporter: nodemailer.Transporter;

// Initialize the transporter with a test account from Ethereal
async function initializeTransporter() {
  try {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();

    // Create a SMTP transporter object using the test account
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log('Email transporter initialized with test account');
    return transporter;
  } catch (error) {
    console.error('Failed to create test email account', error);
    
    // Fallback to a dummy transporter that logs instead of sending
    transporter = {
      sendMail: async (mailOptions: any) => {
        console.log('Email would have been sent with:', mailOptions);
        return { messageId: 'dummy-id' };
      },
    } as any;
    
    return transporter;
  }
}

// Send welcome email to new user with their credentials
export async function sendWelcomeEmail(user: User, plainPassword: string) {
  // Make sure transporter is initialized
  if (!transporter) {
    await initializeTransporter();
  }

  try {
    // First email to the user
    const userMailOptions: {
      from: string;
      to: string;
      subject: string;
      text: string;
      html: string;
    } = {
      from: '"The Views Real Estate" <admin@theviewsrealestate.com>',
      to: user.email,
      subject: 'Welcome to The Views Real Estate',
      text: `Welcome ${user.fullName}!\n\nYour account has been created.\n\nUsername: ${user.username}\nPassword: ${plainPassword}\n\nPlease log in at our website and change your password.\n\nPeriodically, we will send you updates about our latest services and listings.\n\nRegards,\nThe Views Real Estate Team`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #B87333; margin-bottom: 20px;">Welcome to The Views Real Estate</h2>
          <p>Hello ${user.fullName},</p>
          <p>Your account has been created successfully.</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Username:</strong> ${user.username}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> ${plainPassword}</p>
          </div>
          <p>Please log in at our website and change your password.</p>
          <p><em>Periodically, we will send you updates about our latest services and listings.</em></p>
          <p>Regards,<br>The Views Real Estate Team</p>
        </div>
      `,
    };

    // Second email to business email with user registration notification
    const businessMailOptions: {
      from: string;
      to: string;
      subject: string;
      text: string;
      html: string;
    } = {
      from: '"The Views Real Estate System" <admin@theviewsrealestate.com>',
      to: BUSINESS_EMAIL,
      subject: 'New User Registration: ' + user.fullName,
      text: `New User Registration\n\nA new user has registered on The Views Real Estate website.\n\nDetails:\nFull Name: ${user.fullName}\nUsername: ${user.username}\nEmail: ${user.email}\nPhone: ${user.phone || 'Not provided'}\nRegistration Date: ${new Date().toLocaleString()}\n\nThis is an automated notification from your website system.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #B87333; margin-bottom: 20px;">New User Registration</h2>
          <p>A new user has registered on The Views Real Estate website.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Full Name:</strong> ${user.fullName}</p>
            <p style="margin: 5px 0;"><strong>Username:</strong> ${user.username}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${user.phone || 'Not provided'}</p>
            <p style="margin: 5px 0;"><strong>Registration Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>This is an automated notification from your website system.</p>
        </div>
      `,
    };

    // Send email to user
    const userInfo = await transporter.sendMail(userMailOptions);
    
    // Send notification to business email
    const businessInfo = await transporter.sendMail(businessMailOptions);
    
    // If using Ethereal, log the URLs where the emails can be viewed
    if (userInfo && (userInfo as any).messageUrl) {
      console.log('User email preview URL: %s', (userInfo as any).messageUrl);
    }
    
    if (businessInfo && (businessInfo as any).messageUrl) {
      console.log('Business notification email preview URL: %s', (businessInfo as any).messageUrl);
    }
    
    console.log(`New user registration notification sent to ${BUSINESS_EMAIL}`);
    
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

// Initialize the transporter when the server starts
initializeTransporter();