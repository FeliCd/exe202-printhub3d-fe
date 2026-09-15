import { useState } from 'react';
import { ShieldCheck, Lock, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PasscodeModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function PasscodeModal({
  isOpen,
  title = 'Xác thực Mã Passcode Ví',
  subtitle = 'Nhập mã PIN 6 số bảo mật để hoàn tất giao dịch',
  onSuccess,
  onClose,
}: PasscodeModalProps) {
  const { verifyPasscode } = useAuth();
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newPin = [...pin];
    newPin[index] = val.slice(-1);
    setPin(newPin);
    setError(false);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`pin-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredPin = pin.join('');
    if (enteredPin.length < 6) {
      setError(true);
      return;
    }

    if (verifyPasscode(enteredPin)) {
      onSuccess();
      setPin(['', '', '', '', '', '']);
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#18191d] border border-[#272930] rounded-2xl shadow-2xl overflow-hidden p-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center text-slate-400">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#272930] hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 text-[#22c55e]" />
            {title}
          </h3>
          <p className="text-xs text-[#94a3b8] mt-1">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center gap-2">
            {pin.map((digit, idx) => (
              <input
                key={idx}
                id={`pin-input-${idx}`}
                type="password"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-10 h-12 text-center text-lg font-bold rounded-xl bg-[#111215] border outline-none transition focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] ${
                  error ? 'border-red-500 text-red-400' : 'border-[#272930] text-white'
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-xs text-red-400 animate-bounce">Mã PIN không đúng (PIN thử nghiệm: 123456)</p>
          )}

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-[#1e2025] hover:bg-[#272930] text-xs font-bold text-slate-300 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 transition"
            >
              Xác nhận
            </button>
          </div>
        </form>

        <p className="text-[10px] text-[#94a3b8]">
          Gợi ý: Mặc định thử nghiệm mã Passcode là <span className="text-[#22c55e] font-mono font-bold">123456</span>
        </p>
      </div>
    </div>
  );
}
