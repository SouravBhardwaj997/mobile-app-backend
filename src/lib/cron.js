import cron from "node-cron";
import http from "http";

const job = new cron.CronJob("*/14 * * * *", () => {
  http
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
