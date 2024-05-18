exports.template_customer_message = (appointment) => `
<br>
<div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333; text-align: center;">
    <div style="max-width: 600px; margin: 50px auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #007bff; margin-bottom: 10px;">Thank You!</h1>
        <p style="margin-bottom: 20px; font-size: 16px;">
            Dear ${appointment.name},<br><br>
            We are delighted to confirm your reservation at Live SPA by Loreto. Your appointment for <strong>${appointment.date}</strong> at <strong>${appointment.time}</strong> has been successfully booked. Prepare to indulge in moments of serenity and rejuvenation.<br><br>
            <strong>Services:</strong> ${appointment.services?appointment.services.join(", "):"N/A"}<br>
            <strong>Duration:</strong> ${appointment.duration}<br>
            <strong>Cabin:</strong> ${appointment.cabin?appointment.cabin:"N/A"}<br>
            <strong>Contact Number:</strong> ${appointment.contact}<br>
            <strong>Email:</strong> ${appointment.email}<br><br>
            <strong>Message:</strong> ${appointment.message?appointment.message:"N/A"}<br><br>
            As you embark on this wellness journey, allow your mind to unwind and your body to embrace tranquility. We eagerly await your arrival!
        </p>
    </div>
    <div style="margin-top: 20px; font-size: 12px; color: #666;">
        <p>&copy; 2024 Live SPA by Loreto. All rights reserved.</p>
    </div>
</div>
`;
