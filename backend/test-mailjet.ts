import { generateRandomPassword } from "./src/utils/password";
import { sendAccountApprovedEmail, sendAccountRejectedEmail } from "./src/utils/mailjet";

async function runTest() {
  // Kita gunakan email pengirim sebagai target penerima (untuk tes saja)
  const testEmail = process.env.MAILJET_SENDER_EMAIL as string; 
  const testName = "Programmer Mever";

  console.log("--- MULAI PENGETESAN UTILITY ---");

  // Tes 1: Generate Password
  console.log("\n1. Mengetes generateRandomPassword()...");
  const plainPassword = generateRandomPassword();
  console.log("   Hasil Password Acak:", plainPassword);

  // Tes 2: Email Disetujui
  console.log("\n2. Mengetes sendAccountApprovedEmail()...");
  try {
    await sendAccountApprovedEmail(testEmail, testName, plainPassword);
    console.log("   ✅ Sukses! Cek kotak masukmu untuk melihat desain email Approved.");
  } catch (err: any) {
    console.error("   ❌ Gagal mengirim email Approved:", err.message);
  }

  // Tes 3: Email Ditolak
  console.log("\n3. Mengetes sendAccountRejectedEmail()...");
  try {
    await sendAccountRejectedEmail(testEmail, testName);
    console.log("   ✅ Sukses! Cek kotak masukmu untuk melihat desain email Rejected.");
  } catch (err: any) {
    console.error("   ❌ Gagal mengirim email Rejected:", err.message);
  }

  console.log("\n--- PENGETESAN SELESAI ---");
}

runTest();
