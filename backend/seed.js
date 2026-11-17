const buffer = require("node:buffer");
if (!buffer.SlowBuffer) {
  buffer.SlowBuffer = buffer.Buffer;
}
require("dotenv").config();
const mongoose = require("mongoose");

const Movie = require("./models/Movie");
const Cinema = require("./models/Cinema");
const SeatType = require("./models/SeatType");
const ScheduledScreening = require("./models/ScheduledScreening");

const sampleMovies = [
  {
    title: "Starlight Odyssey",
    originalTitle: "Starlight Odyssey",
    subtitle: "Beyond the Event Horizon",
    description:
      "When a deep space exploration vessel intercepts a mysterious signal from an uncharted nebula, the crew embarks on a high-stakes voyage across the cosmic frontier to prevent an impending dimensional collapse.",
    runtime: 148,
    is3D: true,
    startdate: new Date(),
    release: {
      productionCountry: "US",
      productionYear: 2024,
      ageRestriction: 12,
    },
    genres: ["Sci-Fi", "Adventure", "Drama"],
    keywords: ["space", "wormhole", "exploration", "galaxy"],
    credits: {
      crew: {
        director: { name: "Elena Vance" },
        screenwriter: { name: "Marcus Thorne" },
      },
      cast: [
        {
          name: "David Sterling",
          roleName: "Commander Sean Hayes",
          img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
        },
        {
          name: "Aria Montgomery",
          roleName: "Dr. Maya Lin",
          img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
        },
      ],
    },
    media: {
      images: {
        poster:
          "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
      },
      videos: {
        trailer: {
          key: "dQw4w9WgXcQ",
          name: "Official Teaser",
          site: "YouTube",
        },
      },
    },
  },
  {
    title: "Shadows of the Citadel",
    originalTitle: "Shadows of the Citadel",
    subtitle: "Secrets Lurk in the Dark",
    description:
      "In an ancient walled kingdom where secrets are traded as currency, an exiled royal archivist uncovers a treasonous conspiracy that reaches into the highest chambers of the realm.",
    runtime: 132,
    is3D: false,
    startdate: new Date(),
    release: {
      productionCountry: "GB",
      productionYear: 2024,
      ageRestriction: 16,
    },
    genres: ["Mystery", "Thriller", "Drama"],
    keywords: ["conspiracy", "castle", "royalty", "mystery"],
    credits: {
      crew: {
        director: { name: "Jonathan Cross" },
        screenwriter: { name: "Sarah Caldwell" },
      },
      cast: [
        {
          name: "Alistair Finch",
          roleName: "Archivist Logan Gray",
          img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
        },
        {
          name: "Clara Beaumont",
          roleName: "Lady Beatrice",
          img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
        },
      ],
    },
    media: {
      images: {
        poster:
          "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800&q=80",
      },
      videos: {
        trailer: {
          key: "dQw4w9WgXcQ",
          name: "Official Trailer",
          site: "YouTube",
        },
      },
    },
  },
  {
    title: "The Clockwork Detective",
    originalTitle: "The Clockwork Detective",
    subtitle: "Murder in the Age of Steam",
    description:
      "In Victorian New London, a reclusive mechanical savant and his clockwork automaton partner investigate an impossible string of vault heists orchestrated by a phantom thief.",
    runtime: 118,
    is3D: false,
    startdate: new Date(),
    release: {
      productionCountry: "DE",
      productionYear: 2023,
      ageRestriction: 12,
    },
    genres: ["Action", "Crime", "Mystery"],
    keywords: ["steampunk", "detective", "victorian", "gears"],
    credits: {
      crew: {
        director: { name: "Wilhelm Richter" },
        screenwriter: { name: "Heinrich Mueller" },
      },
      cast: [
        {
          name: "Arthur Pendelton",
          roleName: "Inspector Charles Fox",
          img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300",
        },
        {
          name: "Gwendolyn Hart",
          roleName: "Millicent Ward",
          img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300",
        },
      ],
    },
    media: {
      images: {
        poster:
          "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80",
      },
      videos: {
        trailer: {
          key: "dQw4w9WgXcQ",
          name: "Official Trailer",
          site: "YouTube",
        },
      },
    },
  },
  {
    title: "Echoes of the Deep",
    originalTitle: "Echoes of the Deep",
    subtitle: "Terror in the Abyss",
    description:
      "A marine research crew stationed in a deep-sea benthic trench discovers an ancient bioluminescent biosphere that harbors creatures far older than mankind.",
    runtime: 126,
    is3D: true,
    startdate: new Date(),
    release: {
      productionCountry: "US",
      productionYear: 2024,
      ageRestriction: 16,
    },
    genres: ["Sci-Fi", "Thriller", "Horror"],
    keywords: ["ocean", "submarine", "abyss", "creature"],
    credits: {
      crew: {
        director: { name: "Teresa Morales" },
        screenwriter: { name: "Kevin Zhang" },
      },
      cast: [
        {
          name: "Rachel Chen",
          roleName: "Dr. Evelyn Drake",
          img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300",
        },
        {
          name: "Gabriel Soto",
          roleName: "Pilot Mateo Diaz",
          img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300",
        },
      ],
    },
    media: {
      images: {
        poster:
          "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800&q=80",
      },
      videos: {
        trailer: {
          key: "dQw4w9WgXcQ",
          name: "Official Trailer",
          site: "YouTube",
        },
      },
    },
  },
  {
    title: "Neon Mirage",
    originalTitle: "Neon Mirage",
    subtitle: "Grid Runner 2099",
    description:
      "In a rain-slicked metropolis dominated by synthetic memory conglomerates, an unlicensed data courier must smuggle a sentient AI algorithm before rival syndicates wipe her consciousness.",
    runtime: 112,
    is3D: false,
    startdate: new Date(),
    release: {
      productionCountry: "JP",
      productionYear: 2024,
      ageRestriction: 16,
    },
    genres: ["Action", "Sci-Fi", "Crime"],
    keywords: ["cyberpunk", "neon", "ai", "hacker"],
    credits: {
      crew: {
        director: { name: "Kenji Takahashi" },
        screenwriter: { name: "Yuki Sato" },
      },
      cast: [
        {
          name: "Hana Kuroda",
          roleName: "Ren Tanaka",
          img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300",
        },
        {
          name: "Viktor Petrov",
          roleName: "Nikolai",
          img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300",
        },
      ],
    },
    media: {
      images: {
        poster:
          "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80",
      },
      videos: {
        trailer: {
          key: "dQw4w9WgXcQ",
          name: "Official Trailer",
          site: "YouTube",
        },
      },
    },
  },
  {
    title: "Whispering Pines",
    originalTitle: "Whispering Pines",
    subtitle: "Some Woods Never Forget",
    description:
      "A naturalist documenting vanishing folklore in an isolated Appalachian valley encounters a tight-knit mountain town protecting a terrifying pact made with the ancient forest.",
    runtime: 105,
    is3D: false,
    startdate: new Date(),
    release: {
      productionCountry: "US",
      productionYear: 2023,
      ageRestriction: 18,
    },
    genres: ["Horror", "Mystery", "Drama"],
    keywords: ["forest", "folklore", "isolation", "pact"],
    credits: {
      crew: {
        director: { name: "Hannah Brooks" },
        screenwriter: { name: "Samuel Ortiz" },
      },
      cast: [
        {
          name: "Lucas Miller",
          roleName: "Tom Walker",
          img: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300",
        },
        {
          name: "Eliza Thorn",
          roleName: "Nora Calloway",
          img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300",
        },
      ],
    },
    media: {
      images: {
        poster:
          "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80",
      },
      videos: {
        trailer: {
          key: "dQw4w9WgXcQ",
          name: "Official Trailer",
          site: "YouTube",
        },
      },
    },
  },
  {
    title: "The Quantum Paradox",
    originalTitle: "The Quantum Paradox",
    subtitle: "Every Choice Splits Reality",
    description:
      "Two rival quantum physicists inadvertently activate a temporal loop during an experimental collider test, finding themselves pursued by alternate versions of their own research team.",
    runtime: 135,
    is3D: false,
    startdate: new Date(),
    release: {
      productionCountry: "CA",
      productionYear: 2024,
      ageRestriction: 12,
    },
    genres: ["Sci-Fi", "Thriller"],
    keywords: ["quantum", "multiverse", "time-loop", "physics"],
    credits: {
      crew: {
        director: { name: "Arjun Patel" },
        screenwriter: { name: "Claire Dubois" },
      },
      cast: [
        {
          name: "Naveen Rao",
          roleName: "Dr. Kavi Sharma",
          img: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300",
        },
        {
          name: "Emily Watson",
          roleName: "Dr. Laura Bailey",
          img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300",
        },
      ],
    },
    media: {
      images: {
        poster:
          "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
      },
      videos: {
        trailer: {
          key: "dQw4w9WgXcQ",
          name: "Official Trailer",
          site: "YouTube",
        },
      },
    },
  },
  {
    title: "Chronicles of the Wind",
    originalTitle: "Chronicles of the Wind",
    subtitle: "Skyward Voyage",
    description:
      "In an airborne world of floating archipelagos, an intrepid young cartographer builds a solar glider to chart the mythic Sky Sea and restore balance to the seasonal tempest currents.",
    runtime: 98,
    is3D: true,
    startdate: new Date(),
    release: {
      productionCountry: "FR",
      productionYear: 2023,
      ageRestriction: 6,
    },
    genres: ["Animation", "Adventure", "Family"],
    keywords: ["sky", "airship", "adventure", "clouds"],
    credits: {
      crew: {
        director: { name: "Lucian Moreau" },
        screenwriter: { name: "Amelie Laurent" },
      },
      cast: [
        {
          name: "Julien Benoit",
          roleName: "Leo (Voice)",
          img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
        },
        {
          name: "Chloe Dupont",
          roleName: "Zephyr (Voice)",
          img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
        },
      ],
    },
    media: {
      images: {
        poster:
          "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80",
      },
      videos: {
        trailer: {
          key: "dQw4w9WgXcQ",
          name: "Official Trailer",
          site: "YouTube",
        },
      },
    },
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Error: MONGODB_URI is not defined in backend/.env");
    process.exit(1);
  }

  console.log("Connecting to MongoDB Atlas...");
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log("MongoDB connected successfully.");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    console.error("Please verify that your public IP address is whitelisted in MongoDB Atlas Network Access.");
    process.exit(1);
  }

  try {
    // 1. Ensure Default Seat Types
    console.log("\nEnsuring Seat Types exist...");
    let standardSeatType = await SeatType.findOne({ title: "Standard" });
    if (!standardSeatType) {
      standardSeatType = await SeatType.create({
        title: "Standard",
        price: 12,
        colorHEX: "#3b82f6",
      });
      console.log("Created 'Standard' seat type.");
    }

    let premiumSeatType = await SeatType.findOne({ title: "Premium" });
    if (!premiumSeatType) {
      premiumSeatType = await SeatType.create({
        title: "Premium",
        price: 16,
        colorHEX: "#eab308",
      });
      console.log("Created 'Premium' seat type.");
    }

    // 2. Ensure Default Cinema exists
    console.log("\nEnsuring Cinema exists...");
    let cinema = await Cinema.findOne();
    if (!cinema) {
      const rows = [];
      const totalRows = 6;
      const totalCols = 8;
      for (let r = 0; r < totalRows; r++) {
        const row = [];
        for (let c = 0; c < totalCols; c++) {
          row.push({
            row: r,
            col: c,
            status: "unselected",
            type: r >= 4 ? premiumSeatType._id : standardSeatType._id,
          });
        }
        rows.push(row);
      }
      cinema = await Cinema.create({
        title: "Starlight Grand Hall",
        map: { rows },
      });
      console.log("Created 'Starlight Grand Hall' cinema.");
    } else {
      console.log(`Using existing cinema: ${cinema.title}`);
    }

    // 3. Upsert Sample Movies (Repeatable & Safe)
    console.log("\nUpserting 8 sample movies...");
    const weekdays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    for (let i = 0; i < sampleMovies.length; i++) {
      const movieData = sampleMovies[i];
      const savedMovie = await Movie.findOneAndUpdate(
        { title: movieData.title },
        movieData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`  [OK] ${savedMovie.title} (${savedMovie.genres.join(", ")})`);

      // Ensure at least 2 scheduled screenings per movie
      const existingScreenings = await ScheduledScreening.find({
        movie: savedMovie._id,
      });

      if (existingScreenings.length === 0) {
        // Assign screenings across weekdays
        const day1 = weekdays[i % 7];
        const day2 = weekdays[(i + 3) % 7];

        await ScheduledScreening.create([
          {
            weekday: day1,
            time: "17:30",
            movie: savedMovie._id,
            cinema: cinema._id,
          },
          {
            weekday: day2,
            time: "20:45",
            movie: savedMovie._id,
            cinema: cinema._id,
          },
        ]);
        console.log(`    -> Added screenings for ${day1} 17:30 & ${day2} 20:45`);
      }
    }

    const totalMovies = await Movie.countDocuments();
    console.log(`\nSeed completed successfully! Total movies in collection: ${totalMovies}`);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
}

seed();
