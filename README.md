# 💛 Thanks Messenger

Tiny real-time group chat with a web interface, plus a one-tap "send thanks" button.

## Run
    cp .env.example .env     # optional: set ROOM_PASSWORD
    ./run.sh                 # or: docker compose up -d --build

- Local: http://localhost:3000
- Friends: run.sh prints a public `https://xxxx.trycloudflare.com` link (Cloudflare quick tunnel).
  The link changes each time the tunnel container restarts.
  Re-show it anytime: `docker compose logs tunnel | grep trycloudflare`

## Stop
    docker compose down        # keeps chat history
    docker compose down -v     # also deletes history

## Notes
- Without Docker: `npm install && npm start`
- Set ROOM_PASSWORD in `.env` before sharing the link publicly.
- Chat history (last 200 messages) is stored in the `messenger-data` volume.
