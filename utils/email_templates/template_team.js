exports.template_team_message = (appointment) => `\n\n
<div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333; text-align: center;">
    <div style="max-width: 600px; margin: 50px auto; padding: 20px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #007bff; font-size: 24px;">New Reservation Received!</h1>
        <p style="margin-bottom: 20px; font-size: 16px;">A reservation has been made by <strong>${appointment.name}</strong>.<br><br>
        Contact Information:<br>
        Name: <strong>${appointment.name}</strong><br>
        Contact Number: <strong>${appointment.contact}</strong><br>
        Email: <strong>${appointment.email}</strong><br>
        Date: <strong>${appointment.date}</strong><br>
        Time: <strong>${appointment.time}</strong><br>
        Services: <strong>${appointment.services.join(", ") || "N/A"}</strong><br>
        Duration: <strong>${appointment.duration}</strong><br>
        Cabin: <strong>${appointment.cabin?appointment.cabin:"N/A"}</strong><br>
        Amount Paid: <strong>$8</strong><br>
        Message: <strong>${appointment.message?appointment.message:"N/A"}</strong><br>
        Please prepare for their arrival.</p>
        <p style="font-size: 16px;">Let's ensure our guest has a wonderful experience!</p>
    </div>
    <div style="margin-top: 20px; font-size: 14px; color: #666;">
        <p>&copy; 2024 LIVE Spa. All rights reserved.</p>
    </div>
</div>
`;
