import axios from 'axios';

interface ApiErrorBody {
  message?: string;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return 'Máy chủ phản hồi quá lâu. Vui lòng thử lại sau ít phút.';
    }
    if (!error.response) {
      return 'Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau. Nếu đang chạy local, hãy khởi động backend và kiểm tra địa chỉ API.';
    }
    if (error.response.data?.message) return error.response.data.message;
    if (error.response.status === 401) return 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.';
    if (error.response.status === 403) return 'Bạn chưa có quyền thực hiện thao tác này. Vui lòng kiểm tra tài khoản đang đăng nhập.';
    if (error.response.status === 409) return 'Dữ liệu đã thay đổi hoặc bị trùng. Vui lòng tải lại và kiểm tra trước khi thử lại.';
    if (error.response.status === 422) return 'Thông tin chưa hợp lệ. Vui lòng kiểm tra các trường đã nhập.';
    if (error.response.status === 429) return 'Bạn thao tác quá nhanh. Vui lòng chờ một lát rồi thử lại.';
    if (error.response.status >= 500) return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau; dữ liệu có thể chưa được lưu.';
    return fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
