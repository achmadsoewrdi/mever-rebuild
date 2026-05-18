async function test() {
  try {
    const res = await fetch("http://127.0.0.1:3000/api/v1/videos");
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Body:", text);
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}
test();
