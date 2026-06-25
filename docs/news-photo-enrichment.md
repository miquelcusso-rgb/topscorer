# TopScorers — enriquecimiento de fotos para nombres de las noticias

Muchos titulares de las noticias (`lib/news.ts`) nombran a jugadores que **no
están en `SEARCH_INDEX`** (juegan en ligas que no ingerimos — Arabia/Saudi, MLS,
selecciones, etc.) o en una forma de nombre que el matcher no acierta. Antes
caían al escudo del club o al placeholder. El enriquecimiento los resuelve a un
id de API-Football **con su foto real** en tiempo de build/cron y los cachea.

## Cómo funciona

1. `scripts/diagnose-news-photos.mjs` — diagnóstico read-only. Baja los feeds
   RSS en vivo, extrae candidatos a nombre de jugador de cada titular y reporta
   cuáles NO resuelven hoy y por qué. (No hace llamadas a la API.)
2. `scripts/enrich-news-photos.mjs` — **build/cron, NO por request**. Para cada
   candidato que no resuelve hoy, llama a
   `GET /players/profiles?search=<apellido>` (mín. 4 letras; busca por APELLIDO),
   elige la mejor coincidencia con desambiguación **precisión-primero** y
   confirma que la foto es REAL (no la silueta de ~5192 bytes). Cachea
   `nombreNormalizado → id` en `data/news-name-photos.ts`.
3. `lib/player-photo.ts` `headshotForHeadline` consulta `NEWS_NAME_PHOTOS` en el
   **pass 0.5** (tras los mononyms curados, antes de los passes del índice). Los
   ids ya están foto-verificados en el enriquecimiento, así que se emiten
   directamente (bypass del gate `verifiedPhoto`), igual que los mononyms.

## Regla de precisión (una cara equivocada es peor que un placeholder)

`/players/profiles?search=<apellido>` devuelve TODOS los jugadores con ese
apellido. Para elegir:
- **Tier 3 (exacto):** `norm(firstname+lastname)` (o `name`) == el nombre del
  titular (o su contracción "primer último"). Gana siempre.
- **Tier 2:** todos los tokens del candidato están en el set de tokens del
  jugador Y el apellido del candidato es un token del `lastname` de la API
  (cubre el quirk de que `firstname` a veces trae el nombre completo y los
  segundos apellidos: "Piero Hincapie" → "Piero Martín **Hincapié** Reyna").
- **Tier 1 (débil):** solo coincide el apellido. NUNCA se cachea por sí solo.
- Si hay **empate** en el mejor tier (≥2 ids distintos) → SKIP, salvo que
  exactamente uno tenga foto real (desempate por foto). Nunca se adivina.
- El id elegido debe tener **foto real** o se descarta.

Esto descarta managers/periodistas/clubes (Guardiola, Fabrizio Romano, Inter
Milan → tier-1, skip) y homónimos ambiguos (Hugo Sánchez, Steve Clarke → skip).

## Cuota

API-Football Pro = 7500/día. El script throttlea (~4 req/s), deduplica llamadas
por apellido y limita con `--cap` (por defecto 250 apellidos/run). Un run típico
gasta unas decenas-pocos cientos de llamadas: muy por debajo del límite.

## Comandos

```bash
node scripts/diagnose-news-photos.mjs                 # diagnóstico (sin API)
node scripts/enrich-news-photos.mjs                   # enriquecer + escribir
node scripts/enrich-news-photos.mjs --dry             # no escribe el data file
node scripts/enrich-news-photos.mjs --cap=120         # limita llamadas
node scripts/enrich-news-photos.mjs --names="Nico Paz,Piero Hincapie"  # ad-hoc
```

## Cron / refresco periódico

`data/news-name-photos.ts` es un **fichero fuente commiteado**, no datos de
runtime. No puede ser un cron HTTP de Vercel (`/api/cron/*`) porque necesita la
API key y hacer `git push`, y el FS en runtime es de solo lectura. Se refresca
**semanalmente** vía la tarea programada local `topscorer-news-photos-weekly`
(scheduled-tasks), que corre:

```bash
cd ~/Documents/sites-system/sites/topscorer && \
  node scripts/enrich-news-photos.mjs && \
  git add data/news-name-photos.ts && \
  git commit -m "chore: refresh news-name photo cache" && git push
```

Semanal es suficiente (los nombres de jugador en titulares rotan despacio) y
mantiene el gasto de API mínimo. Aumentar a diario solo si se ve que faltan
nombres frescos con frecuencia.
