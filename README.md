# Super Pokémon — Jogo de Cartas

Jogo de cartas no estilo **Super Trunfo / Super Pokémon Elma Chips** com os Pokémon das gerações 1 e alguns lendários da 2ª.

## Como jogar
Abra `index.html` no navegador (ou publique como site estático). Nenhuma dependência ou build necessário — é HTML/CSS/JS puro.

- **Campanha:** suba a escada de 25 oponentes cada vez mais fortes.
- **Loja:** gaste ouro para comprar cartas (lendários só em batalha).
- **Coleção:** monte seu Time Favorito.
- **Batalha livre:** com seus Pokémon (ganha ouro) ou com quaisquer (sem ouro).

## Regras
6 atributos por carta (Vida, Força, Ataque, Defesa, Agilidade, Inteligência), todos na escala 0–100.
A cada rodada compara-se um atributo; a carta derrotada sai do jogo. Vence quem eliminar todas as cartas do adversário.

## Estrutura
- `index.html` — telas do jogo
- `css/estilo.css` — estilos
- `js/dados.js` — base de dados dos Pokémon (gerada de `Pokemons_Status.xlsx`)
- `js/som.js` — efeitos sonoros (Web Audio API)
- `js/jogo.js` — lógica do jogo
- `Pokemons_Status.xlsx` — planilha com todos os status (escala 0–100)

## Deploy (Vercel)
Site 100% estático. No Vercel: **New Project → importe este repositório → Deploy** (sem configuração; Framework Preset = *Other*).
