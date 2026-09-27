import OrderList from '../../features/orders/OrderList';
import { CustomRequests } from '../../features/custom/CustomRequests';
export default function AdminGlobalOrdersPage(){return <div className='space-y-10'><OrderList admin/><CustomRequests admin/></div>;}
