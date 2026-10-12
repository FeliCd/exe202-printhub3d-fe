import test from 'node:test';
import assert from 'node:assert/strict';
import { AxiosError } from 'axios';
import { getApiErrorMessage } from '../src/utils/apiError.ts';

test('network and timeout failures are distinguished from authentication errors', () => {
  const message = getApiErrorMessage(new AxiosError('Network Error', 'ERR_NETWORK'), 'Đăng nhập thất bại');
  assert.match(message, /Không thể kết nối máy chủ/);
  assert.doesNotMatch(message, /Network Error/);
  assert.match(getApiErrorMessage(new AxiosError('timeout', 'ECONNABORTED'), ''), /phản hồi quá lâu/);
  const denied = new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, { status: 401, data: { message: 'Sai tài khoản hoặc mật khẩu.' } });
  assert.equal(getApiErrorMessage(denied, ''), 'Sai tài khoản hoặc mật khẩu.');
});

test('HTTP failures explain permission, conflicts and retry without showing a transport error', () => {
  for (const [status, pattern] of [[401,/đăng nhập lại/], [403,/quyền/], [409,/tải lại/], [422,/trường đã nhập/], [429,/chờ/], [500,/chưa được lưu/]]) {
    const error = new AxiosError('Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, {status, data:{}});
    assert.match(getApiErrorMessage(error, 'fallback'), pattern);
  }
});
