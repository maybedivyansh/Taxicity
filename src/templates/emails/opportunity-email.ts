export const opportunityTemplate = (data: {
    savings: number,
    title: string,
    userName: string,
    message: string,
    effort: string,
    priority: number,
    actionURL: string,
    deadline: string
}) => {
    return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h1 style="color: #4F46E5;">${data.title}</h1>
        <p>Hello ${data.userName},</p>
        <p>We found a tax-saving opportunity for you:</p>
        <p><strong>${data.message}</strong></p>
        
        <div style="background-color: #F0FDF4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;">Potential Savings: <span style="color: green; font-weight: bold; font-size: 18px;">₹${data.savings}</span></p>
        </div>

        <p>Effort Level: ${data.effort}</p>
        <p>Priority: ${data.priority}/3</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.actionURL}" style="background: #0EA5E9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            View Details in Dashboard
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">Deadline: ${data.deadline}</p>
      </div>
    </body>
    </html>
  `;
};
