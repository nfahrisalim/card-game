<script lang="ts">
    // import autoAnimate from "@formkit/auto-animate";
    import Hand from "./lib/Hand.svelte";

    let cardInput = "";
    let cards: number[] = [];
    let debounceTimer: number;
    let handComponent: Hand;
    let highlightedCardIndex: number | null = null;

    function parseCardCode(code: string): number | null {
        const suit = code[0].toUpperCase();
        const value = parseInt(code.slice(1));

        if (isNaN(value) || value < 1 || value > 13) return null;

        const suitOrder: Record<string, number> = {
            D: 0, // Diamonds
            C: 1, // Clubs
            H: 2, // Hearts
            S: 3, // Spades
        };

        if (!(suit in suitOrder)) return null;

        return suitOrder[suit] * 13 + (value - 1);
    }

    function updateCards() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const codes = cardInput.trim().split(/\s+/);
            cards = codes
                .map((code) => parseCardCode(code))
                .filter((num): num is number => num !== null);
        }, 300);
    }

    function fillAllCards() {
        cardInput = Array.from({ length: 52 }, (_, i) => {
            const suit = ["D", "C", "H", "S"][Math.floor(i / 13)];
            const value = (i % 13) + 1;
            return `${suit}${value}`;
        }).join(" ");
        updateCards();
    }

    function fillOneSuite() {
        const arr = [];
        for (let i = 1; i <= 13; i++) arr.push(`S${i}`);
        cardInput = arr.join(" ");
        updateCards();
    }

    function clearCards() {
        cardInput = "";
        cards = [];
    }

    async function calculateCorrectHand(ms: number) {
        // Simpan urutan deck yang ada
        const deck = [...cards];
        let hand: number[] = [];

        // Bersihkan semua kartu di dek
        handComponent.setHand([]);

        // Animasi
        for (let i = deck.length - 1; i >= 0; i--) {
            // Highlight kartu yang diambil
            highlightedCardIndex = i;
            await new Promise((r) => setTimeout(r, ms));

            // Jika kita punya kartu di dek, ambil kartu terakhir dan taruh di depan

            if (hand.length > 0) {
                handComponent.setFlash(true);
                const lastCard = hand.pop()!;
                hand.unshift(lastCard);
                await new Promise((r) => setTimeout(r, ms));
                handComponent.setFlash(false);
                handComponent.setHand(hand);
                await new Promise((r) => setTimeout(r, ms));
            }

            // Ambil kartu dari dek dan taruh di depan
            hand.unshift(deck[i]);
            handComponent.setHand(hand);
            await new Promise((r) => setTimeout(r, ms));
        }

        // Bersihkan highlight
        highlightedCardIndex = null;
    }
</script>

<main class="p-10">
    <h1 class="text-4xl mb-2">Game Kartu Tapi Bukan Soal Kalkulus</h1>
    <h2 class="text-lg mb-5">
        Kamu harus taruh satu kartu di meja, terus pindahin satu kartu ke belakang deckmu.
        Tujuannya cari urutan biar semua kartu keluar dengan urutan yang bener.
    </h2>

    <div class="mb-4 space-y-2">
        <textarea
            bind:value={cardInput}
            on:input={updateCards}
            placeholder="Masukin kode kartu (contoh: D13 H1 S11)"
            class="nes-textarea resize-y"
        ></textarea>

        <div class="space-x-2">
            <button class="nes-btn" on:click={fillAllCards}>
                Taruh semua kartu
            </button>
            <button class="nes-btn" on:click={fillOneSuite}>
                Taruh Satu Golongan
            </button>
            <button class="nes-btn is-error" on:click={clearCards}>
                Bersihin
            </button>
        </div>
    </div>

    <div
        class="nes-container with-title shadow-[inset_0_0_10px_#0004] bg-[#1F9CED22]"
    >
        <p class="title font-bold -translate-y-2 scale-120 border-3">Meja</p>
        <div class="grid grid-cols-13 gap-2">
            <!-- Perbarui tampilan kartu -->
            {#each cards as cardNumber, index}
                <img
                    class="hover:scale-[1.1] hover:rotate-6 hover:shadow-lg duration-200
                    {index === highlightedCardIndex
                        ? 'outline outline-4 outline-offset-2 outline-amber-500 shadow-2xl'
                        : ''}"
                    draggable="false"
                    src="/images/{cardNumber}.webp"
                    alt="card {cardNumber}"
                    on:click={(e) => {
                        if (e.shiftKey) {
                            handComponent.addCardToBack(cardNumber);
                        } else {
                            handComponent.addCardToFront(cardNumber);
                        }
                        cards = cards.filter((_, i) => i !== index);
                    }}
                />
            {/each}
        </div>
    </div>

    <div class="flex gap-2 items-center my-10">
        <button
            class="nes-btn is-primary"
            on:click={() => calculateCorrectHand(50)}
            >Mainkan Kartu Sekarang!</button
        >
        <button class="nes-btn" on:click={() => calculateCorrectHand(500)}
            >Strategikan Langkahmu</button
        >
        <hr class="border border-2 grow" />
    </div>
    <Hand bind:this={handComponent} />
    <div class="mt-10">
        <a href="https://github.com/nfahrisalim/game-of-cards.git" target="_blank">
            <i class="nes-octocat animate is-small scale-50"></i>
        </a>
        <a href="https://nostalgic-css.github.io/NES.css/" target="_blank">
            <i class="nes-jp-logo scale-75 -translate-y-5"></i>
        </a>
    </div>
</main>
