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

exports.sendOrderConfirmationEmail = async (userEmail, order) => {
  const orderItems = order.item || [];
  const totalAmount = order.total || 0;
  const currency = order.selectedCurrency || 'AKOFA';

  const itemsHtml = orderItems.map(item => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${item.product?.name || 'Product'}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity || 1}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${(item.product?.price || 0).toFixed(2)} ${currency}</td>
    </tr>
  `).join('');

  const emailHtml = `
    ${brandHeader}
    <div style="padding:32px 24px;font-family:sans-serif;">
      <h2 style="color:#388e3c;">Order Confirmed!</h2>
      <p>Hi there,</p>
      <p>Thank you for your order! Your payment has been successfully processed.</p>

      <div style="background:#f9f9f9;padding:16px;margin:24px 0;border-radius:4px;">
        <h3 style="margin:0 0 16px 0;color:#1976d2;">Order Details</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Payment Method:</strong> MoonPay (${currency})</p>
        <p><strong>Transaction ID:</strong> ${order.moonpayTransactionId || 'N/A'}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin:24px 0;">
        <thead>
          <tr style="background:#1976d2;color:#fff;">
            <th style="padding:12px;text-align:left;border:1px solid #ddd;">Product</th>
            <th style="padding:12px;text-align:center;border:1px solid #ddd;">Quantity</th>
            <th style="padding:12px;text-align:right;border:1px solid #ddd;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr style="background:#f5f5f5;font-weight:bold;">
            <td colspan="2" style="padding:12px;text-align:right;border:1px solid #ddd;">Total:</td>
            <td style="padding:12px;text-align:right;border:1px solid #ddd;">${totalAmount.toFixed(2)} ${currency}</td>
          </tr>
        </tfoot>
      </table>

      <div style="background:#e8f5e8;padding:16px;margin:24px 0;border-radius:4px;border-left:4px solid #388e3c;">
        <p style="margin:0;"><strong>What happens next?</strong></p>
        <ul style="margin:8px 0 0 20px;padding:0;">
          <li>You will receive shipping updates via email</li>
          <li>Sellers will process your order within 1-2 business days</li>
          <li>You can track your order in your account dashboard</li>
        </ul>
      </div>

      <p>If you have any questions, please contact our support team.</p>
      <p style="margin-top:32px;">Thank you for shopping with us!<br/>The MERN Marketplace Team</p>
    </div>
    ${brandFooter}
  `;

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: userEmail,
    subject: `Order Confirmed - ${order._id}`,
    html: emailHtml
  });
};
