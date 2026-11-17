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

const tamilMovies = [
  {
    title: "Leo",
    originalTitle: "லியோ",
    subtitle: "Bloody Sweet",
    description:
      "Parthiban is a mild-mannered cafe owner and animal rescuer in Himachal Pradesh living peacefully with his wife and children. When his lethal combat skills are unexpectedly revealed during a violent cafe robbery, dangerous gangsters Antony and Harold Das arrive, insisting he is Leo Das, the thought-to-be-dead son of their feared crime cartel.",
    runtime: 164,
    is3D: false,
    startdate: new Date("2023-10-19"),
    release: {
      productionCountry: "IN",
      productionYear: 2023,
      ageRestriction: 16,
    },
    genres: ["Action", "Crime", "Thriller"],
    keywords: ["LCU", "gangster", "cartel", "family", "action", "himachal"],
    credits: {
      crew: {
        director: { name: "Lokesh Kanagaraj" },
        screenwriter: { name: "Lokesh Kanagaraj" },
      },
      cast: [
        {
          name: "Vijay",
          roleName: "Parthiban / Leo Das",
          img: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Vijay_at_the_Nadigar_Sangam_Protest.jpg",
        },
        {
          name: "Trisha Krishnan",
          roleName: "Sathya",
          img: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Trisha_Krishnan_at_61st_Filmfare_Awards_South.jpg",
        },
        {
          name: "Sanjay Dutt",
          roleName: "Antony Das",
          img: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Sanjay_Dutt_at_Star_Guild_Awards.jpg",
        },
        {
          name: "Arjun Sarja",
          roleName: "Harold Das",
          img: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Arjun_Sarja_at_61st_Filmfare_Awards_South.jpg",
        },
      ],
    },
    media: {
      images: {
        poster:
          "https://upload.wikimedia.org/wikipedia/en/7/75/Leo_%282023_Indian_film%29.jpg",
      },
      videos: {
        trailer: {
          key: "Po3jStA673E",
          name: "Leo Official Trailer",
          site: "YouTube",
        },
      },
    },
  },
  {
    title: "Jailer",
    originalTitle: "ஜெயிலர்",
    subtitle: "Hukum - Tiger Ka Hukum",
    description:
      "'Tiger' Muthuvel Pandian, a retired prison superintendent leading a quiet, disciplined family life, re-enters the underworld when his honest ACP son goes missing while tracking down an international smuggling ring trafficking stolen temple idols.",
    runtime: 168,
    is3D: false,
    startdate: new Date("2023-08-10"),
    release: {
      productionCountry: "IN",
      productionYear: 2023,
      ageRestriction: 16,
    },
    genres: ["Action", "Comedy", "Crime"],
    keywords: ["police", "smuggling", "family", "jailer", "revenge"],
    credits: {
      crew: {
        director: { name: "Nelson Dilipkumar" },
        screenwriter: { name: "Nelson Dilipkumar" },
      },
      cast: [
        {
          name: "Rajinikanth",
          roleName: "'Tiger' Muthuvel Pandian",
          img: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Rajinikanth_in_2024.jpg",
        },
        {
          name: "Vinayakan",
          roleName: "Varman",
          img: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Vinayakan_at_50th_IFFI_2019.jpg",
        },
        {
          name: "Ramya Krishnan",
          roleName: "Vijaya Pandian",
          img: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Ramya_Krishnan_at_the_54th_Filmfare_Awards_South.jpg",
        },
        {
          name: "Vasanth Ravi",
          roleName: "ACP Arjun Pandian",
          img: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Vasanth_Ravi_at_Taramani_Press_Meet.jpg",
        },
      ],
    },
    media: {
      images: {
        poster:
          "https://upload.wikimedia.org/wikipedia/en/c/cb/Jailer_2023_Tamil_film_poster.jpg",
      },
      videos: {
        trailer: {
          key: "xenOE1Tma0A",
          name: "Jailer Showcase",
          site: "YouTube",
        },
      },
    },
  },
  {
    title: "The Greatest of All Time",
    originalTitle: "தி கிரேட்டஸ்ட் ஆஃப் ஆல் டைம்",
    subtitle: "A Venkat Prabhu Hero",
    description:
      "Gandhi, a decorated field agent in the Special Anti-Terrorist Squad (SATS), retires following a tragic foreign mission that resulted in the presumed death of his young son. Years later, a resurfaced counter-terrorism operation in Thailand reveals that his son is alive and has been weaponized by a former rogue commander.",
    runtime: 179,
    is3D: false,
    startdate: new Date("2024-09-05"),
    release: {
      productionCountry: "IN",
      productionYear: 2024,
      ageRestriction: 12,
    },
    genres: ["Action", "Sci-Fi", "Thriller"],
    keywords: ["sats", "agent", "clone", "espionage", "father-son"],
    credits: {
      crew: {
        director: { name: "Venkat Prabhu" },
        screenwriter: { name: "Venkat Prabhu" },
      },
      cast: [
        {
          name: "Vijay",
          roleName: "MS Gandhi / Jeevan Gandhi",
          img: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Vijay_at_the_Nadigar_Sangam_Protest.jpg",
        },
        {
          name: "Prashanth",
          roleName: "Sunil Thiagarajan",
          img: "https://upload.wikimedia.org/wikipedia/commons/8/87/Prashanth_at_Saahasam_Audio_Launch.jpg",
        },
        {
          name: "Prabhu Deva",
          roleName: "Kalyan Sundaram",
          img: "https://upload.wikimedia.org/wikipedia/commons/5/52/Prabhu_Deva_at_the_60th_Britannia_Filmfare_Awards_South_2013.jpg",
        },
        {
          name: "Sneha",
          roleName: "Anuradha Gandhi",
          img: "https://upload.wikimedia.org/wikipedia/commons/7/77/Sneha_at_the_60th_Britannia_Filmfare_Awards_South_2013.jpg",
        },
      ],
    },
    media: {
      images: {
        poster:
          "https://upload.wikimedia.org/wikipedia/en/1/1e/The_Greatest_of_All_Time.jpg",
      },
      videos: {
        trailer: {
          key: "jxCI4d_7lVw",
          name: "The Greatest of All Time Official Trailer",
          site: "YouTube",
        },
      },
    },
  },
  {
    title: "Amaran",
    originalTitle: "அமரன்",
    subtitle: "Heroes Live Forever",
    description:
      "A biographical war action drama chronicling the life and valor of Major Mukund Varadarajan, an officer in the 44th Rashtriya Rifles battalion of the Indian Army who led anti-terror operations in Shopian, Jammu and Kashmir, and was posthumously awarded the Ashoka Chakra.",
    runtime: 169,
    is3D: false,
    startdate: new Date("2024-10-31"),
    release: {
      productionCountry: "IN",
      productionYear: 2024,
      ageRestriction: 12,
    },
    genres: ["Action", "Biography", "Drama", "War"],
    keywords: ["indian army", "biopic", "kashmir", "ashoka chakra", "patriotism"],
    credits: {
      crew: {
        director: { name: "Rajkumar Periasamy" },
        screenwriter: { name: "Rajkumar Periasamy" },
      },
      cast: [
        {
          name: "Sivakarthikeyan",
          roleName: "Major Mukund Varadarajan",
          img: "https://upload.wikimedia.org/wikipedia/commons/0/00/Sivakarthikeyan_at_the_Remo_Audio_Launch.jpg",
        },
        {
          name: "Sai Pallavi",
          roleName: "Indhu Rebecca Varghese",
          img: "https://upload.wikimedia.org/wikipedia/commons/9/91/Sai_Pallavi_at_63rd_Filmfare_Awards_South.jpg",
        },
        {
          name: "Bhuvan Arora",
          roleName: "Sepoy Vikram Singh",
          img: "https://upload.wikimedia.org/wikipedia/commons/d/de/Bhuvan_Arora_Farzi.jpg",
        },
        {
          name: "Rahul Bose",
          roleName: "Colonel Amit Singh Dahiya",
          img: "https://upload.wikimedia.org/wikipedia/commons/2/22/Rahul_Bose_at_the_screening_of_Poorna.jpg",
        },
      ],
    },
    media: {
      images: {
        poster:
          "https://upload.wikimedia.org/wikipedia/en/5/54/Amaran_2024_poster.jpg",
      },
      videos: {
        trailer: {
          key: "hylIXfZeB4c",
          name: "Amaran Official Trailer",
          site: "YouTube",
        },
      },
    },
  },
  {
    title: "Vettaiyan",
    originalTitle: "வேட்டையன்",
    subtitle: "The Hunter",
    description:
      "SP Athiyan IPS, a celebrated senior police officer renowned for eliminating violent offenders through swift encounters, confronts a moral and legal crisis when an encounter in a sensitive government school case uncovers a nationwide education scam overseen by a corrupt corporate magnate.",
    runtime: 163,
    is3D: false,
    startdate: new Date("2024-10-10"),
    release: {
      productionCountry: "IN",
      productionYear: 2024,
      ageRestriction: 12,
    },
    genres: ["Action", "Drama", "Crime"],
    keywords: ["police", "encounter", "justice", "investigation", "human rights"],
    credits: {
      crew: {
        director: { name: "T. J. Gnanavel" },
        screenwriter: { name: "T. J. Gnanavel" },
      },
      cast: [
        {
          name: "Rajinikanth",
          roleName: "SP Athiyan IPS",
          img: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Rajinikanth_in_2024.jpg",
        },
        {
          name: "Amitabh Bachchan",
          roleName: "DGP Sathyadev Bramhadutt Sharma",
          img: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Amitabh_Bachchan_in_2015.jpg",
        },
        {
          name: "Fahadh Faasil",
          roleName: "Patrick / Battery",
          img: "https://upload.wikimedia.org/wikipedia/commons/8/87/Fahadh_Faasil_at_50th_IFFI_2019.jpg",
        },
        {
          name: "Rana Daggubati",
          roleName: "Natraj",
          img: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Rana_Daggubati_at_60th_Filmfare_Awards_South.jpg",
        },
      ],
    },
    media: {
      images: {
        poster:
          "https://upload.wikimedia.org/wikipedia/en/6/68/Vettaiyan_poster.jpg",
      },
      videos: {
        trailer: {
          key: "eP3kF1iUfGg",
          name: "Vettaiyan Official Prevue",
          site: "YouTube",
        },
      },
    },
  },
  {
    title: "Maharaja",
    originalTitle: "மகாராஜா",
    subtitle: "Revenge Has a New Address",
    description:
      "A quiet, solitary barber in Chennai arrives at a police station reporting that his metal dustbin named 'Lakshmi' has been stolen from his home. As indifferent police officers mock his insistence on finding the dustbin, a harrowing non-linear tale of calculated vengeance and justice comes to light.",
    runtime: 140,
    is3D: false,
    startdate: new Date("2024-06-14"),
    release: {
      productionCountry: "IN",
      productionYear: 2024,
      ageRestriction: 16,
    },
    genres: ["Action", "Crime", "Drama", "Thriller"],
    keywords: ["non-linear", "revenge", "police station", "barber", "father"],
    credits: {
      crew: {
        director: { name: "Nithilan Saminathan" },
        screenwriter: { name: "Nithilan Saminathan" },
      },
      cast: [
        {
          name: "Vijay Sethupathi",
          roleName: "Maharaja",
          img: "https://upload.wikimedia.org/wikipedia/commons/1/11/Vijay_Sethupathi_at_the_60th_Britannia_Filmfare_Awards_South_2013.jpg",
        },
        {
          name: "Anurag Kashyap",
          roleName: "Selvam",
          img: "https://upload.wikimedia.org/wikipedia/commons/8/85/Anurag_Kashyap_at_68th_Cannes_Film_Festival.jpg",
        },
        {
          name: "Mamta Mohandas",
          roleName: "Aasifa",
          img: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Mamta_Mohandas_at_60th_Filmfare_Awards_South.jpg",
        },
        {
          name: "Natarajan Subramaniam",
          roleName: "Inspector S. Varadhan",
          img: "https://upload.wikimedia.org/wikipedia/commons/2/23/Natty_Subramaniam_at_Sathuranga_Vettai_Press_Meet.jpg",
        },
      ],
    },
    media: {
      images: {
        poster:
          "https://upload.wikimedia.org/wikipedia/en/8/82/Maharaja_2024_film_poster.jpg",
      },
      videos: {
        trailer: {
          key: "r_0_q_Vj_0s",
          name: "Maharaja Official Trailer",
          site: "YouTube",
        },
      },
    },
  },
  {
    title: "Kanguva",
    originalTitle: "கங்குவா",
    subtitle: "A Mighty Valiant Saga",
    description:
      "A centuries-spanning fantasy adventure connecting a modern bounty hunter operating in Goa to Kanguva, a fearless tribal chieftain of ancient Perumachi who risked everything to protect an orphaned boy from the brutal invasion of the Arathi clan.",
    runtime: 154,
    is3D: true,
    startdate: new Date("2024-11-14"),
    release: {
      productionCountry: "IN",
      productionYear: 2024,
      ageRestriction: 12,
    },
    genres: ["Action", "Fantasy", "Period Drama"],
    keywords: ["reincarnation", "tribal warrior", "ancient island", "sword", "epic"],
    credits: {
      crew: {
        director: { name: "Siva" },
        screenwriter: { name: "Siva" },
      },
      cast: [
        {
          name: "Suriya",
          roleName: "Kanguva / Francis Theodore",
          img: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Suriya_at_60th_Filmfare_Awards_South.jpg",
        },
        {
          name: "Bobby Deol",
          roleName: "Udhiran",
          img: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Bobby_Deol_at_Star_Guild_Awards.jpg",
        },
        {
          name: "Disha Patani",
          roleName: "Angela",
          img: "https://upload.wikimedia.org/wikipedia/commons/4/42/Disha_Patani_at_GQ_Men_of_the_Year_Awards_2018.jpg",
        },
        {
          name: "Yogi Babu",
          roleName: "Colt 95",
          img: "https://upload.wikimedia.org/wikipedia/commons/8/86/Yogi_Babu_at_Pariyerum_Perumal_Press_Meet.jpg",
        },
      ],
    },
    media: {
      images: {
        poster:
          "https://upload.wikimedia.org/wikipedia/en/e/e8/Kanguva_poster.jpg",
      },
      videos: {
        trailer: {
          key: "ajnms4p9jG0",
          name: "Kanguva Official Trailer",
          site: "YouTube",
        },
      },
    },
  },
  {
    title: "Raayan",
    originalTitle: "ராயன்",
    subtitle: "Blood Is Thicker Than Water",
    description:
      "Kathavaraayan 'Raayan', a gentle fast-food cook who raised his two younger brothers and sister following parental desertion in North Chennai, finds his quiet life shattered when a territorial feud drags his family into a lethal war between two ruthless crime syndicates.",
    runtime: 145,
    is3D: false,
    startdate: new Date("2024-07-26"),
    release: {
      productionCountry: "IN",
      productionYear: 2024,
      ageRestriction: 18,
    },
    genres: ["Action", "Crime", "Drama"],
    keywords: ["north chennai", "gang war", "siblings", "revenge", "underworld"],
    credits: {
      crew: {
        director: { name: "Dhanush" },
        screenwriter: { name: "Dhanush" },
      },
      cast: [
        {
          name: "Dhanush",
          roleName: "Kathavaraayan 'Raayan'",
          img: "https://upload.wikimedia.org/wikipedia/commons/a/af/Dhanush_at_60th_Filmfare_Awards_South.jpg",
        },
        {
          name: "S. J. Suryah",
          roleName: "Sethuraman",
          img: "https://upload.wikimedia.org/wikipedia/commons/7/7b/SJ_Suryah_at_Spyder_Press_Meet.jpg",
        },
        {
          name: "Prakash Raj",
          roleName: "Commissioner Sargunam",
          img: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Prakash_Raj_at_60th_Filmfare_Awards_South.jpg",
        },
        {
          name: "Selvaraghavan",
          roleName: "Sekar",
          img: "https://upload.wikimedia.org/wikipedia/commons/9/91/Selvaraghavan_at_NGK_Audio_Launch.jpg",
        },
      ],
    },
    media: {
      images: {
        poster:
          "https://upload.wikimedia.org/wikipedia/en/e/e4/Raayan_poster.jpg",
      },
      videos: {
        trailer: {
          key: "qQJJkhhyMxs",
          name: "Raayan Official Trailer",
          site: "YouTube",
        },
      },
    },
  },
  {
    title: "Ponniyin Selvan: Part Two",
    originalTitle: "பொன்னியின் செல்வன் 2",
    subtitle: "The Chola Dynasty Epic",
    description:
      "Arunmozhi Varman survives drowning at sea and returns to Thanjavur amid escalating court conspiracies, while Queen Nandini orchestrates the assassination of Crown Prince Aditha Karikalan to exact revenge for the slaying of Pandya King Veerapandiyan.",
    runtime: 164,
    is3D: false,
    startdate: new Date("2023-04-28"),
    release: {
      productionCountry: "IN",
      productionYear: 2023,
      ageRestriction: 12,
    },
    genres: ["Action", "Adventure", "Drama", "History"],
    keywords: ["chola dynasty", "kalki", "historical fiction", "royal intrigue", "empire"],
    credits: {
      crew: {
        director: { name: "Mani Ratnam" },
        screenwriter: { name: "Mani Ratnam" },
      },
      cast: [
        {
          name: "Vikram",
          roleName: "Aditha Karikalan",
          img: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Chiyaan_Vikram_at_60th_Filmfare_Awards_South.jpg",
        },
        {
          name: "Aishwarya Rai Bachchan",
          roleName: "Nandini / Mandakini Devi",
          img: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Aishwarya_Rai_Cannes_2017.jpg",
        },
        {
          name: "Jayam Ravi",
          roleName: "Arunmozhi Varman (Ponniyin Selvan)",
          img: "https://upload.wikimedia.org/wikipedia/commons/0/07/Jayam_Ravi_at_60th_Filmfare_Awards_South.jpg",
        },
        {
          name: "Karthi",
          roleName: "Vallavaraiyan Vandiyadevan",
          img: "https://upload.wikimedia.org/wikipedia/commons/8/87/Karthi_at_60th_Filmfare_Awards_South.jpg",
        },
      ],
    },
    media: {
      images: {
        poster:
          "https://upload.wikimedia.org/wikipedia/en/5/5e/Ponniyin_Selvan_II.jpg",
      },
      videos: {
        trailer: {
          key: "mH_C07jHq8M",
          name: "PS-2 Official Trailer",
          site: "YouTube",
        },
      },
    },
  },
  {
    title: "Captain Miller",
    originalTitle: "கேப்டன் மில்லர்",
    subtitle: "Fear None, Conquer All",
    description:
      "In the 1930s during the British Raj, a disillusioned former British Indian Army soldier named Analeesan witnesses colonial atrocities against innocent villagers. Rebellious and driven by a thirst for freedom, he assumes the moniker Captain Miller to wage guerilla warfare against colonial oppressors.",
    runtime: 157,
    is3D: false,
    startdate: new Date("2024-01-12"),
    release: {
      productionCountry: "IN",
      productionYear: 2024,
      ageRestriction: 16,
    },
    genres: ["Action", "Adventure", "Period Drama"],
    keywords: ["british raj", "rebellion", "historical action", "freedom fighter", "outlaw"],
    credits: {
      crew: {
        director: { name: "Arun Matheswaran" },
        screenwriter: { name: "Arun Matheswaran" },
      },
      cast: [
        {
          name: "Dhanush",
          roleName: "Analeesan 'Eesa' / Captain Miller",
          img: "https://upload.wikimedia.org/wikipedia/commons/a/af/Dhanush_at_60th_Filmfare_Awards_South.jpg",
        },
        {
          name: "Shiva Rajkumar",
          roleName: "Sengolan",
          img: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Shiva_Rajkumar_at_60th_Filmfare_Awards_South.jpg",
        },
        {
          name: "Priyanka Arul Mohan",
          roleName: "Velmathi",
          img: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Priyanka_Arul_Mohan_at_Doctor_Pre-Release_Event.jpg",
        },
        {
          name: "Sundeep Kishan",
          roleName: "Captain Rafi",
          img: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Sundeep_Kishan_at_Venkatadri_Express_Audio_Launch.jpg",
        },
      ],
    },
    media: {
      images: {
        poster:
          "https://upload.wikimedia.org/wikipedia/en/1/1c/Captain_Miller_film_poster.jpg",
      },
      videos: {
        trailer: {
          key: "ujhW6TohxY8",
          name: "Captain Miller Official Trailer",
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
    console.error(
      "Please verify that your public IP address is whitelisted in MongoDB Atlas Network Access."
    );
    process.exit(1);
  }

  try {
    // 1. Ensure Default Seat Types
    console.log("\nEnsuring Seat Types exist...");
    let standardSeatType = await SeatType.findOne({ title: "Standard" });
    if (!standardSeatType) {
      standardSeatType = await SeatType.create({
        title: "Standard",
        price: 150,
        colorHEX: "#3b82f6",
      });
      console.log("Created 'Standard' seat type.");
    }

    let premiumSeatType = await SeatType.findOne({ title: "Premium" });
    if (!premiumSeatType) {
      premiumSeatType = await SeatType.create({
        title: "Premium",
        price: 220,
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
        title: "Mayajaal Multiplex Screen 1",
        map: { rows },
      });
      console.log("Created 'Mayajaal Multiplex Screen 1' cinema.");
    } else {
      console.log(`Using existing cinema: ${cinema.title}`);
    }

    // Clean up previously created fictional sample movies if present
    const fictionalTitles = [
      "Starlight Odyssey",
      "Shadows of the Citadel",
      "The Clockwork Detective",
      "Echoes of the Deep",
      "Neon Mirage",
      "Whispering Pines",
      "The Quantum Paradox",
      "Chronicles of the Wind",
    ];
    for (const fTitle of fictionalTitles) {
      const fMovie = await Movie.findOne({ title: fTitle });
      if (fMovie) {
        await ScheduledScreening.deleteMany({ movie: fMovie._id });
        await Movie.findByIdAndDelete(fMovie._id);
        console.log(`  Removed old sample movie: ${fTitle}`);
      }
    }

    // 3. Upsert 10 Tamil Movies (Repeatable & Safe)
    console.log("\nUpserting 10 latest Tamil movies...");
    const weekdays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    for (let i = 0; i < tamilMovies.length; i++) {
      const movieData = tamilMovies[i];
      const savedMovie = await Movie.findOneAndUpdate(
        { title: movieData.title },
        movieData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`  [OK] ${savedMovie.title} (${savedMovie.originalTitle}) - ${savedMovie.genres.join(", ")}`);

      // Ensure at least 2 scheduled screenings per movie
      const existingScreenings = await ScheduledScreening.find({
        movie: savedMovie._id,
      });

      if (existingScreenings.length === 0) {
        const day1 = weekdays[i % 7];
        const day2 = weekdays[(i + 3) % 7];

        await ScheduledScreening.create([
          {
            weekday: day1,
            time: "14:30",
            movie: savedMovie._id,
            cinema: cinema._id,
          },
          {
            weekday: day2,
            time: "18:45",
            movie: savedMovie._id,
            cinema: cinema._id,
          },
        ]);
        console.log(`    -> Added screenings for ${day1} 14:30 & ${day2} 18:45`);
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
