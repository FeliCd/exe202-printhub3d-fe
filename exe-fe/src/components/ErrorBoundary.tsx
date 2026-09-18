import { Component, type ReactNode } from 'react';

export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  render() {
    if (this.state.failed) return (
      <section role="alert" className="p-6 rounded-2xl border border-red-500/40 bg-surface space-y-3">
        <h2 className="text-xl font-semibold">Không thể tải nội dung này</h2>
        <p className="text-slate-300">Vui lòng kiểm tra kết nối hoặc tải lại trang. Bạn vẫn có thể chọn mục khác trong menu.</p>
        <button className="rounded-xl px-4 py-2 bg-primary text-slate-950 font-semibold" onClick={() => window.location.reload()}>Tải lại trang</button>
      </section>
    );
    return this.props.children;
  }
}
