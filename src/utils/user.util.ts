/**
 * Helper lấy chữ cái viết tắt từ tên người dùng (ghép chữ cái đầu của Họ và Tên).
 * Ví dụ: 
 * - "Nguyễn Văn Bằng" => "NB"
 * - "John Doe" => "JD"
 * - "Bằng" => "B"
 */
export function getInitials(fullName?: string | null, email?: string | null): string {
  if (fullName?.trim()) {
    const words = fullName.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0][0].toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  if (email?.trim()) {
    return email.trim().slice(0, 2).toUpperCase();
  }
  return '??';
}
