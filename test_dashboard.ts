import { dashboardApi } from "./frontend/src/lib/api/dashboard.api";
async function test() {
  const d = await dashboardApi.get();
  console.log(d);
}
test();
