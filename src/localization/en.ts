
// English localization

// Localization structure
export const en = {
  // Resources
  resources: {
    knowledge: {
      name: "Knowledge",
      description: "Basic knowledge about cryptocurrencies and blockchain"
    },
    usdt: {
      name: "USDT",
      description: "Stablecoin pegged to US dollar"
    },
    btc: {
      name: "Bitcoin",
      description: "Main cryptocurrency mined through mining"
    },
    electricity: {
      name: "Electricity",
      description: "Used to power mining farms and computers"
    },
    computingPower: {
      name: "Computing Power",
      description: "Necessary for mining and data analysis"
    },
    reputation: {
      name: "Reputation",
      description: "Affects community trust and collaboration opportunities"
    },
    hashrate: {
      name: "Hashrate",
      description: "The speed of solving cryptographic tasks for mining"
    },
    subscribers: {
      name: "Subscribers",
      description: "Your followers in the crypto community"
    }
  },
  
  // Buildings
  buildings: {
    practice: {
      name: "Practice",
      description: "Automatic acquisition of cryptocurrency knowledge",
      effect: "Produces +1 knowledge/sec"
    },
    generator: {
      name: "Generator",
      description: "Energy source for mining and computing",
      effect: "Produces +0.5 electricity/sec"
    },
    homeComputer: {
      name: "Home Computer", 
      description: "Used to generate computing power",
      effect: "Produces +2 computing power/sec while consuming 1 electricity/sec"
    },
    cryptoWallet: {
      name: "Crypto Wallet",
      description: "Stores your cryptocurrency assets securely",
      effect1: "Max USDT +50",
      effect2: "Max knowledge +25"
    },
    miner: {
      name: "Miner",
      description: "Mines Bitcoin using computing power",
      effect: "Mines +0.00005 BTC/sec, consuming 1 electricity and 5 computing power"
    },
    internetChannel: {
      name: "Internet Channel",
      description: "Improves data exchange and speeds up knowledge acquisition",
      effect1: "Knowledge gain +20%",
      effect2: "Computing efficiency +5%"
    },
    coolingSystem: {
      name: "Cooling System",
      description: "Reduces energy consumption of computers and miners",
      effect: "Computing power consumption -20%"
    },
    enhancedWallet: {
      name: "Enhanced Wallet",
      description: "Advanced storage for cryptocurrency assets",
      effect1: "Max USDT +150",
      effect2: "Max BTC +1",
      effect3: "BTC exchange efficiency +8%"
    },
    cryptoLibrary: {
      name: "Crypto Library",
      description: "Repository of knowledge about cryptocurrencies and blockchain",
      effect1: "Knowledge gain +50%",
      effect2: "Max knowledge +100"
    }
  },
  
  // Research
  upgrades: {
    blockchainBasics: {
      name: "Blockchain Basics",
      description: "+50% to max knowledge storage, +10% to knowledge production speed"
    },
    walletSecurity: {
      name: "Wallet Security",
      description: "+25% to max USDT"
    },
    cryptoCurrencyBasics: {
      name: "Cryptocurrency Basics",
      description: "+10% to knowledge application efficiency (10 knowledge yields 1.1 USDT)"
    },
    proofOfWork: {
      name: "Proof of Work",
      description: "+25% to mining efficiency"
    },
    algorithmOptimization: {
      name: "Algorithm Optimization",
      description: "+15% to mining efficiency (produces 15% more BTC with the same resources)"
    },
    energyEfficientComponents: {
      name: "Energy Efficient Components",
      description: "-10% to electricity consumption by all devices"
    },
    cryptoTrading: {
      name: "Cryptocurrency Trading",
      description: "Enables exchange between different cryptocurrencies"
    },
    tradingBot: {
      name: "Trading Bot",
      description: "Automatic BTC exchange under set conditions"
    },
    cryptoCommunity: {
      name: "Crypto Community",
      description: "Foundation for social interaction in the cryptocurrency world"
    }
  },
  
  // Events
  events: {
    buildingPurchase: "Built: {0}",
    researchComplete: "Research completed: {0}",
    knowledgeApplied: "Knowledge applied: {0} knowledge exchanged for {1} USDT",
    resourceCapReached: "Resource maximum reached: {0}",
    newFeatureUnlocked: "New feature unlocked: {0}",
    buildingUnlocked: "New building unlocked: {0}",
    upgradeUnlocked: "New research unlocked: {0}"
  },
  
  // Interface
  ui: {
    tabs: {
      resources: "Resources",
      buildings: "Buildings",
      research: "Research",
      referrals: "Referrals"
    },
    actions: {
      learn: "Learn Crypto",
      applyKnowledge: "Apply Knowledge",
      buy: "Buy",
      sell: "Sell",
      research: "Research"
    },
    states: {
      empty: {
        buildings: "You don't have any available equipment yet.\nKeep accumulating knowledge and resources.",
        research: "Research is not available yet.\nContinue progressing to unlock new technologies."
      },
      sections: {
        availableResearch: "Available Research",
        completedResearch: "Completed Research",
        cost: "Cost:",
        produces: "Produces:",
        consumes: "Consumes:",
        effects: "Effects:"
      }
    },
    eventLog: {
      title: "Event Log",
      noEvents: "No events yet",
      eventCount: "{0} {1}"
    }
  },
  
  // Common text
  common: {
    perSecond: "/sec",
    loading: "Loading...",
    countForms: {
      events: ["event", "events"]
    }
  }
};

export default en;
