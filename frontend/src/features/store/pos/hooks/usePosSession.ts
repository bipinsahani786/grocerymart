import { useState, useMemo } from 'react';

/**
 * Single Responsibility: Manages POS Cashier Session and LocalStorage persistence.
 */
export const usePosSession = (staffList: any[] = []) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>(() => {
    return localStorage.getItem('grocerymart_pos_selected_staff_id') || '';
  });

  const handleSelectStaff = (staffId: string) => {
    setSelectedStaffId(staffId);
    if (staffId) {
      localStorage.setItem('grocerymart_pos_selected_staff_id', staffId);
    } else {
      localStorage.removeItem('grocerymart_pos_selected_staff_id');
    }
  };

  const staffOptions = useMemo(() => {
    if (!staffList || staffList.length === 0) {
      return [{ value: '', label: 'No registered cashiers found' }];
    }

    const cashiers = staffList.filter((s: any) => {
      const r = String(s.role || s.designation || s.user?.role?.name || s.user?.role || '').toUpperCase();
      return r === 'CASHIER' || r.includes('CASHIER');
    });

    const displayList = cashiers.length > 0 ? cashiers : staffList;

    return [
      { value: '', label: 'Select Cashier Name' },
      ...displayList.map((s: any) => ({
        value: s.id || s.userId,
        label: `🧑‍💼 ${s.name || s.user?.name || 'Cashier'}`,
      })),
    ];
  }, [staffList]);

  return {
    selectedStaffId,
    handleSelectStaff,
    staffOptions,
  };
};
