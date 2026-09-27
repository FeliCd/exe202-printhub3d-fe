import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
export default function LockOverlayModal() { const {user,logout}=useAuth(); if(!user?.isLocked)return null;
return <Modal open label="Tài khoản bị khóa"><div className="p-6 bg-surface rounded-xl"><p>Vui lòng liên hệ quản trị viên để được hỗ trợ mở khóa tài khoản.</p><button onClick={() => void logout().catch(() => undefined)}>Đăng xuất</button></div></Modal>; }
