export interface StoryPage {
  pageNumber: number;
  text: string;
  imagePrompt: string;
  sceneTheme: string;
  characterMood: string;
  illustrationIcon: string;
  interactiveTapHint: string;
  starPositions: Array<{ x: number; y: number; size: number }>;
}

export interface BedtimeStory {
  id: string;
  title: string;
  subtitle: string;
  durationMinutes: number;
  color: string;
  bgGradient: string;
  coverIcon: string;
  pages: StoryPage[];
}

export const BEDTIME_STORIES: BedtimeStory[] = [
  {
    id: 'bear-hug-moon',
    title: 'The Little Bear Who Hugged the Moon',
    subtitle: 'A quiet forest tale about warmth and cozy dreams',
    durationMinutes: 4,
    color: '#818CF8',
    bgGradient: 'from-indigo-950 via-slate-900 to-blue-950',
    coverIcon: '🐻',
    pages: [
      {
        pageNumber: 1,
        text: 'Deep in the whispering pine forest, Barnaby the little brown bear looked up at the night sky. The moon was shining like a giant scoop of golden honey.',
        imagePrompt: 'A tiny cute fluffy teddy bear sitting on a mossy hill looking up at a glowing warm moon',
        sceneTheme: 'dark-forest',
        characterMood: 'wonder',
        illustrationIcon: '🌲',
        interactiveTapHint: 'Tap the pine trees to make fireflies sparkle!',
        starPositions: [{ x: 15, y: 20, size: 12 }, { x: 75, y: 15, size: 18 }, { x: 88, y: 35, size: 10 }, { x: 45, y: 25, size: 14 }],
      },
      {
        pageNumber: 2,
        text: '"I want to give the moon a goodnight hug," whispered Barnaby softly. He reached his little fuzzy paws high above his head, standing on his tiptoes.',
        imagePrompt: 'Little bear stretching fuzzy arms toward a smiling crescent moon',
        sceneTheme: 'starry-hill',
        characterMood: 'reaching',
        illustrationIcon: '🐾',
        interactiveTapHint: 'Tap Barnaby’s paws to stretch higher!',
        starPositions: [{ x: 20, y: 30, size: 16 }, { x: 80, y: 22, size: 14 }, { x: 60, y: 10, size: 20 }],
      },
      {
        pageNumber: 3,
        text: 'A gentle silver cloud drifted by. "Hop on, little bear," the cloud hummed softly. The cloud was fluffy and smelled of sweet lavender flowers.',
        imagePrompt: 'Friendly smiling cloud scooping up the baby bear into the gentle night sky',
        sceneTheme: 'floating-cloud',
        characterMood: 'cozy',
        illustrationIcon: '☁️',
        interactiveTapHint: 'Tap the cloud to bounce Barnaby gently!',
        starPositions: [{ x: 25, y: 15, size: 12 }, { x: 70, y: 35, size: 16 }, { x: 35, y: 45, size: 14 }],
      },
      {
        pageNumber: 4,
        text: 'The moon smiled warmly. "I have a hug for you too, Barnaby," the moon beamed. A blanket of soft moonlight wrapped around Barnaby like the coziest quilt.',
        imagePrompt: 'Baby bear cuddled inside a glowing halo of moonlight with closed happy eyes',
        sceneTheme: 'moonlit-glow',
        characterMood: 'peaceful',
        illustrationIcon: '🌙',
        interactiveTapHint: 'Tap the moon to wrap cozy golden sparkles!',
        starPositions: [{ x: 10, y: 25, size: 20 }, { x: 85, y: 18, size: 15 }, { x: 50, y: 30, size: 14 }],
      },
      {
        pageNumber: 5,
        text: 'Barnaby curled up on his cloud pillow, yawned a big sleepy bear yawn, and closed his eyes. "Goodnight stars, goodnight moon, sweet dreams everyone."',
        imagePrompt: 'Baby bear sleeping peacefully in his cozy den under starry sky with plush blanket',
        sceneTheme: 'deep-sleep',
        characterMood: 'sleeping',
        illustrationIcon: '💤',
        interactiveTapHint: 'Tap the screen to whisper "Sweet dreams, Barnaby"',
        starPositions: [{ x: 30, y: 20, size: 10 }, { x: 65, y: 15, size: 12 }, { x: 82, y: 28, size: 14 }, { x: 18, y: 40, size: 16 }],
      },
    ],
  },
  {
    id: 'sleepy-bunny',
    title: 'Sleepy Bunny’s Starry Journey',
    subtitle: 'Following the dandelion lanterns to the Land of Sweet Slumber',
    durationMinutes: 3,
    color: '#F472B6',
    bgGradient: 'from-purple-950 via-pink-950 to-slate-900',
    coverIcon: '🐰',
    pages: [
      {
        pageNumber: 1,
        text: 'Pip the little white bunny had hopped through clover fields all day long. Now, the clover flowers were folding their petals to go to sleep.',
        imagePrompt: 'Cute bunny sitting in evening meadow with glowing dandelion puff seeds',
        sceneTheme: 'clover-field',
        characterMood: 'tired',
        illustrationIcon: '🍀',
        interactiveTapHint: 'Tap the clover flowers to tuck them into bed!',
        starPositions: [{ x: 15, y: 15, size: 14 }, { x: 70, y: 20, size: 18 }, { x: 85, y: 30, size: 12 }],
      },
      {
        pageNumber: 2,
        text: 'Pip let out a tiny soft bunny yawn. A dandelion puff whispered, "Follow my glowing seeds, Pip. They will guide your paws home."',
        imagePrompt: 'Glowing dandelion seeds floating like fairy lanterns in twilight',
        sceneTheme: 'twilight-path',
        characterMood: 'curious',
        illustrationIcon: '🌾',
        interactiveTapHint: 'Tap the glowing dandelion seeds to watch them float!',
        starPositions: [{ x: 25, y: 25, size: 16 }, { x: 50, y: 12, size: 14 }, { x: 80, y: 40, size: 10 }],
      },
      {
        pageNumber: 3,
        text: 'Inside the warm burrow under the oak tree, Mama Bunny had fluffed a bed of moss, rose petals, and warm cotton grass.',
        imagePrompt: 'Cozy underground bunny burrow with miniature lanterns and quilt bed',
        sceneTheme: 'burrow-home',
        characterMood: 'comfort',
        illustrationIcon: '🛏️',
        interactiveTapHint: 'Tap the soft quilt to tuck Pip in!',
        starPositions: [{ x: 40, y: 10, size: 10 }, { x: 60, y: 15, size: 12 }],
      },
      {
        pageNumber: 4,
        text: 'Mama Bunny gently kissed Pip between his floppy ears. "Sleep deep, my little explorer. Tomorrow is full of new sunny hops."',
        imagePrompt: 'Mama bunny kissing sleeping baby bunny goodnight under warm starlight',
        sceneTheme: 'dreamland',
        characterMood: 'bliss',
        illustrationIcon: '✨',
        interactiveTapHint: 'Tap Pip’s ears to give him a gentle goodnight pat!',
        starPositions: [{ x: 20, y: 20, size: 12 }, { x: 75, y: 25, size: 18 }, { x: 90, y: 10, size: 14 }],
      },
    ],
  },
  {
    id: 'turtle-cloud-pillow',
    title: 'The Gentle Turtle and the Cloud Pillow',
    subtitle: 'A calm bedtime story about moving slowly and resting deeply',
    durationMinutes: 4,
    color: '#34D399',
    bgGradient: 'from-emerald-950 via-teal-950 to-slate-900',
    coverIcon: '🐢',
    pages: [
      {
        pageNumber: 1,
        text: 'Toby the green turtle never rushed. He walked slowly through the tranquil riverbank, listening to the crickets playing their evening violin songs.',
        imagePrompt: 'Gentle green turtle smiling next to peaceful stream with evening water lilies',
        sceneTheme: 'riverbank',
        characterMood: 'peaceful',
        illustrationIcon: '🌿',
        interactiveTapHint: 'Tap the friendly crickets to hear their gentle chirp!',
        starPositions: [{ x: 20, y: 15, size: 14 }, { x: 80, y: 20, size: 16 }],
      },
      {
        pageNumber: 2,
        text: 'The evening breeze carried a soft puff of mist from the waterfall. It gathered around Toby like a plush velvet cushion.',
        imagePrompt: 'Turtle resting on soft white cloud cushion beside water lilies',
        sceneTheme: 'waterfall-mist',
        characterMood: 'relaxing',
        illustrationIcon: '💧',
        interactiveTapHint: 'Tap the water lilies to watch them glow softly!',
        starPositions: [{ x: 30, y: 25, size: 12 }, { x: 70, y: 15, size: 15 }],
      },
      {
        pageNumber: 3,
        text: 'Toby pulled his head and legs slowly inside his smooth patterned shell. Inside, it was warm, dark, and perfectly quiet.',
        imagePrompt: 'Glowing cozy turtle shell resting among starry reeds and gentle lotus flowers',
        sceneTheme: 'quiet-shell',
        characterMood: 'safe',
        illustrationIcon: '🐚',
        interactiveTapHint: 'Tap Toby’s shell to see a warm golden glow!',
        starPositions: [{ x: 15, y: 30, size: 16 }, { x: 85, y: 15, size: 18 }, { x: 50, y: 20, size: 12 }],
      },
      {
        pageNumber: 4,
        text: 'One slow breath in... and one slow breath out. Toby closed his eyes and dreamed of swimming under friendly constellations.',
        imagePrompt: 'Turtle dreaming of gliding through a galaxy of peaceful sea stars',
        sceneTheme: 'starry-sea',
        characterMood: 'deep-sleep',
        illustrationIcon: '🌌',
        interactiveTapHint: 'Breathe in and out together with Toby!',
        starPositions: [{ x: 10, y: 20, size: 20 }, { x: 45, y: 15, size: 16 }, { x: 90, y: 25, size: 18 }],
      },
    ],
  },
  {
    id: 'wanda-whale-lullaby',
    title: 'Wanda the Whale’s Ocean Lullaby',
    subtitle: 'Drifting on gentle waves into a world of sparkling dreams',
    durationMinutes: 4,
    color: '#38BDF8',
    bgGradient: 'from-sky-950 via-cyan-950 to-blue-950',
    coverIcon: '🐳',
    pages: [
      {
        pageNumber: 1,
        text: 'In the calm, sapphire ocean, Wanda the baby blue whale floated under the moonlight. The ripples rocked her back and forth like a giant sea cradle.',
        imagePrompt: 'Cute baby blue whale floating near water surface with reflected moonlight',
        sceneTheme: 'calm-ocean',
        characterMood: 'serene',
        illustrationIcon: '🌊',
        interactiveTapHint: 'Tap the gentle ripples to make them rock Wanda!',
        starPositions: [{ x: 20, y: 15, size: 16 }, { x: 80, y: 10, size: 14 }, { x: 50, y: 25, size: 12 }],
      },
      {
        pageNumber: 2,
        text: 'Wanda hummed a deep, soothing whale song. Small glowing fish gathered around her, swimming in slow lazy circles of bioluminescent light.',
        imagePrompt: 'Baby whale surrounded by glowing friendly lantern fish and sea turtles',
        sceneTheme: 'glowing-depths',
        characterMood: 'musical',
        illustrationIcon: '🐠',
        interactiveTapHint: 'Tap the glowing fish to make them swirl softly!',
        starPositions: [{ x: 15, y: 20, size: 12 }, { x: 75, y: 35, size: 15 }],
      },
      {
        pageNumber: 3,
        text: 'She blew a tiny spray of water from her blowhole, and the droplets caught the starlight, falling down like sparkling diamonds.',
        imagePrompt: 'Baby whale blowhole shooting starry water fountain into the night sky',
        sceneTheme: 'starlight-spray',
        characterMood: 'magical',
        illustrationIcon: '💎',
        interactiveTapHint: 'Tap Wanda’s spout to make starry sparkles spray!',
        starPositions: [{ x: 25, y: 10, size: 18 }, { x: 65, y: 15, size: 14 }, { x: 85, y: 25, size: 20 }],
      },
      {
        pageNumber: 4,
        text: 'Resting safely beside Mama Whale, Wanda rested her chin on the soft blue current. The ocean whispered: "Rest now, little one, you are safe and loved."',
        imagePrompt: 'Baby whale sleeping snuggled close against mama whale in tranquil deep ocean',
        sceneTheme: 'safe-cuddle',
        characterMood: 'safe',
        illustrationIcon: '💙',
        interactiveTapHint: 'Tap to send Wanda a cozy bubble hug!',
        starPositions: [{ x: 15, y: 15, size: 14 }, { x: 50, y: 10, size: 16 }, { x: 85, y: 20, size: 12 }],
      },
    ],
  },
];
