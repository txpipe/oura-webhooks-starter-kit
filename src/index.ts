import express, { Application } from "express";
import { EmbedBuilder, WebhookClient } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const webhookClient = new WebhookClient({ id: process.env.WEBHOOK_ID!, token: process.env.WEBHOOK_TOKEN! });

const PORT = 8000;

const app: Application = express();
app.use(express.json());

const embed = new EmbedBuilder()
  .setTitle('New Delegation Event')
  .setAuthor({
    name: 'Oura Delegation Bot',
    url: 'https://github.com/txpipe/oura'
  })
  .setColor(0x00FFFF);

app.post("/delegation", async (req, res) => {

  // filters delegation events for our pool hash
  if (req.body.stake_delegation.pool_hash !== process.env.POOL_HASH) {
    res.send({
      message: "event dismissed",
    });
    return;
  }

  // builds and sends the message to discord
  embed.setFields(
    { name: 'Block Hash', value: req.body.context.block_hash || 'unknown' },
    { name: 'Tx Number', value: req.body.context.tx_hash || 'unknown' },
  )

  await webhookClient.send({
    content: `pool hash: ${req.body.stake_delegation.pool_hash}`,
    embeds: [embed],
  });

  res.send({
    message: "event processed",
  });
});

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
