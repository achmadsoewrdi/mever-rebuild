import Mailjet from 'node-mailjet';
import { env } from '../config/env';

// Inisialisasi Instance Mailjet dengan kredensial dari .env (lewat Zod)
const mailjet = new Mailjet({
  apiKey: env.MAILJET_API_KEY,
  apiSecret: env.MAILJET_SECRET_KEY
});


// Interface struktur pengiriman standar
interface SendEmailParams {
  toEmail: string;
  toName: string;
  subject: string;
  htmlPart: string;
}

/**
 * Fungsi utilitas utama untuk mengirim email via Mailjet
 */
export const sendEmail = async ({ toEmail, toName, subject, htmlPart }: SendEmailParams) => {
  try {
    const request = await mailjet
      .post("send", { 'version': 'v3.1' })
      .request({
        "Messages": [
          {
            "From": {
              "Email": env.MAILJET_SENDER_EMAIL,
              "Name": env.MAILJET_SENDER_NAME
            },
            "To": [
              {
                "Email": toEmail,
                "Name": toName
              }
            ],
            "Subject": subject,
            "HTMLPart": htmlPart
          }
        ]
      });
    return { success: true, data: request.body };
  } catch (error: any) {
    console.error("Mailjet Error:", error.statusCode || error.message);
    throw new Error("Gagal mengirim email via Mailjet.");
  }
};

/**
 * 1. Template Email saat Akun Disetujui (Approved)
 */
export const sendAccountApprovedEmail = async (toEmail: string, name: string, plainPassword: string) => {
  const subject = "🎉 Request Akun MEVER Disetujui!";
  
  // Desain HTML dengan warna Design System Mever (#FF1744, #111111, dll)
  const htmlPart = `
    <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; color: #111111;">
      
      <!-- Bagian Header -->
      <div style="background-color: #f8fafc; padding: 25px; text-align: center; border-bottom: 1px solid #e2e8f0;">
        <h1 style="color: #FF1744; margin: 0; font-size: 28px; letter-spacing: 2px;">MEVER</h1>
      </div>
      
      <!-- Bagian Konten -->
      <div style="padding: 30px;">
        <h2 style="color: #FF1744; margin-top: 0;">Selamat datang di MEVER, ${name}!</h2>
        <p style="color: #555555; line-height: 1.6;">Permintaan pembuatan akun kamu telah <strong style="color: #111111;">disetujui</strong> oleh Administrator.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e2e8f0;">
          <p style="margin: 0 0 10px 0; color: #555555;"><strong>Email Login:</strong><br><span style="color: #111111; font-size: 16px;">${toEmail}</span></p>
          <p style="margin: 0; color: #555555;"><strong>Password Sementara:</strong><br><span style="font-family: monospace; font-size: 22px; font-weight: bold; color: #FF1744; letter-spacing: 2px;">${plainPassword}</span></p>
        </div>
        
        <div style="background-color: rgba(255, 23, 68, 0.05); border-left: 4px solid #FF1744; padding: 15px; margin-bottom: 30px; border-radius: 0 4px 4px 0;">
          <p style="margin: 0; color: #D50000; font-size: 14px;">
            <strong>⚠️ PENTING:</strong> Segera login dan ubah password ini di pengaturan profil demi keamanan akunmu!
          </p>
        </div>
        
        <p style="color: #555555; font-size: 14px; margin-bottom: 0;">Terima kasih,<br><strong style="color: #111111;">Tim MEVER</strong></p>
      </div>
    </div>
  `;

  return sendEmail({ toEmail, toName: name, subject, htmlPart });
};

/**
 * 2. Template Email saat Akun Ditolak (Rejected)
 */
export const sendAccountRejectedEmail = async (toEmail: string, name: string) => {
  const subject = "Status Request Akun MEVER";
  
  const htmlPart = `
    <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; color: #111111;">
      
      <!-- Bagian Header -->
      <div style="background-color: #f8fafc; padding: 25px; text-align: center; border-bottom: 1px solid #e2e8f0;">
        <h1 style="color: #FF1744; margin: 0; font-size: 28px; letter-spacing: 2px;">MEVER</h1>
      </div>
      
      <!-- Bagian Konten -->
      <div style="padding: 30px;">
        <h2 style="color: #111111; margin-top: 0;">Halo, ${name}.</h2>
        <p style="color: #555555; line-height: 1.6;">Mohon maaf, permintaan pembuatan akun kamu untuk platform MEVER saat ini <strong style="color: #FF1744;">belum dapat disetujui</strong> oleh Administrator.</p>
        <p style="color: #555555; line-height: 1.6;">Jika kamu merasa ini adalah sebuah kesalahan, silakan hubungi tim Administrator atau atasan di departemenmu.</p>
        <br>
        <p style="color: #555555; font-size: 14px; margin-bottom: 0;">Terima kasih atas pengertiannya,<br><strong style="color: #111111;">Tim MEVER</strong></p>
      </div>
    </div>
  `;

  return sendEmail({ toEmail, toName: name, subject, htmlPart });
};
