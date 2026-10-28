import type { NextApiRequest, NextApiResponse } from "next";
// The homepage activity widget is retired. Preserve a bounded response for old clients.
export default function RetiredActivity(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader("Cache-Control", "no-store");
  res.status(410).json({
    error: "The historical transaction activity widget has been retired.",
  });
}
