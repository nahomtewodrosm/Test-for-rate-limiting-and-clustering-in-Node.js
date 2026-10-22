var _a;
import { createApp } from "./app";
const port = Number((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3001);
createApp().listen(port, () => {
    console.log(`[worker ${process.pid}] API listening on :${port}`);
});
