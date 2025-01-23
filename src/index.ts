import fs from "fs";
import { send } from "./lib/jwtClient";

import request from "./request.json";

import "dotenv/config";

const secret = process.env.JWT_SECRET || "";

const main = async () => {
  const response = await send(request, secret);
  console.log(response);
};

main();
