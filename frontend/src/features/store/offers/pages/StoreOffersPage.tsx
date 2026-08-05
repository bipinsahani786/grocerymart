import { useState } from 'react';
import { Percent, Plus, Gift, Award } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SearchBar } from '@/components/ui/SearchBar';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { useAuthStore } from '@/store/authStore';
import { 
  useStoreOffers, 
  useCreateStoreOffer, 
  useUpdateStoreOffer, 
  useDeleteStoreOffer,
  useStoreSubscriptions, 
  useCreateStoreSubscription, 
  useUpdateStoreSubscription, 
  useDeleteStoreSubscription 
} from '@/features/store/api/useStorePanel';
import { toast } from 'sonner';

// Subcomponents
import { OfferCard } from '../components/OfferCard';
import { SubscriptionPlanCard } from '../components/SubscriptionPlanCard';
import { OfferFormModal } from '../components/OfferFormModal';
import { SubscriptionFormModal } from '../components/SubscriptionFormModal';

type SubTab = 'offers' | 'subscriptions';

export default function StoreOffersPage() {
  const user = useAuthStore((state) => state.user);
  const storeId = user?.store?.id;

  const [activeTab, setActiveTab] = useState<SubTab>('offers');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // React query data hooks
  const { data: offersResponse, isLoading: loadingOffers } = useStoreOffers(storeId, {
    page: currentPage,
    limit,
    search: searchQuery
  });
  const { data: subsResponse, isLoading: loadingSubs } = useStoreSubscriptions(storeId, {
    page: currentPage,
    limit,
    search: searchQuery
  });

  const offers = offersResponse?.data || [];
  const offersTotal = offersResponse?.total || 0;

  const subscriptions = subsResponse?.data || [];
  const subsTotal = subsResponse?.total || 0;

  // Mutation hooks
  const createOfferMutation = useCreateStoreOffer();
  const updateOfferMutation = useUpdateStoreOffer();
  const deleteOfferMutation = useDeleteStoreOffer();

  const createSubMutation = useCreateStoreSubscription();
  const updateSubMutation = useUpdateStoreSubscription();
  const deleteSubMutation = useDeleteStoreSubscription();

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);

  // Delete confirm modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState<{
    id: string;
    type: 'offer' | 'subscription';
    name: string;
  } | null>(null);

  const totalOffersPages = Math.ceil(offersTotal / limit);
  const totalSubsPages = Math.ceil(subsTotal / limit);

  const handleTabChange = (tab: SubTab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  // Handle Offer Creation submit
  const handleOfferSubmit = (offerData: any) => {
    createOfferMutation.mutate(
      { storeId, payload: offerData },
      {
        onSuccess: () => {
          toast.success('Discount offer created successfully!');
          setShowOfferModal(false);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to create offer');
        }
      }
    );
  };

  // Toggle Offer Active status
  const handleToggleOffer = (id: string, currentStatus: boolean) => {
    updateOfferMutation.mutate(
      { storeId, offerId: id, payload: { isActive: !currentStatus } },
      {
        onSuccess: () => {
          toast.success('Offer status updated!');
        }
      }
    );
  };

  // Prompt triggers for Custom Delete Modal
  const promptDeleteOffer = (id: string, name: string) => {
    setDeleteConfig({ id, type: 'offer', name });
    setShowDeleteModal(true);
  };

  const promptDeleteSub = (id: string, name: string) => {
    setDeleteConfig({ id, type: 'subscription', name });
    setShowDeleteModal(true);
  };

  const executeDelete = () => {
    if (!deleteConfig) return;
    if (deleteConfig.type === 'offer') {
      deleteOfferMutation.mutate(
        { storeId, offerId: deleteConfig.id },
        {
          onSuccess: () => {
            toast.success('Offer code deleted successfully!');
            setShowDeleteModal(false);
          }
        }
      );
    } else {
      deleteSubMutation.mutate(
        { storeId, subscriptionId: deleteConfig.id },
        {
          onSuccess: () => {
            toast.success('Subscription plan deleted successfully!');
            setShowDeleteModal(false);
          }
        }
      );
    }
  };

  // Handle Subscription Plan submit
  const handleSubSubmit = (subData: any) => {
    createSubMutation.mutate(
      { storeId, payload: subData },
      {
        onSuccess: () => {
          toast.success('VIP Subscription Plan created!');
          setShowSubModal(false);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to create plan');
        }
      }
    );
  };

  // Toggle Subscription active status
  const handleToggleSub = (id: string, currentStatus: boolean) => {
    updateSubMutation.mutate(
      { storeId, subscriptionId: id, payload: { isActive: !currentStatus } },
      {
        onSuccess: () => {
          toast.success('Subscription plan status updated!');
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-8">
      <PageHeader 
        icon={Percent}
        title="Offers & Club Membership"
        subtitle="Manage custom discount codes, promotional offers, and customer VIP loyalty subscriptions"
      />

      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-4 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row border-b border-border items-start sm:items-center justify-between gap-4 pb-3">
          <div className="flex gap-4">
            <button
              onClick={() => handleTabChange('offers')}
              className={`pb-3 text-sm font-black uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'offers' 
                  ? 'border-primary-500 text-primary-500' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Promo Offers & Coupons
            </button>
            <button
              onClick={() => handleTabChange('subscriptions')}
              className={`pb-3 text-sm font-black uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'subscriptions' 
                  ? 'border-primary-500 text-primary-500' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              VIP Subscription Clubs
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto self-stretch sm:self-auto">
            <SearchBar 
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={activeTab === 'offers' ? "Search coupon code..." : "Search VIP plans..."}
              wrapperClassName="flex-1 sm:w-60 h-9"
            />
            
            <CustomDropdown
              options={[
                { value: 5, label: '5 Per Page' },
                { value: 10, label: '10 Per Page' },
                { value: 20, label: '20 Per Page' },
                { value: 50, label: '50 Per Page' }
              ]}
              value={limit}
              onChange={(val) => {
                setLimit(parseInt(val));
                setCurrentPage(1);
              }}
              className="w-32 shrink-0"
            />

            <Button
              variant="brand"
              size="sm"
              onClick={() => activeTab === 'offers' ? setShowOfferModal(true) : setShowSubModal(true)}
              className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide h-9 rounded-lg shrink-0"
            >
              <Plus className="h-4 w-4" /> Create {activeTab === 'offers' ? 'New Offer' : 'New VIP Pass'}
            </Button>
          </div>
        </div>

        {/* ========================================================
            TAB: PROMO OFFERS & COUPONS
            ======================================================== */}
        {activeTab === 'offers' && (
          <div className="space-y-6 animate-page-enter">
            {loadingOffers ? (
              <div className="text-center py-12 text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
                Fetching Active Promo Campaigns...
              </div>
            ) : offersTotal === 0 ? (
              searchQuery ? (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-border">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No matching promo coupon offers found.</p>
                </div>
              ) : (
                <EmptyState
                  icon={<Gift className="h-6 w-6 text-primary-500" />}
                  title="No Active Campaigns"
                  description="Start running offers like '200off on orders above 1000' to boost sales conversions."
                  action={
                    <Button 
                      onClick={() => setShowOfferModal(true)} 
                      variant="outline" 
                      size="sm"
                      className="text-xs uppercase font-extrabold h-9 rounded-lg"
                    >
                      Configure Coupon Code
                    </Button>
                  }
                  className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-border"
                />
              )
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {offers.map((offer: any) => (
                    <OfferCard 
                      key={offer.id} 
                      offer={offer} 
                      onToggle={handleToggleOffer} 
                      onDelete={(id) => promptDeleteOffer(id, offer.code)} 
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalOffersPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border pt-4 mt-6">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                      Showing {limit * (currentPage - 1) + 1} - {Math.min(limit * currentPage, offersTotal)} of {offersTotal} offers
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className="h-8 text-[10px] font-black uppercase tracking-wider px-3 rounded-lg"
                      >
                        Prev
                      </Button>
                      <span className="text-xs font-bold text-slate-800 dark:text-white px-2">
                        Page {currentPage} of {totalOffersPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalOffersPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalOffersPages))}
                        className="h-8 text-[10px] font-black uppercase tracking-wider px-3 rounded-lg"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB: VIP SUBSCRIPTION CLUBS
            ======================================================== */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6 animate-page-enter">
            {loadingSubs ? (
              <div className="text-center py-12 text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
                Fetching Subscription Clubs...
              </div>
            ) : subsTotal === 0 ? (
              searchQuery ? (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-border">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No matching VIP subscription plans found.</p>
                </div>
              ) : (
                <EmptyState
                  icon={<Award className="h-6 w-6 text-purple-500" />}
                  title="No Membership Clubs"
                  description="Create membership plans (like free delivery passes or monthly grocery boxes) to capture recurring store loyalty."
                  action={
                    <Button 
                      onClick={() => setShowSubModal(true)} 
                      variant="outline" 
                      size="sm"
                      className="text-xs uppercase font-extrabold h-9 rounded-lg"
                    >
                      Configure VIP Pass
                    </Button>
                  }
                  className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-border"
                />
              )
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subscriptions.map((sub: any) => (
                    <SubscriptionPlanCard 
                      key={sub.id} 
                      sub={sub} 
                      onToggle={handleToggleSub} 
                      onDelete={(id) => promptDeleteSub(id, sub.name)} 
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalSubsPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border pt-4 mt-6">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                      Showing {limit * (currentPage - 1) + 1} - {Math.min(limit * currentPage, subsTotal)} of {subsTotal} plans
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className="h-8 text-[10px] font-black uppercase tracking-wider px-3 rounded-lg"
                      >
                        Prev
                      </Button>
                      <span className="text-xs font-bold text-slate-800 dark:text-white px-2">
                        Page {currentPage} of {totalSubsPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalSubsPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalSubsPages))}
                        className="h-8 text-[10px] font-black uppercase tracking-wider px-3 rounded-lg"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Offer Form Modal */}
      <OfferFormModal 
        isOpen={showOfferModal} 
        onClose={() => setShowOfferModal(false)} 
        onSubmit={handleOfferSubmit}
        isSaving={createOfferMutation.isPending}
      />

      {/* Subscription Form Modal */}
      <SubscriptionFormModal 
        isOpen={showSubModal} 
        onClose={() => setShowSubModal(false)} 
        onSubmit={handleSubSubmit}
        isSaving={createSubMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfig(null);
        }}
        onConfirm={executeDelete}
        title={`Delete ${deleteConfig?.type === 'offer' ? 'Coupon Campaign' : 'VIP Subscription Plan'}`}
        description={`Are you sure you want to permanently delete this ${deleteConfig?.type === 'offer' ? 'discount offer campaign' : 'VIP loyalty pass'}? This action is destructive and cannot be undone.`}
        itemName={deleteConfig?.name}
      />

    </div>
  );
}
