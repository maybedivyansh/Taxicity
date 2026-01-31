export const errorTemplate = (data: {
    userName: string,
    errorMessage: string,
    ticketId: string,
    supportURL: string
}) => {
    return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fee2e2; border-radius: 8px;">
        <h1 style="color: #991b1b;">Issue Detected</h1>
        <p>Hello ${data.userName},</p>
        <p>We encountered an error while processing your request:</p>
        <p style="background: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; color: #b91c1c;">
           <strong>Error: ${data.errorMessage}</strong>
        </p>
        <p>Ticket ID: code style="background: #eee; padding: 2px 5px; border-radius: 3px;">${data.ticketId}</code></p>
        <p>Our team is working to resolve this. We'll update you within 24 hours.</p>
        <div style="margin-top: 25px;">
          <a href="${data.supportURL}?ticket=${data.ticketId}" style="color: #4F46E5; text-decoration: underline;">
            Check Status
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
};
