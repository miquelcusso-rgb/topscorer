# TopScorers — fuentes de noticias

Las noticias se ingieren de **feeds RSS públicos** en `lib/news.ts`. Mostramos
SOLO **titular + nombre de la fuente + enlace** al artículo original; nunca
rehospedamos el cuerpo (ver `app/[lang]/aviso`). Se cachea con `unstable_cache`
(revalida cada 20 min). Dedup por título; orden por recencia con empuje a
titulares prioritarios; flags `isBreaking` / `isWorldCup` / `isPriority`.

## Selección por idioma de la web
`getNews(lang)` filtra `FEEDS.filter(f => f.lang === lang)`: la web en **ES**
muestra solo fuentes en español; la web en **EN**, solo en inglés. Por eso los
titulares **ya salen siempre en el idioma de la web** (no se traducen: se sirven
feeds nativos de ese idioma).

## Fuentes en español (web ES)
| Fuente | Tipo |
|---|---|
| Europa Press | Agencia |
| Marca · Marca — Más fútbol · Marca — Champions | Diario deportivo |
| Mundo Deportivo | Diario deportivo |
| Sport | Diario deportivo |
| El Mundo (Deporte) | Generalista |
| ABC (Deportes) | Generalista |
| Google News — LaLiga / Premier / Serie A / Bundesliga / Ligue 1 (hl=es) | Agregador por liga |

## Fuentes en inglés (web EN)
| Fuente | Tipo |
|---|---|
| The Guardian · Guardian — Transfers | Diario |
| BBC Sport · BBC — Premier League | Público |
| ESPN | Deportivo |
| Sky Sports · Sky — Transfer Centre | Deportivo |
| talkSPORT | Radio/deportivo |
| Football365 | Deportivo |
| The Independent | Diario |
| Google News — LaLiga / Premier / Serie A / Bundesliga / Ligue 1 (hl=en) | Agregador por liga |

> AS RSS se retiró (abandonado desde ago-2022, XML válido pero sin ítems frescos).

## Reglas
- Solo titular + fuente + enlace. No reproducir cuerpos (ToS/derechos).
- Mantener verificado que cada feed devuelve ítems frescos (revisión periódica).
- Para añadir una fuente: agrégala a `FEEDS` en `lib/news.ts` con su `lang`.

## Pendiente / decisión abierta
- **Traducción de titulares de fuentes internacionales**: hoy cada web ve solo
  fuentes de su idioma. Para que la web ES pueda mostrar también titulares de
  BBC/Guardian (traducidos al ES) o la EN mostrar Marca/MD (traducidos al EN)
  haría falta un servicio de traducción (DeepL/LLM) sobre el titular. Sin decidir.
