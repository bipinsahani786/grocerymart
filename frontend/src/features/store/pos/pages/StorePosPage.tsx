import { UnderMaintenance } from '../../components/UnderMaintenance';

export default function StorePosPage() {
  return (
    <UnderMaintenance 
      title="POS Counter Offline" 
      description="We are currently upgrading the POS billing gateway to support offline UPI syncing and secondary terminal cash drawers. Please use the Order Queue or live registers for manual handover."
      etaHours={2}
    />
  );
}
