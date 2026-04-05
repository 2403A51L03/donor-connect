const concurrently = require("concurrently");

const result = concurrently(
  [
    {
      command: "pnpm --filter @workspace/api-server run dev",
      name: "api",
      prefixColor: "blue",
    },
    {
      command: "pnpm --filter @workspace/blood-donor run dev",
      name: "web",
      prefixColor: "green",
    },
  ],
  {
    killOthers: ["failure"],
    prefix: "name",
    restartTries: 0,
  },
);

result.result.then(
  () => process.exit(0),
  () => process.exit(1),
);
