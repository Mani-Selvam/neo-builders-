import 'dotenv/config';

export const sendWhatsappOTP = async (mobileNo, otp) => {
  const url = process.env.NEO_WHATSAPP_API_URL;
  const token = process.env.NEO_WHATSAPP_API_TOKEN;
  const templateName = process.env.NEO_OTP_TEMPLATE_NAME || 'otp_verification';
  const language = process.env.NEO_WHATSAPP_LANGUAGE || 'en';
  
  if (!url || !token) {
    console.error('[whatsappUtils] WhatsApp API URL or Token is missing.');
    return;
  }

  // Formatting number: ensure it has country code if not present. Assuming India (+91) if 10 digits
  let formattedNumber = mobileNo.trim();
  if (formattedNumber.length === 10) {
    formattedNumber = `91${formattedNumber}`;
  } else if (formattedNumber.startsWith('+')) {
    formattedNumber = formattedNumber.substring(1);
  }

  // The payload structure as requested
  const payload = {
    to: formattedNumber,
    type: "template",
    template: {
      language: {
        policy: "deterministic",
        code: language,
      },
      name: templateName,
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: otp
            }
          ]
        },
        {
          type: "button",
          sub_type: "url",
          index: parseInt(process.env.NEO_WHATSAPP_BUTTON_INDEX || '0', 10),
          parameters: [
            {
              type: "text",
              text: otp
            }
          ]
        }
      ]
    }
  };

  try {
    const response = await fetch(`${url}?token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`[whatsappUtils] OTP sent to ${formattedNumber} successfully.`);
      return data;
    } else {
      console.error(`[whatsappUtils] Failed to send OTP:`, data);
      throw new Error(data.message || 'WhatsApp API Error');
    }
  } catch (error) {
    console.error(`[whatsappUtils] Exception sending WhatsApp OTP:`, error);
    throw error;
  }
};
