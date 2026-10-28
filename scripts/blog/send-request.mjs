import { readFile, writeFile } from "node:fs/promises";
const [requestFile] = process.argv.slice(2);
const token = process.env.TELEGRAM_CONTENT_TOKEN,
  chat = process.env.TELEGRAM_FOUNDER_CHAT_ID;
if (!requestFile || !token || !/^\d+$/.test(chat || ""))
  throw Error(
    "Request file and content-bot/founder environment configuration required",
  );
const r = JSON.parse(await readFile(requestFile, "utf8"));
if (r.message_id) throw Error("Request already sent; use its existing card");
const withdrawing = r.requested_action === "unpublish_web";
const response = await fetch(
  `https://api.telegram.org/bot${token}/sendMessage`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chat,
      text: withdrawing
        ? `Unpublish article?\n\n${r.title}\n\n${r.canonical_url}\n\nApproval removes this revision from the website, archive and feeds after deployment. Source history is retained.`
        : `Website publication approval\n\n${r.title}\n\nDestination: ${r.canonical_url}\n\nApprove publication releases this exact article after checks. Earlier preview approvals do not publish it. If this replaces or restores an existing article, only the exact reviewed revision is released.`,
      reply_markup: {
        inline_keyboard: [
          [{ text: "Review article", url: r.preview_url }],
          [
            {
              text: withdrawing
                ? "Approve unpublish"
                : "Approve website publication",
              callback_data: "web:approve:" + r.id,
            },
            {
              text: withdrawing ? "Keep published" : "Keep as draft",
              callback_data: "web:reject:" + r.id,
            },
          ],
        ],
      },
    }),
    signal: AbortSignal.timeout(15000),
  },
);
const result = await response.json();
if (!response.ok || !result.ok)
  throw Error("Telegram rejected the review card");
r.message_id = result.result.message_id;
await writeFile(requestFile, JSON.stringify(r, null, 2), { mode: 0o600 });
console.log(JSON.stringify({ message_id: r.message_id, status: "sent" }));
