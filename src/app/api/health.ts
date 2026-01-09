import type { NextApiResponse } from "next";

export default function handler(_: unknown, res: NextApiResponse) {
  res.status(200).send("ok");
}
