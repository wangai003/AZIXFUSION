const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

exports.sendMail = async(receiverEmail,subject,body) => {
    await transporter.sendMail({
    from: process.env.EMAIL,
    to: receiverEmail,
    subject: subject,
    html: body
  });
};

// Custom email templates
const brandHeader = `
  <div style="background:#1976d2;padding:24px 0;text-align:center;color:#fff;font-size:2rem;font-weight:bold;letter-spacing:2px;">
    MERN Marketplace
  </div>
`;
const brandFooter = `
  <div style="background:#f5f5f5;padding:16px 0;text-align:center;color:#888;font-size:0.9rem;">
    &copy; ${new Date().getFullYear()} MERN Marketplace. All rights reserved.
  </div>
`;

exports.sellerApplicationReceivedTemplate = (user, type) => `
  ${brandHeader}
  <div style="padding:32px 24px;font-family:sans-serif;">
    <h2 style="color:#1976d2;">Welcome to MERN Marketplace!</h2>
    <p>Hi <b>${user.name || 'there'}</b>,</p>
    <p>Congratulations! You are now a <b>${type === 'service' ? 'Service Provider' : 'Product Seller'}</b> on MERN Marketplace.</p>
    <p>Your profile is pending admin verification for the blue verified badge. You can start selling immediately while waiting for verification.</p>
    <p style="margin-top:32px;">Best regards,<br/>The MERN Marketplace Team</p>
  </div>
  ${brandFooter}
`;

exports.sellerApplicationApprovedTemplate = (user) => `
  ${brandHeader}
  <div style="padding:32px 24px;font-family:sans-serif;">
    <h2 style="color:#388e3c;">Congratulations, You're Verified!</h2>
    <p>Hi <b>${user.name || 'there'}</b>,</p>
    <p>We're excited to let you know that your seller profile has been <b>verified</b>!</p>
    <p>You now have the blue verified seller badge and can start ${user.sellerType === 'service' ? 'offering your services' : 'listing your products'} to buyers on our platform.</p>
    <a href="https://your-marketplace-url.com/login" style="display:inline-block;margin:24px 0;padding:12px 24px;background:#1976d2;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">Go to Dashboard</a>
    <p style="margin-top:32px;">Wishing you great success,<br/>The MERN Marketplace Team</p>
  </div>
  ${brandFooter}
`;

exports.sellerApplicationRejectedTemplate = (user, reason) => `
  ${brandHeader}
  <div style="padding:32px 24px;font-family:sans-serif;">
    <h2 style="color:#d32f2f;">Seller Application Rejected</h2>
    <p>Hi <b>${user.name || 'there'}</b>,</p>
    <p>We regret to inform you that your application to become a seller was <b>not approved</b> at this time.</p>
    <p><b>Reason:</b> ${reason || 'Not specified.'}</p>
    <p>If you have questions or believe this was a mistake, please contact our support team.</p>
    <p style="margin-top:32px;">Best regards,<br/>The MERN Marketplace Team</p>
  </div>
  ${brandFooter}
`;
