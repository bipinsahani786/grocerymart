import { UnderMaintenance } from '../../components/UnderMaintenance';

export default function StoreSearchPage() {
  return (
    <UnderMaintenance 
      title="Fuzzy Search Under Maintenance" 
      description="The master barcode catalog search indexing engines are undergoing re-indexing mapping to speed up queries. Full-text search and F2 barcode matches will resume shortly."
      etaHours={1}
    />
  );
}
