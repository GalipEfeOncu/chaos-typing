// Powerup definitions — `apply` callbacks are set dynamically in game logic
// because they need access to mutable game state refs.
// This file exports the static config only.

export const powerupsConfigTemplate = [
    {
        id: "short_circuit",
        name: "Kısa Devre",
        desc: "Ekrandaki herkesi temizle.",
        type: "buff",
        maxStacks: 999,
    },
    {
        id: "extra_life",
        name: "Ekstra Can",
        desc: "+1 Can. (Hala beceriksizsin)",
        type: "buff",
        maxStacks: 999,
    },
    {
        id: "matrix",
        name: "Matrix",
        desc: "Zaman %30 yavaşlar.",
        type: "buff",
        maxStacks: 3,
    },
    {
        id: "za_warudo",
        name: "Za Warudo",
        desc: "Zamanı 5 saniyeliğine durdur!",
        type: "buff",
        maxStacks: 999,
    },
    {
        id: "laser_eyes",
        name: "Lazer Gözler",
        desc: "Her doğru tuşta %5 şansla birini patlat (Max %25).",
        type: "buff",
        maxStacks: 5,
    },
    {
        id: "mirror_mode",
        name: "Kaos Modu",
        desc: "Düşmanlar çılgınca hareket eder! Renkler bozulur, x3 puan!",
        type: "risk",
        maxStacks: 1,
    },
    {
        id: "inflation",
        name: "Enflasyon",
        desc: "Puanlar x2 ama düşmanlar %20 hızlanır.",
        type: "risk",
        maxStacks: 3,
    },
    {
        id: "myopia",
        name: "Miyop Modu",
        desc: "Ekran bulanıklaşır, puanlar x2.",
        type: "risk",
        maxStacks: 3,
    },
    {
        id: "night_mode",
        name: "Gece Modu",
        desc: "Ekran çok karanlık olur. Puan x3.",
        type: "risk",
        maxStacks: 1,
    },
    {
        id: "censorship",
        name: "Sansür Yasası",
        desc: "Kelimeler sansürlü! Sonraki harfi görerek ilerle. Puan x2.",
        type: "risk",
        maxStacks: 1,
    },
    {
        id: "tiny_text",
        name: "Karınca Yazısı",
        desc: "Kelimeler okunmayacak kadar küçülür. Puan x1.5.",
        type: "troll",
        maxStacks: 1,
    },
    {
        id: "disco",
        name: "Disko Tobu",
        desc: "Arka plan epilepsi krizine sokar.",
        type: "troll",
        maxStacks: 1,
    },
    {
        id: "bsod",
        name: "Mavi Ekran",
        desc: "Bilgisayarın bozulmuş gibi yapar. (Düşmanlar da durur!)",
        type: "troll",
        maxStacks: 999,
    },
    {
        id: "teleport",
        name: "Işınlanma",
        desc: "Yazdığın kelimeler her harfte rastgele yere ışınlanır! Puan x2.",
        type: "risk",
        maxStacks: 1,
    },
];
