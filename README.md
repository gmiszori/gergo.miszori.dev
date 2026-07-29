# gergo.miszori.hu

A lightweight personal portfolio built using HTML5, custom CSS3, and JavaScript, utilizing AI pair-programming to accelerate development.

## 🚀 Live Demo
- **Web:** [https://gergo.miszori.hu/](https://gergo.miszori.hu/)
- **🧅 Tor Onion Mirror:** [http://gmiszorix5ntd4wr5gyicjbapgue57gvgjr6euaf7wozeofsrbwhu2id.onion/](http://gmiszorix5ntd4wr5gyicjbapgue57gvgjr6euaf7wozeofsrbwhu2id.onion/)

## ⚙️ Infrastructure & Deployment

The site is fully containerized and self-hosted using **Docker Compose**:

- `website/` — Holds all static frontend assets.
- `configs/` — Contains configuration files (`Caddyfile` and `torrc`).
- `docker-compose.yml` — Orchestrates the Caddy web server and Tor daemon containers.