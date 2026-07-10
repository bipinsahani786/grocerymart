import { UnderMaintenance } from '../../components/UnderMaintenance';

export default function StoreProductsPage() {
  return (
    <UnderMaintenance 
      title="Product Catalogue Under Maintenance" 
      description="The product catalog parameters are undergoing database migrations to support multi-store inventory maps. Please access product tables through the unified Inventory tab."
      etaHours={3}
      backUrl="/store/inventory"
      backLabel="Go to Inventory Tab"
    />
  );
}
