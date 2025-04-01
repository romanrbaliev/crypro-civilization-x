import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Building, Resource, Upgrade } from '@/context/types';
import BuildingCard from '@/components/BuildingCard';
import UpgradeCard from '@/components/UpgradeCard';
import ResourceDisplay from '@/components/ResourceDisplay';
import { initialPhase2Buildings } from '@/context/initialState';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { DataTableViewOptions } from "@/components/data-table-view-options"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuContent, NavigationMenuLink, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ProgressCircle } from '@/components/ProgressCircle';
import { SkeletonCard } from '@/components/SkeletonCard';
import { GameEventSystem } from '@/context/GameEventSystem';
import { NewsFeed } from '@/components/NewsFeed';
import { ReferralCode } from '@/components/ReferralCode';
import { ReferralList } from '@/components/ReferralList';
import { ReferralHelpers } from '@/components/ReferralHelpers';
import { ReferralRequests } from '@/components/ReferralRequests';
import { ReferralTab } from '@/components/ReferralsTab';
import { SpecializationTab } from '@/components/SpecializationTab';
import SynergyCard from '@/components/SynergyCard';
import { useGameState } from '@/context/GameStateContext';

const GameScreen: React.FC = () => {
  const { state, dispatch, forceUpdate } = useGame();
  const { toast } = useToast();
  const [showNews, setShowNews] = useState(false);
  const [showReferrals, setShowReferrals] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSpecialization, setShowSpecialization] = useState(false);
  const [showSynergies, setShowSynergies] = useState(false);
  const [showReferralTab, setShowReferralTab] = useState(false);
  const [showReferralRequests, setShowReferralRequests] = useState(false);
  const [showReferralHelpers, setShowReferralHelpers] = useState(false);
  const [showReferralCode, setShowReferralCode] = useState(false);
  const [showReferralList, setShowReferralList] = useState(false);
  const [showMiningParams, setShowMiningParams] = useState(false);
  const [showMiningPower, setShowMiningPower] = useState(false);
  const [showBtcExchange, setShowBtcExchange] = useState(false);
  const [showBtcBalance, setShowBtcBalance] = useState(false);
  const [showUsdtBalance, setShowUsdtBalance] = useState(false);
  const [showKnowledgeClicks, setShowKnowledgeClicks] = useState(false);
  const [showApplyKnowledge, setShowApplyKnowledge] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showCryptoWallet, setShowCryptoWallet] = useState(false);
  const [showHomeComputer, setShowHomeComputer] = useState(false);
  const [showInternetChannel, setShowInternetChannel] = useState(false);
  const [showMiner, setShowMiner] = useState(false);
  const [showCryptoLibrary, setShowCryptoLibrary] = useState(false);
  const [showCoolingSystem, setShowCoolingSystem] = useState(false);
  const [showEnhancedWallet, setShowEnhancedWallet] = useState(false);
  const [showBlockchainBasics, setShowBlockchainBasics] = useState(false);
  const [showWalletSecurity, setShowWalletSecurity] = useState(false);
  const [showCryptoCurrencyBasics, setShowCryptoCurrencyBasics] = useState(false);
  const [showAlgorithmOptimization, setShowAlgorithmOptimization] = useState(false);
  const [showProofOfWork, setShowProofOfWork] = useState(false);
  const [showEnergyEfficientComponents, setShowEnergyEfficientComponents] = useState(false);
  const [showCryptoTrading, setShowCryptoTrading] = useState(false);
  const [showTradingBot, setShowTradingBot] = useState(false);
  const [showMultiBuy, setShowMultiBuy] = useState(false);
  const [showForceUpdate, setShowForceUpdate] = useState(false);
  const [showResetGame, setShowResetGame] = useState(false);
  const [showMiningEfficiency, setShowMiningEfficiency] = useState(false);
  const [showEnergyEfficiency, setShowEnergyEfficiency] = useState(false);
  const [showNetworkDifficulty, setShowNetworkDifficulty] = useState(false);
  const [showExchangeRate, setShowExchangeRate] = useState(false);
  const [showExchangeCommission, setShowExchangeCommission] = useState(false);
  const [showVolatility, setShowVolatility] = useState(false);
  const [showExchangePeriod, setShowExchangePeriod] = useState(false);
  const [showBaseConsumption, setShowBaseConsumption] = useState(false);
  const [showKnowledge, setShowKnowledge] = useState(false);
  const [showComputingPower, setShowComputingPower] = useState(false);
  const [showElectricity, setShowElectricity] = useState(false);
  const [showBitcoin, setShowBitcoin] = useState(false);
  const [showTotalBuildings, setShowTotalBuildings] = useState(false);
  const [showApplyKnowledgeCounter, setShowApplyKnowledgeCounter] = useState(false);
  const [showComputingPowerConsumptionReduction, setShowComputingPowerConsumptionReduction] = useState(false);
  const [showKnowledgeEfficiencyBoost, setShowKnowledgeEfficiencyBoost] = useState(false);
  const [showKnowledgeMaxBoost, setShowKnowledgeMaxBoost] = useState(false);
  const [showUsdtMaxBoost, setShowUsdtMaxBoost] = useState(false);
  const [showMiningEfficiencyBoost, setShowMiningEfficiencyBoost] = useState(false);
  const [showEnergyEfficiencyBoost, setShowEnergyEfficiencyBoost] = useState(false);
  const [showComputingPowerBoost, setShowComputingPowerBoost] = useState(false);
  const [showKnowledgeBoost, setShowKnowledgeBoost] = useState(false);
  const [showUsdtMax, setShowUsdtMax] = useState(false);
  const [showBitcoinMax, setShowBitcoinMax] = useState(false);
  const [showBtcExchangeBonus, setShowBtcExchangeBonus] = useState(false);
  const [showUnlockTrading, setShowUnlockTrading] = useState(false);
  const [showAutoBtcExchange, setShowAutoBtcExchange] = useState(false);
  const [showKnowledgeClicksCounter, setShowKnowledgeClicksCounter] = useState(false);
  const [showTotalBuildingsCounter, setShowTotalBuildingsCounter] = useState(false);
  const [showApplyKnowledgeCounterValue, setShowApplyKnowledgeCounterValue] = useState(false);
  const [showComputingPowerConsumptionReductionValue, setShowComputingPowerConsumptionReductionValue] = useState(false);
  const [showKnowledgeEfficiencyBoostValue, setShowKnowledgeEfficiencyBoostValue] = useState(false);
  const [showKnowledgeMaxBoostValue, setShowKnowledgeMaxBoostValue] = useState(false);
  const [showUsdtMaxBoostValue, setShowUsdtMaxBoostValue] = useState(false);
  const [showMiningEfficiencyBoostValue, setShowMiningEfficiencyBoostValue] = useState(false);
  const [showEnergyEfficiencyBoostValue, setShowEnergyEfficiencyBoostValue] = useState(false);
  const [showComputingPowerBoostValue, setShowComputingPowerBoostValue] = useState(false);
  const [showKnowledgeBoostValue, setShowKnowledgeBoostValue] = useState(false);
  const [showUsdtMaxValue, setShowUsdtMaxValue] = useState(false);
  const [showBitcoinMaxValue, setShowBitcoinMaxValue] = useState(false);
  const [showBtcExchangeBonusValue, setShowBtcExchangeBonusValue] = useState(false);
  const [showUnlockTradingValue, setShowUnlockTradingValue] = useState(false);
  const [showAutoBtcExchangeValue, setShowAutoBtcExchangeValue] = useState(false);
  const [showKnowledgeClicksCounterValue, setShowKnowledgeClicksCounterValue] = useState(false);
  const [showTotalBuildingsCounterValue, setShowTotalBuildingsCounterValue] = useState(false);
  const [showApplyKnowledgeCounterUpdatedAt, setShowApplyKnowledgeCounterUpdatedAt] = useState(false);
  const [showKnowledgeClicksCounterUpdatedAt, setShowKnowledgeClicksCounterUpdatedAt] = useState(false);
  const [showTotalBuildingsCounterUpdatedAt, setShowTotalBuildingsCounterUpdatedAt] = useState(false);
  const [showComputingPowerConsumptionReductionUpgrade, setShowComputingPowerConsumptionReductionUpgrade] = useState(false);
  const [showKnowledgeEfficiencyBoostUpgrade, setShowKnowledgeEfficiencyBoostUpgrade] = useState(false);
  const [showKnowledgeMaxBoostUpgrade, setShowKnowledgeMaxBoostUpgrade] = useState(false);
  const [showUsdtMaxBoostUpgrade, setShowUsdtMaxBoostUpgrade] = useState(false);
  const [showMiningEfficiencyBoostUpgrade, setShowMiningEfficiencyBoostUpgrade] = useState(false);
  const [showEnergyEfficiencyBoostUpgrade, setShowEnergyEfficiencyBoostUpgrade] = useState(false);
  const [showComputingPowerBoostUpgrade, setShowComputingPowerBoostUpgrade] = useState(false);
  const [showKnowledgeBoostUpgrade, setShowKnowledgeBoostUpgrade] = useState(false);
  const [showUsdtMaxUpgrade, setShowUsdtMaxUpgrade] = useState(false);
  const [showBitcoinMaxUpgrade, setShowBitcoinMaxUpgrade] = useState(false);
  const [showBtcExchangeBonusUpgrade, setShowBtcExchangeBonusUpgrade] = useState(false);
  const [showUnlockTradingUpgrade, setShowUnlockTradingUpgrade] = useState(false);
  const [showAutoBtcExchangeUpgrade, setShowAutoBtcExchangeUpgrade] = useState(false);
  const [showComputingPowerConsumptionReductionBuilding, setShowComputingPowerConsumptionReductionBuilding] = useState(false);
  const [showKnowledgeEfficiencyBoostBuilding, setShowKnowledgeEfficiencyBoostBuilding] = useState(false);
  const [showKnowledgeMaxBoostBuilding, setShowKnowledgeMaxBoostBuilding] = useState(false);
  const [showUsdtMaxBoostBuilding, setShowUsdtMaxBoostBuilding] = useState(false);
  const [showMiningEfficiencyBoostBuilding, setShowMiningEfficiencyBoostBuilding] = useState(false);
  const [showEnergyEfficiencyBoostBuilding, setShowEnergyEfficiencyBoostBuilding] = useState(false);
  const [showComputingPowerBoostBuilding, setShowComputingPowerBoostBuilding] = useState(false);
  const [showKnowledgeBoostBuilding, setShowKnowledgeBoostBuilding] = useState(false);
  const [showUsdtMaxBuilding, setShowUsdtMaxBuilding] = useState(false);
  const [showBitcoinMaxBuilding, setShowBitcoinMaxBuilding] = useState(false);
  const [showBtcExchangeBonusBuilding, setShowBtcExchangeBonusBuilding] = useState(false);
  const [showUnlockTradingBuilding, setShowUnlockTradingBuilding] = useState(false);
  const [showAutoBtcExchangeBuilding, setShowAutoBtcExchangeBuilding] = useState(false);
  const [showComputingPowerConsumptionReductionSynergy, setShowComputingPowerConsumptionReductionSynergy] = useState(false);
  const [showKnowledgeEfficiencyBoostSynergy, setShowKnowledgeEfficiencyBoostSynergy] = useState(false);
  const [showKnowledgeMaxBoostSynergy, setShowKnowledgeMaxBoostSynergy] = useState(false);
  const [showUsdtMaxBoostSynergy, setShowUsdtMaxBoostSynergy] = useState(false);
  const [showMiningEfficiencyBoostSynergy, setShowMiningEfficiencyBoostSynergy] = useState(false);
  const [showEnergyEfficiencyBoostSynergy, setShowEnergyEfficiencyBoostSynergy] = useState(false);
  const [showComputingPowerBoostSynergy, setShowComputingPowerBoostSynergy] = useState(false);
  const [showKnowledgeBoostSynergy, setShowKnowledgeBoostSynergy] = useState(false);
  const [showUsdtMaxSynergy, setShowUsdtMaxSynergy] = useState(false);
  const [showBitcoinMaxSynergy, setShowBitcoinMaxSynergy] = useState(false);
  const [showBtcExchangeBonusSynergy, setShowBtcExchangeBonusSynergy] = useState(false);
  const [showUnlockTradingSynergy, setShowUnlockTradingSynergy] = useState(false);
  const [showAutoBtcExchangeSynergy, setShowAutoBtcExchangeSynergy] = useState(false);
  const [showComputingPowerConsumptionReductionSpecializationSynergy, setShowComputingPowerConsumptionReductionSpecializationSynergy] = useState(false);
  const [showKnowledgeEfficiencyBoostSpecializationSynergy, setShowKnowledgeEfficiencyBoostSpecializationSynergy] = useState(false);
  const [showKnowledgeMaxBoostSpecializationSynergy, setShowKnowledgeMaxBoostSpecializationSynergy] = useState(false);
  const [showUsdtMaxBoostSpecializationSynergy, setShowUsdtMaxBoostSpecializationSynergy] = useState(false);
  const [showMiningEfficiencyBoostSpecializationSynergy, setShowMiningEfficiencyBoostSpecializationSynergy] = useState(false);
  const [showEnergyEfficiencyBoostSpecializationSynergy, setShowEnergyEfficiencyBoostSpecializationSynergy] = useState(false);
  const [showComputingPowerBoostSpecializationSynergy, setShowComputingPowerBoostSpecializationSynergy] = useState(false);
  const [showKnowledgeBoostSpecializationSynergy, setShowKnowledgeBoostSpecializationSynergy] = useState(false);
  const [showUsdtMaxSpecializationSynergy, setShowUsdtMaxSpecializationSynergy] = useState(false);
  const [showBitcoinMaxSpecializationSynergy, setShowBitcoinMaxSpecializationSynergy] = useState(false);
  const [showBtcExchangeBonusSpecializationSynergy, setShowBtcExchangeBonusSpecializationSynergy] = useState(false);
  const [showUnlockTradingSpecializationSynergy, setShowUnlockTradingSpecializationSynergy] = useState(false);
  const [showAutoBtcExchangeSpecializationSynergy, setShowAutoBtcExchangeSpecializationSynergy] = useState(false);
  const [showComputingPowerConsumptionReductionValueBuilding, setShowComputingPowerConsumptionReductionValueBuilding] = useState(false);
  const [showKnowledgeEfficiencyBoostValueBuilding, setShowKnowledgeEfficiencyBoostValueBuilding] = useState(false);
  const [showKnowledgeMaxBoostValueBuilding, setShowKnowledgeMaxBoostValueBuilding] = useState(false);
  const [showUsdtMaxBoostValueBuilding, setShowUsdtMaxBoostValueBuilding] = useState(false);
  const [showMiningEfficiencyBoostValueBuilding, setShowMiningEfficiencyBoostValueBuilding] = useState(false);
  const [showEnergyEfficiencyBoostValueBuilding, setShowEnergyEfficiencyBoostValueBuilding] = useState(false);
  const [showComputingPowerBoostValueBuilding, setShowComputingPowerBoostValueBuilding] = useState(false);
  const [showKnowledgeBoostValueBuilding, setShowKnowledgeBoostValueBuilding] = useState(false);
  const [showUsdtMaxValueBuilding, setShowUsdtMaxValueBuilding] = useState(false);
  const [showBitcoinMaxValueBuilding, setShowBitcoinMaxValueBuilding] = useState(false);
  const [showBtcExchangeBonusValueBuilding, setShowBtcExchangeBonusValueBuilding] = useState(false);
  const [showUnlockTradingValueBuilding, setShowUnlockTradingValueBuilding] = useState(false);
  const [showAutoBtcExchangeValueBuilding, setShowAutoBtcExchangeValueBuilding] = useState(false);
  const [showComputingPowerConsumptionReductionValueUpgrade, setShowComputingPowerConsumptionReductionValueUpgrade] = useState(false);
  const [showKnowledgeEfficiencyBoostValueUpgrade, setShowKnowledgeEfficiencyBoostValueUpgrade] = useState(false);
  const [showKnowledgeMaxBoostValueUpgrade, setShowKnowledgeMaxBoostValueUpgrade] = useState(false);
  const [showUsdtMaxBoostValueUpgrade, setShowUsdtMaxBoostValueUpgrade] = useState(false);
  const [showMiningEfficiencyBoostValueUpgrade, setShowMiningEfficiencyBoostValueUpgrade] = useState(false);
  const [showEnergyEfficiencyBoostValueUpgrade, setShowEnergyEfficiencyBoostValueUpgrade] = useState(false);
  const [showComputingPowerBoostValueUpgrade, setShowComputingPowerBoostValueUpgrade] = useState(false);
  const [showKnowledgeBoostValueUpgrade, setShowKnowledgeBoostValueUpgrade] = useState(false);
  const [showUsdtMaxValueUpgrade, setShowUsdtMaxValueUpgrade] = useState(false);
  const [showBitcoinMaxValueUpgrade, setShowBitcoinMaxValueUpgrade] = useState(false);
  const [showBtcExchangeBonusValueUpgrade, setShowBtcExchangeBonusValueUpgrade] = useState(false);
  const [showUnlockTradingValueUpgrade, setShowUnlockTradingValueUpgrade] = useState(false);
  const [showAutoBtcExchangeValueUpgrade, setShowAutoBtcExchangeValueUpgrade] = useState(false);
  const [showComputingPowerConsumptionReductionValueSynergy, setShowComputingPowerConsumptionReductionValueSynergy] = useState(false);
  const [showKnowledgeEfficiencyBoostValueSynergy, setShowKnowledgeEfficiencyBoostValueSynergy] = useState(false);
  const [showKnowledgeMaxBoostValueSynergy, setShowKnowledgeMaxBoostValueSynergy] = useState(false);
  const [showUsdtMaxBoostValueSynergy, setShowUsdtMaxBoostValueSynergy] = useState(false);
  const [showMiningEfficiencyBoostValueSynergy, setShowMiningEfficiencyBoostValueSynergy] = useState(false);
  const [showEnergyEfficiencyBoostValueSynergy, setShowEnergyEfficiencyBoostValueSynergy] = useState(false);
  const [showComputingPowerBoostValueSynergy, setShowComputingPowerBoostValueSynergy] = useState(false);
  const [showKnowledgeBoostValueSynergy, setShowKnowledgeBoostValueSynergy] = useState(false);
  const [showUsdtMaxValueSynergy, setShowUsdtMaxValueSynergy] = useState(false);
  const [showBitcoinMaxValueSynergy, setShowBitcoinMaxValueSynergy] = useState(false);
  const [showBtcExchangeBonusValueSynergy, setShowBtcExchangeBonusValueSynergy] = useState(false);
  const [showUnlockTradingValueSynergy, setShowUnlockTradingValueSynergy] = useState(false);
  const [showAutoBtcExchangeValueSynergy, setShowAutoBtcExchangeValueSynergy] = useState(false);
  const [showComputingPowerConsumptionReductionValueSpecializationSynergy, setShowComputingPowerConsumptionReductionValueSpecializationSynergy] = useState(false);
  const [showKnowledgeEfficiencyBoostValueSpecializationSynergy, setShowKnowledgeEfficiencyBoostValueSpecializationSynergy] = useState(false);
  const [showKnowledgeMaxBoostValueSpecializationSynergy, setShowKnowledgeMaxBoostValueSpecializationSynergy] = useState(false);
  const [showUsdtMaxBoostValueSpecializationSynergy, setShowUsdtMaxBoostValueSpecializationSynergy] = useState(false);
  const [showMiningEfficiencyBoostValueSpecializationSynergy, setShowMiningEfficiencyBoostValueSpecializationSynergy] = useState(false);
  const [showEnergyEfficiencyBoostValueSpecializationSynergy, setShowEnergyEfficiencyBoostValueSpecializationSynergy] = useState(false);
  const [showComputingPowerBoostValueSpecializationSynergy, setShowComputingPowerBoostValueSpecializationSynergy] = useState(false);
  const [showKnowledgeBoostValueSpecializationSynergy, setShowKnowledgeBoostValueSpecializationSynergy] = useState(false);
  const [showUsdtMaxValueSpecializationSynergy, setShowUsdtMaxValueSpecializationSynergy] = useState(false);
  const [showBitcoinMaxValueSpecializationSynergy, setShowBitcoinMaxValueSpecializationSynergy] = useState(false);
  const [showBtcExchangeBonusValueSpecializationSynergy, setShowBtcExchangeBonusValueSpecializationSynergy] = useState(false);
  const [showUnlockTradingValueSpecializationSynergy, setShowUnlockTradingValueSpecializationSynergy] = useState(false);
  const [showAutoBtcExchangeValueSpecializationSynergy, setShowAutoBtcExchangeValueSpecializationSynergy] = useState(false);
  const [showComputingPowerConsumptionReductionBuildingValue, setShowComputingPowerConsumptionReductionBuildingValue] = useState(false);
  const [showKnowledgeEfficiencyBoostBuildingValue, setShowKnowledgeEfficiencyBoostBuildingValue] = useState(false);
  const [showKnowledgeMaxBoostBuildingValue, setShowKnowledgeMaxBoostBuildingValue] = useState(false);
  const [showUsdtMaxBoostBuildingValue, setShowUsdtMaxBoostBuildingValue] = useState(false);
  const [showMiningEfficiencyBoostBuildingValue, setShowMiningEfficiencyBoostBuildingValue] = useState(false);
  const [showEnergyEfficiencyBoostBuildingValue, setShowEnergyEfficiencyBoostBuildingValue] = useState(false);
  const [showComputingPowerBoostBuildingValue, setShowComputingPowerBoostBuildingValue] = useState(false);
  const [showKnowledgeBoostBuildingValue, setShowKnowledgeBoostBuildingValue] = useState(false);
  const [showUsdtBuildingValue, setShowUsdtBuildingValue] = useState(false);
  const [showBitcoinBuildingValue, setShowBitcoinBuildingValue] = useState(false);
  const [showBtcExchangeBonusBuildingValue, setShowBtcExchangeBonusBuildingValue] = useState(false);
  const [showUnlockTradingBuildingValue, setShowUnlockTradingBuildingValue] = useState(false);
  const [showAutoBtcExchangeBuildingValue, setShowAutoBtcExchangeBuildingValue] = useState(false);
  const [showComputingPowerConsumptionReductionUpgradeValue, setShowComputingPowerConsumptionReductionUpgradeValue] = useState(false);
  const [showKnowledgeEfficiencyBoostUpgradeValue, setShowKnowledgeEfficiencyBoostUpgradeValue] = useState(false);
  const [showKnowledgeMaxBoostUpgradeValue, setShowKnowledgeMaxBoostUpgradeValue] = useState(false);
  const [showUsdtMaxBoostUpgradeValue, setShowUsdtMaxBoostValueUpgrade] = useState(false);
  const [showMiningEfficiencyBoostUpgradeValue, setShowMiningEfficiencyBoostValueUpgrade] = useState(false);
  const [showEnergyEfficiencyBoostUpgradeValue, setShowEnergyEfficiencyBoostValueUpgrade] = useState(false);
  const [showComputingPowerBoostUpgradeValue, setShowComputingPowerBoostValueUpgrade] = useState(false);
  const [showKnowledgeBoostUpgradeValue, setShowKnowledgeBoostValueUpgrade] = useState(false);
  const [showUsdtUpgradeValue, setShowUsdtUpgradeValue] = useState(false);
  const [showBitcoinUpgradeValue, setShowBitcoinUpgradeValue] = useState(false);
  const [showBtcExchangeBonusUpgradeValue, setShowBtcExchangeBonusValueUpgrade] = useState(false);
  const [showUnlockTradingUpgradeValue, setShowUnlockTradingUpgradeValue] = useState(false);
  const [showAutoBtcExchangeUpgradeValue, setShowAutoBtcExchangeValueUpgrade] = useState(false);
  const [showComputingPowerConsumptionReductionSynergyValue, setShowComputingPowerConsumptionReductionSynergyValue] = useState(false);
  const [showKnowledgeEfficiencyBoostSynergyValue, setShowKnowledgeEfficiencyBoostSynergyValue] = useState(false);
  const [showKnowledgeMaxBoostSynergyValue, setShowKnowledgeMaxBoostSynergyValue] = useState(false);
  const [showUsdtMaxBoostSynergyValue, setShowUsdtMaxBoostValueSynergyValue] = useState(false);
  const [showMiningEfficiencyBoostSynergyValue, setShowMiningEfficiencyBoostSynergyValue] = useState(false);
  const [showEnergyEfficiencyBoostSynergyValue, setShowEnergyEfficiencyBoostSynergyValue] = useState(false);
  const [showComputingPowerBoostSynergyValue, setShowComputingPowerBoostSynergyValue] = useState(false);
  const [showKnowledgeBoostSynergyValue, setShowKnowledgeBoostSynergyValue] = useState(false);
  const [showUsdtSynergyValue, setShowUsdtSynergyValue] = useState(false);
  const [showBitcoinSynergyValue, setShowBitcoinSynergyValue] = useState(false);
  const [showBtcExchangeBonusSynergyValue, setShowBtcExchangeBonusSynergyValue] = useState(false);
  const [showUnlockTradingSynergyValue, setShowUnlockTradingSynergyValue] = useState(false);
  const [showAutoBtcExchangeSynergyValue, setShowAutoBtcExchangeSynergyValue] = useState(false);
  const [showComputingPowerConsumptionReductionSpecializationSynergyValue, setShowComputingPowerConsumptionReductionSpecializationSynergyValue] = useState(false);
  const [showKnowledgeEfficiencyBoostSpecializationSynergyValue, setShowKnowledgeEfficiencyBoostSpecializationSynergyValue] = useState(false);
  const [showKnowledgeMaxBoostSpecializationSynergyValue, setShowKnowledgeMaxBoostSpecializationSynergyValue] = useState(false);
  const [showUsdtMaxBoostSpecializationSynergyValue, setShowUsdtMaxBoostSpecializationSynergyValue] = useState(false);
  const [showMiningEfficiencyBoostSpecializationSynergyValue, setShowMiningEfficiencyBoostSpecializationSynergyValue] = useState(false);
  const [showEnergyEfficiencyBoostSpecializationSynergyValue, setShowEnergyEfficiencyBoostSpecializationSynergyValue] = useState(false);
  const [showComputingPowerBoostSpecializationSynergyValue, setShowComputingPowerBoostSpecializationSynergyValue] = useState(false);
  const [showKnowledgeBoostSpecializationSynergyValue, setShowKnowledgeBoostSpecializationSynergyValue] = useState(false);
  const [showUsdtSpecializationSynergyValue, setShowUsdtSpecializationSynergyValue] = useState(false);
  const [showBitcoinSpecializationSynergyValue, setShowBitcoinSpecializationSynergyValue] = useState(false);
  const [showBtcExchangeBonusSpecializationSynergyValue, setShowBtcExchangeBonusSpecializationSynergyValue] = useState(false);
  const [showUnlockTradingSpecializationSynergyValue, setShowUnlockTradingSpecializationSynergyValue] = useState(false);
  const [showAutoBtcExchangeSpecializationSynergyValue, setShowAutoBtcExchangeSpecializationSynergyValue] = useState(false);
  const [showPracticeBuilding, setShowPracticeBuilding] = useState(false);
  const [showGeneratorBuilding, setShowGeneratorBuilding] = useState(false);
  const [showCryptoWalletBuilding, setShowCryptoWalletBuilding] = useState(false);
  const [showHomeComputerBuilding, setShowHomeComputerBuilding] = useState(false);
  const [showInternetChannelBuilding, setShowInternetChannelBuilding] = useState(false);
  const [showMinerBuilding, setShowMinerBuilding] = useState(false);
  const [showCryptoLibraryBuilding, setShowCryptoLibraryBuilding] = useState(false);
  const [showCoolingSystemBuilding, setShowCoolingSystemBuilding] = useState(false);
  const [showEnhancedWalletBuilding, setShowEnhancedWalletBuilding] = useState(false);
  const [showBlockchainBasicsUpgrade, setShowBlockchainBasicsUpgrade] = useState(false);
  const [showWalletSecurityUpgrade, setShowWalletSecurityUpgrade] = useState(false);
  const [showCryptoCurrencyBasicsUpgrade, setShowCryptoCurrencyBasicsUpgrade] = useState(false);
  const [showAlgorithmOptimizationUpgrade, setShowAlgorithmOptimizationUpgrade] = useState(false);
  const [showProofOfWorkUpgrade, setShowProofOfWorkUpgrade] = useState(false);
  const [showEnergyEfficientComponentsUpgrade, setShowEnergyEfficientComponentsUpgrade] = useState(false);
  const [showCryptoTradingUpgrade, setShowCryptoTradingUpgrade] = useState(false);
  const [showTradingBotUpgrade, setShowTradingBotUpgrade] = useState(false);
  const [showBlockchainBasicsUpgradePurchased, setShowBlockchainBasicsUpgradePurchased] = useState(false);
  const [showWalletSecurityUpgradePurchased, setShowWalletSecurityUpgradePurchased] = useState(false);
  const [showCryptoCurrencyBasicsUpgradePurchased, setShowCryptoCurrencyBasicsUpgradePurchased] = useState(false);
  const [showAlgorithmOptimizationUpgradePurchased, setShowAlgorithmOptimizationUpgradePurchased] = useState(false);
  const [showProofOfWorkUpgradePurchased, setShowProofOfWorkUpgradePurchased] = useState(false);
  const [showEnergyEfficientComponentsUpgradePurchased, setShowEnergyEfficientComponentsUpgradePurchased] = useState(false);
  const [showCryptoTradingUpgradePurchased, setShowCryptoTradingUpgradePurchased] = useState(false);
  const [showTradingBotUpgradePurchased, setShowTradingBotUpgradePurchased] = useState(false);
  const [showBlockchainBasicsUpgradeUnlocked, setShowBlockchainBasicsUpgradeUnlocked] = useState(false);
  const [showWalletSecurityUpgradeUnlocked, setShowWalletSecurityUpgradeUnlocked] = useState(false);
  const [showCryptoCurrencyBasicsUpgradeUnlocked, setShowCryptoCurrencyBasicsUpgradeUnlocked] = useState(false);
  const [showAlgorithmOptimizationUpgradeUnlocked, setShowAlgorithmOptimizationUpgradeUnlocked] = useState(false);
  const [showProofOfWorkUpgradeUnlocked, setShowProofOfWorkUpgradeUnlocked] = useState(false);
  const [showEnergyEfficientComponentsUpgradeUnlocked, setShowEnergyEfficientComponentsUpgradeUnlocked] = useState(false);
  const [showCryptoTradingUpgradeUnlocked, setShowCryptoTradingUpgradeUnlocked] = useState(false);
  const [showTradingBotUpgradeUnlocked, setShowTradingBotUpgradeUnlocked] = useState(false);
  const [showPracticeBuildingCount, setShowPracticeBuildingCount] = useState(false);
  const [showGeneratorBuildingCount, setShowGeneratorBuildingCount] = useState(false);
  const [showCryptoWalletBuildingCount, setShowCryptoWalletBuildingCount] = useState(false);
  const [showHomeComputerBuildingCount, setShowHomeComputerBuildingCount] = useState(false);
  const [showInternetChannelBuildingCount, setShowInternetChannelBuildingCount] = useState(false);
  const [showMinerBuildingCount, setShowMinerBuildingCount] = useState(false);
  const [showCryptoLibraryBuildingCount, setShowCryptoLibraryBuildingCount] = useState(false);
  const [showCoolingSystemBuildingCount, setShowCoolingSystemBuildingCount] = useState(false);
  const [showEnhancedWalletBuildingCount, setShowEnhancedWalletBuildingCount] = useState(false);
  const [showPracticeBuildingUnlocked, setShowPracticeBuildingUnlocked] = useState(false);
  const [showGeneratorBuildingUnlocked, setShowGeneratorBuildingUnlocked] = useState(false);
  const [showCryptoWalletBuildingUnlocked, setShowCryptoWalletBuildingUnlocked] = useState(false);
  const [showHomeComputerBuildingUnlocked, setShowHomeComputerBuildingUnlocked] = useState(false);
  const [showInternetChannelBuildingUnlocked, setShowInternetChannelBuildingUnlocked] = useState(false);
  const [showMinerBuildingUnlocked, setShowMinerBuildingUnlocked] = useState(false);
  const [showCryptoLibraryBuildingUnlocked, setShowCryptoLibraryBuildingUnlocked] = useState(false);
  const [showCoolingSystemBuildingUnlocked, setShowCoolingSystemBuildingUnlocked] = useState(false);
  const [showEnhancedWalletBuildingUnlocked, setShowEnhancedWalletBuildingUnlocked] = useState(false);
  const [showPracticeBuildingCost, setShowPracticeBuildingCost] = useState(false);
  const [showGeneratorBuildingCost, setShowGeneratorBuildingCost] = useState(false);
  const [showCryptoWalletBuildingCost, setShowCryptoWalletBuildingCost] = useState(false);
  const [showHomeComputerBuildingCost, setShowHomeComputerBuildingCost] = useState(false);
  const [showInternetChannelBuildingCost, setShowInternetChannelBuildingCost] = useState(false);
  const [showMinerBuildingCost, setShowMinerBuildingCost] = useState(false);
  const [showCryptoLibraryBuildingCost, setShowCryptoLibraryBuildingCost] = useState(false);
  const [showCoolingSystemBuildingCost, setShowCoolingSystemBuildingCost] = useState(false);
  const [showEnhancedWalletBuildingCost, setShowEnhancedWalletBuildingCost] = useState(false);
  const [showBlockchainBasicsUpgradeCost, setShowBlockchainBasicsUpgradeCost] = useState(false);
  const [showWalletSecurityUpgradeCost, setShowWalletSecurityUpgradeCost] = useState(false);
  const [showCryptoCurrencyBasicsUpgradeCost, setShowCryptoCurrencyBasicsUpgradeCost] = useState(false);
  const [showAlgorithmOptimizationUpgradeCost, setShowAlgorithmOptimizationUpgradeCost] = useState(false);
  const [showProofOfWorkUpgradeCost, setShowProofOfWorkUpgradeCost] = useState(false);
  const [showEnergyEfficientComponentsUpgradeCost, setShowEnergyEfficientComponentsUpgradeCost] = useState(false);
  const [showCryptoTradingUpgradeCost, setShowCryptoTradingUpgradeCost] = useState(false);
  const [showTradingBotUpgradeCost, setShowTradingBotUpgradeCost] = useState(false);
  const [showPracticeBuildingProduction, setShowPracticeBuildingProduction] = useState(false);
  const [showGeneratorBuildingProduction, setShowGeneratorBuildingProduction] = useState(false);
  const [showCryptoWalletBuildingProduction, setShowCryptoWalletBuildingProduction] = useState(false);
  const [showHomeComputerBuildingProduction, setShowHomeComputerBuildingProduction] = useState(false);
  const [showInternetChannelBuildingProduction, setShowInternetChannelBuildingProduction] = useState(false);
  const [showMinerBuildingProduction, setShowMinerBuildingProduction] = useState(false);
  const [showCryptoLibraryBuildingProduction, setShowCryptoLibraryBuildingProduction] = useState(false);
  const [showCoolingSystemBuildingProduction, setShowCoolingSystemBuildingProduction] = useState(false);
  const [showEnhancedWalletBuildingProduction, setShowEnhancedWalletBuildingProduction] = useState(false);
  const [showPracticeBuildingConsumption, setShowPracticeBuildingConsumption] = useState(false);
  const [showGeneratorBuildingConsumption, setShowGeneratorBuildingConsumption] = useState(false);
  const [showCryptoWalletBuildingConsumption, setShowCryptoWalletBuildingConsumption] = useState(false
