import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Building, ReferralHelper } from '@/context/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from "@/hooks/use-toast";
import { Copy, CheckCircle, UserPlus, User, Loader2, XCircle, HelpCircle, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getUserIdentifier } from '@/api/gameDataService';
import { getReferralLink, getReferrals, activateReferral, createReferral, getReferralHelpers, respondToHelperRequest, hireReferralHelper } from '@/api/referral/referralService';
import { Referral } from '@/api/referral/referralTypes';
import { asBuilding } from '@/utils/typeGuards';

interface ReferralsTabProps {
  onAddEvent: (message: string, type: string) => void;
}

const ReferralsTab: React.FC<ReferralsTabProps> = ({ onAddEvent }) => {
  const { state, dispatch } = useGame();
  const [referralCode, setReferralCode] = useState<string | null>(state.referralCode);
  const [referralLink, setReferralLink] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLinkLoading, setIsLinkLoading] = useState(false);
  const [isReferralLoading, setIsReferralLoading] = useState(false);
  const [newReferralCode, setNewReferralCode] = useState('');
  const [isHelperActionLoading, setIsHelperActionLoading] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [helperBuilding, setHelperBuilding] = useState<string | null>(null);
  const [helperReferralId, setHelperReferralId] = useState<string | null>(null);
  const [isHelperModalOpen, setIsHelperModalOpen] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [isHiring, setIsHiring] = useState(false);
  const [isHelperRequestLoading, setIsHelperRequestLoading] = useState(false);
  const [isHelperListLoading, setIsHelperListLoading] = useState(false);
  const [isHelperHiringLoading, setIsHelperHiringLoading] = useState(false);
  const [isHelperRespondingLoading, setIsHelperRespondingLoading] = useState(false);
  const [isHelperActionSuccess, setIsHelperActionSuccess] = useState(false);
  const [helperActionMessage, setHelperActionMessage] = useState('');
  const [isHelperActionError, setIsHelperActionError] = useState(false);
  const [helperErrorMessage, setHelperErrorMessage] = useState('');
  const [isHelperRequestSuccess, setIsHelperRequestSuccess] = useState(false);
  const [helperRequestMessage, setHelperRequestMessage] = useState('');
  const [isHelperRequestError, setIsHelperRequestError] = useState(false);
  const [helperRequestErrorMessage, setHelperRequestErrorMessage] = useState('');
  const [isHelperHiringSuccess, setIsHelperHiringSuccess] = useState(false);
  const [helperHiringMessage, setHelperHiringMessage] = useState('');
  const [isHelperHiringError, setIsHelperHiringError] = useState(false);
  const [helperHiringErrorMessage, setHelperHiringErrorMessage] = useState('');
  const [isHelperRespondingSuccess, setIsHelperRespondingSuccess] = useState(false);
  const [helperRespondingMessage, setHelperRespondingMessage] = useState('');
  const [isHelperRespondingError, setIsHelperRespondingError] = useState(false);
  const [helperRespondingErrorMessage, setHelperRespondingErrorMessage] = useState('');
  const [isReferralActivated, setIsReferralActivated] = useState(false);
  const [referralActivationMessage, setReferralActivationMessage] = useState('');
  const [isReferralActivationError, setIsReferralActivationError] = useState(false);
  const [referralActivationErrorMessage, setReferralActivationErrorMessage] = useState('');
  const [isReferralCodeCopied, setIsReferralCodeCopied] = useState(false);
  const [isReferralLinkCopied, setIsReferralLinkCopied] = useState(false);
  const [isReferralCodeCreating, setIsReferralCodeCreating] = useState(false);
  const [isReferralCodeCreated, setIsReferralCodeCreated] = useState(false);
  const [referralCodeCreationMessage, setReferralCodeCreationMessage] = useState('');
  const [isReferralCodeCreationError, setIsReferralCodeCreationError] = useState(false);
  const [referralCodeCreationErrorMessage, setReferralCodeCreationErrorMessage] = useState('');
  const [isReferralCodeValidating, setIsReferralCodeValidating] = useState(false);
  const [isReferralCodeValidated, setIsReferralCodeValidated] = useState(false);
  const [referralCodeValidationMessage, setReferralCodeValidationMessage] = useState('');
  const [isReferralCodeValidationError, setIsReferralCodeValidationError] = useState(false);
  const [referralCodeValidationErrorMessage, setReferralCodeValidationErrorMessage] = useState('');
  const [isReferralCodeApplying, setIsReferralCodeApplying] = useState(false);
  const [isReferralCodeApplied, setIsReferralCodeApplied] = useState(false);
  const [referralCodeApplyingMessage, setReferralCodeApplyingMessage] = useState('');
  const [isReferralCodeApplyingError, setIsReferralCodeApplyingError] = useState(false);
  const [referralCodeApplyingErrorMessage, setReferralCodeApplyingErrorMessage] = useState('');
  const [isReferralListLoading, setIsReferralListLoading] = useState(false);
  const [isReferralListSuccess, setIsReferralListSuccess] = useState(false);
  const [referralListMessage, setReferralListMessage] = useState('');
  const [isReferralListError, setIsReferralListError] = useState(false);
  const [referralListErrorMessage, setReferralListErrorMessage] = useState('');
  const [isReferralLinkGenerating, setIsReferralLinkGenerating] = useState(false);
  const [isReferralLinkGenerated, setIsReferralLinkGenerated] = useState(false);
  const [referralLinkMessage, setReferralLinkMessage] = useState('');
  const [isReferralLinkError, setIsReferralLinkError] = useState(false);
  const [referralLinkErrorMessage, setReferralLinkErrorMessage] = useState('');
  const [isReferralHelperHired, setIsReferralHelperHired] = useState(false);
  const [referralHelperHiredMessage, setReferralHelperHiredMessage] = useState('');
  const [isReferralHelperHiredError, setIsReferralHelperHiredError] = useState(false);
  const [referralHelperHiredErrorMessage, setReferralHelperHiredErrorMessage] = useState('');
  const [isReferralHelperRequestAccepted, setIsReferralHelperRequestAccepted] = useState(false);
  const [referralHelperRequestAcceptedMessage, setReferralHelperRequestAcceptedMessage] = useState('');
  const [isReferralHelperRequestAcceptedError, setIsReferralHelperRequestAcceptedError] = useState(false);
  const [referralHelperRequestAcceptedErrorMessage, setReferralHelperRequestAcceptedErrorMessage] = useState('');
  const [isReferralHelperRequestRejected, setIsReferralHelperRequestRejected] = useState(false);
  const [referralHelperRequestRejectedMessage, setReferralHelperRequestRejectedMessage] = useState('');
  const [isReferralHelperRequestRejectedError, setIsReferralHelperRequestRejectedError] = useState(false);
  const [referralHelperRequestRejectedErrorMessage, setReferralHelperRequestRejectedErrorMessage] = useState('');
  const [isReferralHelperRequestLoading, setIsReferralHelperRequestLoading] = useState(false);
  const [referralHelperRequestLoadingMessage, setReferralHelperRequestLoadingMessage] = useState('');
  const [isReferralHelperRequestLoadingError, setIsReferralHelperRequestLoadingError] = useState(false);
  const [referralHelperRequestLoadingErrorMessage, setReferralHelperRequestLoadingErrorMessage] = useState('');
  const [isReferralHelperRequestSuccess, setIsReferralHelperRequestSuccess] = useState(false);
  const [referralHelperRequestSuccessMessage, setReferralHelperRequestSuccessMessage] = useState('');
  const [isReferralHelperRequestError, setIsReferralHelperRequestError] = useState(false);
  const [referralHelperRequestErrorMessage, setReferralHelperRequestErrorMessage] = useState('');
  const [isReferralHelperRequestAcceptedLoading, setIsReferralHelperRequestAcceptedLoading] = useState(false);
  const [referralHelperRequestAcceptedLoadingMessage, setReferralHelperRequestAcceptedLoadingMessage] = useState('');
  const [isReferralHelperRequestAcceptedLoadingError, setIsReferralHelperRequestAcceptedLoadingError] = useState(false);
  const [referralHelperRequestAcceptedLoadingErrorMessage, setReferralHelperRequestAcceptedLoadingErrorMessage] = useState('');
  const [isReferralHelperRequestAcceptedSuccess, setIsReferralHelperRequestAcceptedSuccess] = useState(false);
  const [referralHelperRequestAcceptedSuccessMessage, setReferralHelperRequestAcceptedSuccessMessage] = useState('');
  const [isReferralHelperRequestAcceptedError, setIsReferralHelperRequestAcceptedError] = useState(false);
  const [referralHelperRequestAcceptedErrorMessage, setReferralHelperRequestAcceptedErrorMessage] = useState('');
  const [isReferralHelperRequestRejectedLoading, setIsReferralHelperRequestRejectedLoading] = useState(false);
  const [referralHelperRequestRejectedLoadingMessage, setReferralHelperRequestRejectedLoadingMessage] = useState('');
  const [isReferralHelperRequestRejectedLoadingError, setIsReferralHelperRequestRejectedLoadingError] = useState(false);
  const [referralHelperRequestRejectedLoadingErrorMessage, setReferralHelperRequestRejectedLoadingErrorMessage] = useState('');
  const [isReferralHelperRequestRejectedSuccess, setIsReferralHelperRequestRejectedSuccess] = useState(false);
  const [referralHelperRequestRejectedSuccessMessage, setReferralHelperRequestRejectedSuccessMessage] = useState('');
  const [isReferralHelperRequestRejectedError, setIsReferralHelperRequestRejectedError] = useState(false);
  const [referralHelperRequestRejectedErrorMessage, setReferralHelperRequestRejectedErrorMessage] = useState('');
  const [isReferralHelperRequestHiredLoading, setIsReferralHelperRequestHiredLoading] = useState(false);
  const [referralHelperRequestHiredLoadingMessage, setReferralHelperRequestHiredLoadingMessage] = useState('');
  const [isReferralHelperRequestHiredLoadingError, setIsReferralHelperRequestHiredLoadingError] = useState(false);
  const [referralHelperRequestHiredLoadingErrorMessage, setReferralHelperRequestHiredLoadingErrorMessage] = useState('');
  const [isReferralHelperRequestHiredSuccess, setIsReferralHelperRequestHiredSuccess] = useState(false);
  const [referralHelperRequestHiredSuccessMessage, setReferralHelperRequestHiredSuccessMessage] = useState('');
  const [isReferralHelperRequestHiredError, setIsReferralHelperRequestHiredError] = useState(false);
  const [referralHelperRequestHiredErrorMessage, setReferralHelperRequestHiredErrorMessage] = useState('');
  const [isReferralHelperRequestHiredAcceptedLoading, setIsReferralHelperRequestHiredAcceptedLoading] = useState(false);
  const [referralHelperRequestHiredAcceptedLoadingMessage, setReferralHelperRequestHiredAcceptedLoadingMessage] = useState('');
  const [isReferralHelperRequestHiredAcceptedLoadingError, setIsReferralHelperRequestHiredAcceptedLoadingError] = useState(false);
  const [referralHelperRequestHiredAcceptedLoadingErrorMessage, setReferralHelperRequestHiredAcceptedLoadingErrorMessage] = useState('');
  const [isReferralHelperRequestHiredAcceptedSuccess, setIsReferralHelperRequestHiredAcceptedSuccess] = useState(false);
  const [referralHelperRequestHiredAcceptedSuccessMessage, setReferralHelperRequestHiredAcceptedSuccessMessage] = useState('');
  const [isReferralHelperRequestHiredAcceptedError, setIsReferralHelperRequestHiredAcceptedError] = useState(false);
  const [referralHelperRequestHiredAcceptedErrorMessage, setReferralHelperRequestHiredAcceptedErrorMessage] = useState('');
  const [isReferralHelperRequestHiredRejectedLoading, setIsReferralHelperRequestHiredRejectedLoading] = useState(false);
  const [referralHelperRequestHiredRejectedLoadingMessage, setReferralHelperRequestHiredRejectedLoadingMessage] = useState('');
  const [isReferralHelperRequestHiredRejectedLoadingError, setIsReferralHelperRequestHiredRejectedLoadingError] = useState(false);
  const [referralHelperRequestHiredRejectedLoadingErrorMessage, setReferralHelperRequestHiredRejectedLoadingErrorMessage] = useState('');
  const [isReferralHelperRequestHiredRejectedSuccess, setIsReferralHelperRequestHiredRejectedSuccess] = useState(false);
  const [referralHelperRequestHiredRejectedSuccessMessage, setReferralHelperRequestHiredRejectedSuccessMessage] = useState('');
  const [isReferralHelperRequestHiredRejectedError, setIsReferralHelperRequestHiredRejectedError] = useState(false);
  const [referralHelperRequestHiredRejectedErrorMessage, setReferralHelperRequestHiredRejectedErrorMessage] = useState('');
  const [isReferralHelperRequestHiredHiredLoading, setIsReferralHelperRequestHiredHiredLoading] = useState(false);
  const [referralHelperRequestHiredHiredLoadingMessage, setReferralHelperRequestHiredHiredLoadingMessage] = useState('');
  const [isReferralHelperRequestHiredHiredLoadingError, setIsReferralHelperRequestHiredHiredLoadingError] = useState(false);
  const [referralHelperRequestHiredHiredLoadingErrorMessage, setReferralHelperRequestHiredHiredLoadingErrorMessage] = useState('');
  const [isReferralHelperRequestHiredHiredSuccess, setIsReferralHelperRequestHiredHiredSuccess] = useState(false);
  const [referralHelperRequestHiredHiredSuccessMessage, setReferralHelperRequestHiredHiredSuccessMessage] = useState('');
  const [isReferralHelperRequestHiredHiredError, setIsReferralHelperRequestHiredHiredError] = useState(false);
  const [referralHelperRequestHiredHiredErrorMessage, setReferralHelperRequestHiredHiredErrorMessage] = useState('');
  const [isReferralHelperRequestHiredAcceptedLoadingMessageSet, setIsReferralHelperRequestHiredAcceptedLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestHiredRejectedLoadingMessageSet, setIsReferralHelperRequestHiredRejectedLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestHiredHiredLoadingMessageSet, setIsReferralHelperRequestHiredHiredLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingMessageSet, setIsReferralHelperRequestAcceptedLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingMessageSet, setIsReferralHelperRequestRejectedLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingMessageSet, setIsReferralHelperRequestHiredLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedSuccessMessageSet, setIsReferralHelperRequestAcceptedSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedSuccessMessageSet, setIsReferralHelperRequestRejectedSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestHiredSuccessMessageSet, setIsReferralHelperRequestHiredSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedErrorMessageSet, setIsReferralHelperRequestAcceptedErrorMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedErrorMessageSet, setIsReferralHelperRequestRejectedErrorMessageSet] = useState(false);
  const [isReferralHelperRequestHiredErrorMessageSet, setIsReferralHelperRequestHiredErrorMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingErrorMessageSet, setIsReferralHelperRequestAcceptedLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingErrorMessageSet, setIsReferralHelperRequestRejectedLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingErrorMessageSet, setIsReferralHelperRequestHiredLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingSuccessMessageSet, setIsReferralHelperRequestAcceptedLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingSuccessMessageSet, setIsReferralHelperRequestRejectedLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingSuccessMessageSet, setIsReferralHelperRequestHiredLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingMessageSet, setIsReferralHelperRequestAcceptedLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingMessageSet, setIsReferralHelperRequestRejectedLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingMessageSet, setIsReferralHelperRequestHiredLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingErrorMessageSet, setIsReferralHelperRequestAcceptedLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingErrorMessageSet, setIsReferralHelperRequestRejectedLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingErrorMessageSet, setIsReferralHelperRequestHiredLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingSuccessMessageSet, setIsReferralHelperRequestAcceptedLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingSuccessMessageSet, setIsReferralHelperRequestRejectedLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingSuccessMessageSet, setIsReferralHelperRequestHiredLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingMessageSet, setIsReferralHelperRequestAcceptedLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingMessageSet, setIsReferralHelperRequestRejectedLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingMessageSet, setIsReferralHelperRequestHiredLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingErrorMessageSet, setIsReferralHelperRequestAcceptedLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingErrorMessageSet, setIsReferralHelperRequestRejectedLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingErrorMessageSet, setIsReferralHelperRequestHiredLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingSuccessMessageSet, setIsReferralHelperRequestAcceptedLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingSuccessMessageSet, setIsReferralHelperRequestRejectedLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingSuccessMessageSet, setIsReferralHelperRequestHiredLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingMessageSet, setIsReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingMessageSet, setIsReferralHelperRequestRejectedLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingMessageSet, setIsReferralHelperRequestHiredLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingErrorMessageSet, setIsReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingErrorMessageSet, setIsReferralHelperRequestRejectedLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingErrorMessageSet, setIsReferralHelperRequestHiredLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingSuccessMessageSet, setIsReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingSuccessMessageSet, setIsReferralHelperRequestRejectedLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingSuccessMessageSet, setIsReferralHelperRequestHiredLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingMessageSet, setIsReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingMessageSet, setIsReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingMessageSet, setIsReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingErrorMessageSet, setIsReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingErrorMessageSet, setIsReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingErrorMessageSet, setIsReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingSuccessMessageSet, setIsReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingSuccessMessageSet, setIsReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingSuccessMessageSet, setIsReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingMessageSet, setIsReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingMessageSet, setIsReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingMessageSet, setIsReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet, setIsReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet, setIsReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet, setIsReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet, setIsReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet, setIsReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet, setIsReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet, setIsReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet, setIsReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet, setIsReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet, setIsReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet, setIsReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet, setIsReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet, setIsReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet, setIsReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet, setIsReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet, setIsReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet, setIsReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet, setIsReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet, setIsReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet, setIsReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet, setIsReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet, setIsReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet, setIsReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet, setIsReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet, setIsReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingErrorMessageSet] = useState(false);
  const [isReferralHelperRequestAcceptedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestRejectedLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);
  const [isReferralHelperRequestHiredLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingLoadingSuccessMessageSet] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getReferrals()
      .then(data => {
        setReferrals(data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить рефералов",
          variant: "destructive",
        });
      });

    if (!referralCode) {
      const newCode = getUserIdentifier();
      setReferralCode(newCode);
    }
  }, [referralCode]);

  return (
    <div className="referrals-tab p-2">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Ваша реферальная система</h2>
        <p className="text-sm text-gray-600 mb-4">
          Приглашайте друзей и получайте бонусы! Каждый приглашенный вами игрок даст вам прирост к эффективности действий.
        </p>

        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ваш реферальный код</CardTitle>
            <CardDescription>Поделитесь этим кодом с друзьями</CardDescription>
          </CardHeader>
          <CardContent>
            {isLinkLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="flex">
                <Input 
                  value={referralCode || 'Загрузка...'}
                  readOnly
                  className="
