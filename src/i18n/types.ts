
export type Language = 'ru' | 'en';

export type TranslationsType = {
  [key: string]: string;
};

export type Translations = {
  [key in Language]: TranslationsType;
};

export type TranslationKey = 
  | string 
  | 'app.name'
  | 'header.title'
  | 'header.phase'
  | 'header.prestigePoints'
  | 'resources.title'
  | 'resources.knowledge'
  | 'resources.usdt'
  | 'resources.electricity'
  | 'resources.computingPower'
  | 'resources.bitcoin'
  | 'resources.perSecond'
  | 'actions.learnCrypto'
  | 'actions.applyKnowledge'
  | 'actions.exchangeBitcoin'
  | 'tabs.equipment'
  | 'tabs.research'
  | 'tabs.specialization'
  | 'tabs.referrals'
  | 'tutorial.title'
  | 'tutorial.basics'
  | 'tutorial.resources'
  | 'tutorial.buildings'
  | 'tutorial.basics.intro'
  | 'tutorial.basics.title'
  | 'tutorial.resources.title'
  | 'tutorial.resources.knowledge'
  | 'tutorial.resources.usdt'
  | 'tutorial.resources.electricity'
  | 'tutorial.resources.computingPower'
  | 'tutorial.resources.reputation'
  | 'tutorial.buildings.title'
  | 'tutorial.buildings.practice'
  | 'tutorial.buildings.generator'
  | 'tutorial.buildings.homeComputer'
  | 'tutorial.buildings.cryptoWallet'
  | 'tutorial.buildings.internetChannel'
  | 'settings.title'
  | 'settings.resetProgress'
  | 'settings.gameOptions'
  | 'settings.resetConfirm.title'
  | 'settings.resetConfirm.description'
  | 'settings.resetConfirm.cancel'
  | 'settings.resetConfirm.confirm'
  | 'settings.language'
  | 'settings.about'
  | 'settings.version'
  | 'settings.russian'
  | 'settings.english'
  | 'buildings.practice'
  | 'buildings.generator'
  | 'buildings.homeComputer'
  | 'buildings.cryptoWallet'
  | 'buildings.internetChannel';
