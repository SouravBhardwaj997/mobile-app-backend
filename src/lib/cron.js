import cron from "cron";
import https from "https";
import "dotenv/config";
const job = new cron.CronJob("*/14 * * * *", () => {
  https
    .get(process.env.API_URL, (res) => {
      // console.log("server is running");
      if (res.statusCode === 200) {
        console.log("GET request sent");
      } else {
        console.log("GET request failed", res.statusCode);
      }
    })
    .on("error", (err) => {
      console.log("GET request failed", err);
    });
});

export default job;
