<script lang="ts">
    import Placed from "./Placed.svelte";
    import { flip } from "svelte/animate";
    import { fade } from "svelte/transition";
    let handInput = "";
    let handCards: number[] = [];
    let savedHandState: number[] = [];
    let hasStoredState = false;
    let debounceTimer: number;
    let placedComponent: Placed;
    let playTimer: number;
    let counter = 0;
    export function addCardToBack(cardNumber: number) {
        handCards = [...handCards, cardNumber];
        updateInputFromCards();
    }

    export function addCardToFront(cardNumber: number) {
        handCards = [cardNumber, ...handCards];
        updateInputFromCards();
    }

    let isFlashLast = false;
    export function setFlash(x: boolean) {
        isFlashLast = x;
    }

    function updateInputFromCards() {
        handInput = handCards
            .map((num) => {
                const suit = ["D", "C", "H", "S"][Math.floor(num / 13)];
                const value = (num % 13) + 1;
                return `${suit}${value}`;
            })
            .join(" ");
    }

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

    function updateHand() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const codes = handInput.trim().split(/\s+/);
            handCards = codes
                .map((code) => parseCardCode(code))
                .filter((num): num is number => num !== null);
        }, 300);
    }

    function storeHandState() {
        savedHandState = [...handCards];
        hasStoredState = true;
    }

    function revertHand() {
        handCards = [...savedHandState];
        updateInputFromCards();
        hasStoredState = false;
        counter = 0;
        if (placedComponent) placedComponent.clear();
    }

    function playOne() {
        if (handCards.length === 0) return;
        if (!hasStoredState) storeHandState();
        const [first, ...rest] = handCards;
        if (handCards.length <= 1) counter = 0;
        if (counter % 2 === 0) {
            placedComponent.addCard(first);
            // Simpan kartunya
            handCards = rest;
        } else {
            // Pindahin ke belakang
            setFlash(true);
            handCards = [...rest, first];
            setTimeout(() => {
                setFlash(false);
            }, 200);
        }
        counter++;
        updateInputFromCards();
    }

    function playAll() {
        if (handCards.length === 0) return;
        if (!hasStoredState) storeHandState();
        playOne();
        playTimer = setTimeout(playAll, 100);
    }

    function clear() {
        handInput = "";
        handCards = [];
        counter = 0;
        hasStoredState = false;
        clearPlaced();
    }

    function clearPlaced() {
        if (placedComponent) placedComponent.clear();
        counter = 0;
    }

    export function setHand(newHand: number[]) {
        handCards = newHand;
        updateInputFromCards();
        counter = 0;
        hasStoredState = false;
        if (placedComponent) placedComponent.clear();
    }
</script>

<div class="mb-10 space-y-2">
    <textarea
        bind:value={handInput}
        on:input={updateHand}
        placeholder="Masukkan kartu di dek-mu (contoh: D13 H1 S11)"
        class="nes-textarea resize-y"
    />
    <div class="flex gap-3 items-center">
        <div class="grid grid-cols-4 gap-2">
            <button class="nes-btn is-success" on:click={playOne}
                >Main Satu</button
            >
            <button class="nes-btn is-primary" on:click={playAll}
                >Mainkan Semua</button
            >
            <button class="nes-btn is-error" on:click={clear}
                >Bersihkan</button
            >
            <button
                class="nes-btn is-warning"
                on:click={revertHand}
                disabled={!hasStoredState}>Balikin</button
            >
        </div>
        <p class="font-bold pt-3">
            Klik kartu di meja buat masukin ke dek. Tahan *shift* buat taruh di urutan ke belakang
        </p>
    </div>
</div>

<Placed bind:this={placedComponent} />

<div
    class="nes-container with-title shadow-[inset_0_0_10px_#0004] bg-[#F7D51F33] mt-10 transition-[height] duration-300"
    style="min-height: {handCards.length ? '200px' : '100px'}"
>
    <p class="title font-bold -translate-y-2 scale-120 border-3">Dek</p>
    <div class="grid grid-cols-13 gap-2">
         {#each handCards as cardNumber, index (cardNumber)}
            <img
                animate:flip={{ duration: 300 }}
                in:flip
                out:fade={{ duration: 200 }}
                draggable="false"
                class="{!isFlashLast && index === 0
                    ? counter % 2 === 0
                        ? 'outline-amber-500 outline-4 outline-offset-2 shadow-2xl'
                        : 'outline-lime-500 outline-4 outline-offset-2 shadow-2xl'
                    : isFlashLast && index === handCards.length - 1
                      ? 'outline-purple-500 outline-4 outline-offset-2 shadow-2xl'
                      : index % 2 === 1
                        ? 'outline-lime-500/50 outline-2 outline-offset-2'
                        : ''} hover:scale-[1.1] hover:rotate-6 hover:shadow-lg duration-200"
                src="/images/{cardNumber}.webp"
                alt="card {cardNumber}"
            />
        {/each}
    </div>
</div>
