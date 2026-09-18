import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus, CheckCircle2 } from 'lucide-react';
import { factoryService } from '../../services/factoryService';

interface FilamentSpool {
  id: string;
  material: 'PLA Pro+' | 'PETG' | 'ABS' | 'Resin UV';
  color: string;
  brand: string;
  weightRemainingGrams: number;
  totalCapacityGrams: number;
  spoolCount: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

const mockInventory: FilamentSpool[] = [
  { id: 'SPOOL-01', material: 'PLA Pro+', color: 'Emerald Green (Chủ đạo)', brand: 'eSUN', weightRemainingGrams: 4200, totalCapacityGrams: 5000, spoolCount: 5, status: 'IN_STOCK' },
  { id: 'SPOOL-02', material: 'PLA Pro+', color: 'Black (Đen Nhám)', brand: 'Bambu Lab', weightRemainingGrams: 2800, totalCapacityGrams: 3000, spoolCount: 3, status: 'IN_STOCK' },
  { id: 'SPOOL-03', material: 'PETG', color: 'Transparent Clear', brand: 'Sunlu', weightRemainingGrams: 450, totalCapacityGrams: 2000, spoolCount: 1, status: 'LOW_STOCK' },
  { id: 'SPOOL-04', material: 'Resin UV', color: 'White Optical', brand: 'Anycubic', weightRemainingGrams: 1200, totalCapacityGrams: 1500, spoolCount: 2, status: 'IN_STOCK' },
  { id: 'SPOOL-05', material: 'ABS', color: 'Industrial Grey', brand: 'FormFutura', weightRemainingGrams: 0, totalCapacityGrams: 1000, spoolCount: 0, status: 'OUT_OF_STOCK' },
];

export default function FactoryInventoryPage() {
  const [spools, setSpools] = useState<FilamentSpool[]>(mockInventory);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await factoryService.getInventory();
        const data = res?.result || res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          setSpools(data);
        }
      } catch (error) {
        console.warn('Backend inventory API error, using mock inventory:', error);
      }
    };
    fetchInventory();
  }, []);

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400">
            <Package className="w-6 h-6" />
            <h1 className="text-2xl font-black text-white">Quản Lý Kho Nhựa &amp; Vật Tư (Filament Inventory)</h1>
          </div>
          <p className="text-sm text-text-muted">
            Theo dõi lượng nhựa FDM/SLA thực tế còn tồn trong kho xưởng để đưa ra quyết định nhận các Đơn Hàng Hàng Loạt.
          </p>
        </div>

        <button disabled aria-description="Chức năng chưa khả dụng trong bản dùng thử" className="px-4 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs hover:bg-cyan-300 transition flex items-center gap-2 shadow-lg shrink-0">
          <Plus className="w-4 h-4" /> Nhập Cuộn Nhựa Mới
        </button>
      </div>

      {/* Stock Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
          <p className="text-sm text-text-muted">Tổng Trọng Lượng Nhựa Kho</p>
          <p className="text-2xl font-black text-cyan-400">8.65 kg</p>
          <span className="text-xs text-emerald-400 font-bold">11 cuộn đang gá máy</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
          <p className="text-sm text-text-muted">Nhựa PLA Pro+ Chủ Đạo</p>
          <p className="text-2xl font-black text-[#39FF14]">7.0 kg</p>
          <span className="text-xs text-text-muted">Đủ cho ~165 thước 20cm</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
          <p className="text-sm text-text-muted">Cảnh Báo Sắp Hết Hàng</p>
          <p className="text-2xl font-black text-amber-400">2 Loại</p>
          <span className="text-xs text-amber-400 font-bold">PETG Clear &amp; ABS Grey</span>
        </div>
      </div>

      {/* Spools Table */}
      <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Danh Sách Cuộn Nhựa &amp; Resin Trong Kho</h3>

        <div className="divide-y divide-[#272930] text-xs">
          {spools.map(spool => (
            <div key={spool.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-black text-xs shrink-0">
                  {spool.material.substring(0, 3)}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{spool.material} - {spool.color}</h4>
                  <p className="text-text-muted text-sm">Thương hiệu: {spool.brand} • Cuộn khả dụng: {spool.spoolCount} cuộn</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-text-muted block text-xs">Trọng lượng còn:</span>
                  <strong className="text-white font-mono">{spool.weightRemainingGrams}g / {spool.totalCapacityGrams}g</strong>
                </div>

                <div>
                  {spool.status === 'IN_STOCK' && (
                    <span className="px-3 py-1 rounded-full bg-emerald-950 text-[#39FF14] border border-emerald-800 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Còn Hàng
                    </span>
                  )}
                  {spool.status === 'LOW_STOCK' && (
                    <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-bold text-xs flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Sắp Hết
                    </span>
                  )}
                  {spool.status === 'OUT_OF_STOCK' && (
                    <span className="px-3 py-1 rounded-full bg-red-950 text-red-400 border border-red-800 font-bold text-xs">
                      Hết Hàng
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
