export const deadlineTemplate = (data: {
    userName: string,
    daysRemaining: number,
    potentialSavings: number,
    actionSteps: string,
    dashboardURL: string
}) => {
    return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fee2e2; border-radius: 8px; border-left: 4px solid #dc2626;">
        <h1 style="color: #dc2626;">Tax Filing Deadline Alert</h1>
        <p>Hello ${data.userName},</p>
        <p>The tax filing deadline is approaching:</p>
        <div style="font-size: 24px; font-weight: bold; margin: 15px 0;">
           Days Remaining: ${data.daysRemaining}
        </div>
        <p>You can still save <strong style="color: green;">₹${data.potentialSavings}</strong> by acting now:</p>
        <p style="background: #f9fafb; padding: 10px; border-radius: 4px;">${data.actionSteps}</p>
        
        <div style="margin-top: 25px;">
          <a href="${data.dashboardURL}/deadline-tracker" style="background: #DC2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Action Items
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
};
