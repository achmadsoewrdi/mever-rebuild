import { dashboardApi } from "./frontend/src/lib/api/dashboard.api";
import { getVideo } from "./frontend/src/lib/api/admin-videos.api";

async function test() {
  try {
    const res = await getVideo("8a5d8530-752b-4bc1-8898-162e41b81995");
    console.log(res);
  } catch (err) {
    console.log(err);
  }
}
test();
