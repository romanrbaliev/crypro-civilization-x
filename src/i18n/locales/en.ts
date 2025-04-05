
/**
 * English language translations
 */
export const en = {
  // User interface elements
  ui: {
    settings: "Settings",
    language: "Language",
    russian: "Russian",
    english: "English",
    resetProgress: "Reset Progress",
    resetConfirmation: "Are you sure you want to reset all progress?",
    cancel: "Cancel",
    confirm: "Confirm",
    howToPlay: "How to Play",
    guide: "Guide",
    version: "Version",
    resetSuccess: "Reset successful",
    resetSuccessDetail: "All saves have been deleted. The page will be reloaded.",
    resetError: "Reset error",
    resetErrorDetail: "Failed to delete game saves.",
  },
  
  // Game tabs
  tabs: {
    equipment: "Equipment",
    research: "Research",
    specialization: "Specialization",
    referrals: "Referrals",
    trading: "Trading",
  },
  
  // Tutorial sections
  tutorial: {
    basics: "Basics",
    resources: "Resources",
    buildings: "Equipment",
    title: "How to play Crypto Civilization",
    description: "Guide to the main game mechanics",
    startGame: "Game Start",
    startGameSteps: "1. Start by learning the basics of cryptocurrency by clicking the \"Learn Crypto\" button.\n2. When you accumulate enough knowledge, you can apply it to get USDT.\n3. Use USDT to purchase equipment that will automatically generate resources.\n4. Gradually unlock new mechanics and features as you progress.",
    resourcesTitle: "Main Resources",
    resourcesList: {
      knowledge: "Crypto Knowledge - basic resource for research and exchange for USDT.",
      usdt: "USDT - main currency for buying equipment and upgrades.",
      electricity: "Electricity - necessary for computers and mining farms.",
      computingPower: "Computing Power - used for mining and data analysis.",
      reputation: "Reputation - affects the efficiency of social interactions."
    },
    equipmentTitle: "Equipment Types",
    equipmentList: {
      practice: "Practice - automatically generates cryptocurrency knowledge.",
      generator: "Generator - produces electricity for your devices.",
      homeComputer: "Home Computer - provides computing power.",
      cryptoWallet: "Crypto Wallet - increases maximum USDT storage.",
      internetChannel: "Internet Channel - accelerates knowledge acquisition."
    }
  },
  
  // Button actions
  actions: {
    learnCrypto: "Learn Crypto",
    applyKnowledge: "Apply Knowledge",
    exchangeBTC: "Exchange BTC",
    checkUnlocks: "Check Unlocks",
  },
  
  // Research items
  research: {
    availableResearch: "Available Research",
    completedResearch: "Completed Research",
    researchUnavailable: "Research is not available yet.",
    researchUnavailableDetail: "Continue to develop to unlock new technologies.",
    noAvailableResearch: "No available research.",
    noAvailableResearchDetail: "Continue to develop to unlock new technologies.",
  },
  
  // Resources names
  resources: {
    knowledge: "Crypto Knowledge",
    usdt: "USDT",
    electricity: "Electricity",
    bitcoin: "Bitcoin",
    computingPower: "Computing Power",
    reputation: "Reputation",
  },
  
  // Buildings / Equipment
  buildings: {
    practice: {
      name: "Practice",
      description: "Systematic studying of cryptocurrency basics",
      effects: [
        "Produces +1 knowledge/sec"
      ]
    },
    generator: {
      name: "Generator",
      description: "Provides electricity for your equipment",
      effects: [
        "Produces +0.5 electricity/sec"
      ]
    },
    homeComputer: {
      name: "Home Computer",
      description: "Basic equipment for crypto operations",
      effects: [
        "Produces +2 computing power/sec",
        "Consumes 1 electricity/sec"
      ]
    },
    cryptoWallet: {
      name: "Crypto Wallet",
      description: "Secure storage for your cryptocurrency",
      effects: [
        "+50 to max USDT",
        "+25% to max knowledge"
      ]
    },
    internetChannel: {
      name: "Internet Channel",
      description: "Faster connection for better operations",
      effects: [
        "+20% to knowledge acquisition rate",
        "+5% to computing power production"
      ]
    },
    miner: {
      name: "Miner",
      description: "Specialized equipment for Bitcoin mining",
      effects: [
        "Produces +0.00005 BTC/sec",
        "Consumes 1 electricity/sec",
        "Consumes 5 computing power/sec"
      ]
    },
    coolingSystem: {
      name: "Cooling System",
      description: "Improves efficiency of computing equipment",
      effects: [
        "-20% to computing power consumption"
      ]
    },
    enhancedWallet: {
      name: "Enhanced Wallet",
      description: "Advanced storage with improved security",
      effects: [
        "+150 to max USDT",
        "+1 to max BTC",
        "+8% to BTC to USDT conversion"
      ]
    },
    cryptoLibrary: {
      name: "Crypto Library",
      description: "Extensive collection of cryptocurrency knowledge",
      effects: [
        "+50% to knowledge acquisition rate",
        "+100 to max knowledge"
      ]
    }
  },
  
  // Upgrades / Research
  upgrades: {
    blockchainBasics: {
      name: "Blockchain Basics",
      description: "Introduction to blockchain technology fundamentals",
      effects: [
        "+50% to max knowledge storage",
        "+10% to knowledge production rate"
      ]
    },
    cryptoWalletSecurity: {
      name: "Crypto Wallet Security",
      description: "Advanced security measures for cryptocurrency storage",
      effects: [
        "+25% to max USDT"
      ]
    },
    cryptoBasics: {
      name: "Cryptocurrency Basics",
      description: "Fundamental understanding of cryptocurrency economics",
      effects: [
        "+10% to knowledge application efficiency"
      ]
    },
    algorithmOptimization: {
      name: "Algorithm Optimization",
      description: "Improving mining efficiency through optimized algorithms",
      effects: [
        "+15% to mining efficiency"
      ]
    },
    proofOfWork: {
      name: "Proof of Work",
      description: "Understanding the fundamental consensus mechanism",
      effects: [
        "+25% to mining efficiency"
      ]
    },
    energyEfficientComponents: {
      name: "Energy Efficient Components",
      description: "Reduced energy consumption for all devices",
      effects: [
        "-10% to electricity consumption for all devices"
      ]
    },
    cryptoTrading: {
      name: "Cryptocurrency Trading",
      description: "Advanced techniques for cryptocurrency exchange",
      effects: [
        "Unlocks Trading section"
      ]
    },
    tradingBot: {
      name: "Trading Bot",
      description: "Automated trading based on predefined conditions",
      effects: [
        "Automatic BTC exchange under specified conditions"
      ]
    }
  },
  
  // Game events
  events: {
    knowledgeApplied: "All knowledge applied! USDT received",
    btcExchanged: "BTC exchanged for USDT at current rate",
    gameReset: "Game completely reset",
    purchaseSuccess: "{item} purchased successfully!",
    researchComplete: "Research '{name}' completed!",
    unlockNotification: "New feature unlocked: {feature}",
  }
};
