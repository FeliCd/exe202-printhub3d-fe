import { Link, useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { PageHeader, secondary } from '../components/DataUI';
import CustomRequestForm from '../features/custom/CustomRequestForm';

export default function BulkOrderPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 pb-12">
      <PageHeader
        title="Đặt hàng số lượng lớn"
        description="Gửi tệp và số lượng cần in để xưởng báo giá cho lớp học, câu lạc bộ hoặc dự án."
        icon={Layers}
        actions={<Link className={secondary} to="/quotations">Xem báo giá</Link>}
      />
      <CustomRequestForm bulk onCreated={() => navigate('/quotations')} />
    </div>
  );
}
